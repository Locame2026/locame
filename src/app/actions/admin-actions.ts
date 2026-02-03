'use server';

import { db } from '@/lib/db';
import { getAppSession } from '@/lib/auth.wrapper';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/password';

/**
 * Platform Admin Actions
 */

async function ensureAdmin() {
    const session = await getAppSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('No autorizado');
    }
    return session;
}

// --- USER MANAGEMENT ---

export async function deleteUser(userId: string) {
    try {
        await ensureAdmin();

        // Check if user has a restaurant and delete it
        const [user] = await db.query`SELECT restaurant_id FROM user_profiles WHERE id = ${userId}`;
        if (user?.restaurant_id) {
            await db.query`DELETE FROM restaurants WHERE id = ${user.restaurant_id}`;
        }

        await db.query`DELETE FROM user_profiles WHERE id = ${userId}`;
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: deleteUser failed:', error);
        return { success: false, error: error.message };
    }
}

export async function resetUserPassword(userId: string, newPassword: string) {
    try {
        await ensureAdmin();
        const hashedPassword = await hashPassword(newPassword);
        await db.query`UPDATE user_profiles SET password_hash = ${hashedPassword} WHERE id = ${userId}`;
        return { success: true };
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: resetUserPassword failed:', error);
        return { success: false, error: error.message };
    }
}

// --- REVIEW MANAGEMENT ---

export async function getAllReviews() {
    try {
        await ensureAdmin();
        return await db.query`
            SELECT r.*, u.first_name, u.email, rs.name as restaurant_name
            FROM reviews r
            JOIN user_profiles u ON r.user_id = u.id
            JOIN restaurants rs ON r.restaurant_id = rs.id
            ORDER BY r.created_at DESC
        `;
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: getAllReviews failed:', error);
        return [];
    }
}

export async function deleteReview(reviewId: string) {
    try {
        await ensureAdmin();
        await db.query`DELETE FROM reviews WHERE id = ${reviewId}`;
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: deleteReview failed:', error);
        return { success: false, error: error.message };
    }
}

// --- RESTAURANT MANAGEMENT ---

export async function toggleRestaurantPremium(restaurantId: string, isPremium: boolean) {
    try {
        await ensureAdmin();
        await db.query`UPDATE restaurants SET is_premium = ${isPremium} WHERE id = ${restaurantId}`;
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: toggleRestaurantPremium failed:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteRestaurant(restaurantId: string) {
    try {
        await ensureAdmin();
        await db.query`DELETE FROM restaurants WHERE id = ${restaurantId}`;
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: deleteRestaurant failed:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllRestaurants() {
    try {
        await ensureAdmin();
        return await db.query`SELECT * FROM restaurants ORDER BY name ASC`;
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: getAllRestaurants failed:', error);
        return [];
    }
}

// --- COMPANY MANAGEMENT ---

export async function getAllCompanies() {
    try {
        await ensureAdmin();
        return await db.query`SELECT * FROM companies ORDER BY name ASC`;
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: getAllCompanies failed:', error);
        return [];
    }
}

export async function updateCompanyBalance(companyId: string, amount: number) {
    try {
        await ensureAdmin();
        await db.query`UPDATE companies SET available_balance = available_balance + ${amount} WHERE id = ${companyId}`;
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: updateCompanyBalance failed:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteCompany(companyId: string) {
    try {
        await ensureAdmin();
        await db.query`DELETE FROM companies WHERE id = ${companyId}`;
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: deleteCompany failed:', error);
        return { success: false, error: error.message };
    }
}

// --- REPORTS ---

export async function getGlobalB2BReport() {
    try {
        await ensureAdmin();
        return await db.query`
            SELECT c.name as company_name, 
                   COUNT(t.id) as total_uses, 
                   SUM(t.subsidy_amount) as total_subsidy
            FROM companies c
            LEFT JOIN b2b_transactions t ON c.id = t.company_id
            GROUP BY c.id, c.name
            ORDER BY total_subsidy DESC
        `;
    } catch (error: any) {
        console.error('ADMIN_ACTION_ERROR: getGlobalB2BReport failed:', error);
        return [];
    }
}
