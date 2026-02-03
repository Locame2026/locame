
'use server';

import { sql, db } from '@/lib/db';
import { StripeWrapper } from '@/lib/stripe.wrapper';
import { revalidatePath } from 'next/cache';

/**
 * ACCIONES DE SERVIDOR PARA PAGOS (Regla II.2)
 */

export interface PaymentIntentResponse {
    success: boolean;
    clientSecret?: string;
    transactionId?: string;
    error?: string;
}

/**
 * Crea un intento de pago y registra la transacción inicial.
 */
export async function createPaymentSession(
    userId: string,
    restaurantId: string,
    amount: number,
    menuItems: any[] = []
): Promise<PaymentIntentResponse> {
    try {
        // 1. Crear el Payment Intent en Stripe
        const stripeSession = await StripeWrapper.createPaymentIntent(amount, 'eur', {
            userId,
            restaurantId,
            itemsCount: menuItems.length.toString(),
        });

        // 2. Registrar la transacción como 'pending' en la DB
        const result = await db.query`
            INSERT INTO transactions (
                user_id, 
                restaurant_id, 
                stripe_payment_intent_id, 
                amount, 
                status, 
                menu_items
            ) VALUES (
                ${userId}, 
                ${restaurantId}, 
                ${stripeSession.id}, 
                ${amount}, 
                'pending', 
                ${JSON.stringify(menuItems)}
            ) RETURNING id;
        `;

        return {
            success: true,
            clientSecret: stripeSession.clientSecret || undefined,
            transactionId: result[0].id,
        };
    } catch (error: any) {
        console.error('CREATE_PAYMENT_SESSION_ERROR:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Confirma una transacción (llamado opcionalmente desde el cliente o webhook).
 */
export async function confirmTransaction(stripePaymentIntentId: string) {
    try {
        await sql`
            UPDATE transactions 
            SET status = 'succeeded', updated_at = NOW() 
            WHERE stripe_payment_intent_id = ${stripePaymentIntentId}
        `;
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('CONFIRM_TRANSACTION_ERROR:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene el historial de transacciones de un usuario.
 */
export async function getUserTransactions(userId: string) {
    try {
        return await sql`
            SELECT t.*, r.name as restaurant_name 
            FROM transactions t
            JOIN restaurants r ON t.restaurant_id = r.id
            WHERE t.user_id = ${userId}
            ORDER BY t.created_at DESC
        `;
    } catch (error) {
        console.error('GET_USER_TRANSACTIONS_ERROR:', error);
        return [];
    }
}
