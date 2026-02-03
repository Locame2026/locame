'use server';

import { db } from '@/lib/db';
import { getAppSession } from '@/lib/auth.wrapper';
import { revalidatePath } from 'next/cache';

/**
 * SoC: Business logic layer for Digital Canteen (LOCAME Business)
 */

/**
 * Checks if a user has a subsidy available for today.
 */
export async function getEmployeeSubsidyStatus(userId: string) {
    try {
        const session = await getAppSession();
        if (!session || session.userId !== userId) {
            return { hasSubsidy: false, amount: 0, reason: 'No valid session' };
        }

        // 1. Get employee company and limit
        const [employeeInfo] = await db.query`
            SELECT ce.company_id, ce.daily_subsidy_limit, c.available_balance, c.name as company_name
            FROM company_employees ce
            JOIN companies c ON ce.company_id = c.id
            WHERE ce.employee_id = ${userId} AND c.plan_active = true
        `;

        if (!employeeInfo) {
            return { hasSubsidy: false, amount: 0, reason: 'Not an employee' };
        }

        // 2. Check if already used today
        const [todayTransaction] = await db.query`
            SELECT id FROM b2b_transactions
            WHERE employee_id = ${userId}
            AND transaction_date::date = CURRENT_DATE
        `;

        if (todayTransaction) {
            return { hasSubsidy: false, amount: 0, reason: 'Subsidy already used today' };
        }

        // 3. Check company balance
        if (employeeInfo.available_balance < employeeInfo.daily_subsidy_limit) {
            // If partial balance available, we could apply it, but rules say "insufficient saldo" handling.
            // For now, let's say "no saldo" if not enough for the full limit.
            return { hasSubsidy: false, amount: 0, reason: 'Company balance insufficient' };
        }

        return {
            hasSubsidy: true,
            amount: parseFloat(employeeInfo.daily_subsidy_limit),
            companyName: employeeInfo.company_name,
            companyId: employeeInfo.company_id
        };
    } catch (error) {
        console.error('BUSINESS_ACTION_ERROR: getEmployeeSubsidyStatus failed:', error);
        return { hasSubsidy: false, amount: 0, error: 'Internal error' };
    }
}

/**
 * Processes a split payment: company subsidy + employee remainder.
 * This is a transactional operation.
 */
export async function processSplitPayment(userId: string, menuPrice: number, restaurantId: string) {
    try {
        const session = await getAppSession();
        if (!session || session.userId !== userId) {
            throw new Error('Unauthorized');
        }

        // Transaction block (Regla II.3)
        return await db.begin(async (tx) => {
            // 1. Re-validate subsidy status inside transaction for consistency
            const [employeeInfo] = await tx`
                SELECT ce.company_id, ce.daily_subsidy_limit, c.available_balance
                FROM company_employees ce
                JOIN companies c ON ce.company_id = c.id
                WHERE ce.employee_id = ${userId} AND c.plan_active = true
                FOR UPDATE OF c -- Lock company row to prevent race conditions on balance
            `;

            if (!employeeInfo || employeeInfo.available_balance < employeeInfo.daily_subsidy_limit) {
                return { success: false, error: 'Subsidio no disponible o saldo insuficiente' };
            }

            // 2. Check double spending
            const [todayTransaction] = await tx`
                SELECT id FROM b2b_transactions
                WHERE employee_id = ${userId}
                AND transaction_date::date = CURRENT_DATE
            `;

            if (todayTransaction) {
                return { success: false, error: 'Ya has utilizado tu subsidio hoy' };
            }

            const subsidyAmount = Math.min(parseFloat(employeeInfo.daily_subsidy_limit), menuPrice);
            const employeeAmount = menuPrice - subsidyAmount;

            // 3. Deduct company balance
            await tx`
                UPDATE companies 
                SET available_balance = available_balance - ${subsidyAmount}
                WHERE id = ${employeeInfo.company_id}
            `;

            // 4. Register transaction
            await tx`
                INSERT INTO b2b_transactions (company_id, employee_id, restaurant_id, subsidy_amount, menu_price)
                VALUES (${employeeInfo.company_id}, ${userId}, ${restaurantId}, ${subsidyAmount}, ${menuPrice})
            `;

            return {
                success: true,
                breakdown: {
                    subsidy: subsidyAmount,
                    employeeRemaining: employeeAmount,
                    total: menuPrice
                }
            };
        });
    } catch (error) {
        console.error('BUSINESS_ACTION_ERROR: processSplitPayment failed:', error);
        return { success: false, error: 'Error al procesar el pago' };
    }
}
