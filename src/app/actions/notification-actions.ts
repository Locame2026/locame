'use server';

import { db } from '@/lib/db';
import { push } from '@/lib/push.wrapper';

/**
 * Acciones de servidor para la gestión de notificaciones.
 */

export async function saveSubscription(userId: string, subscription: any, deviceInfo?: string) {
    try {
        await db.query`
            INSERT INTO notification_subscriptions (user_id, subscription_json, device_info)
            VALUES (${userId}, ${subscription}, ${deviceInfo || null})
            ON CONFLICT (user_id, subscription_json) DO UPDATE SET updated_at = now()
        `;
        return { success: true };
    } catch (error: any) {
        console.error('ACTION_SAVE_SUBSCRIPTION_ERROR:', error);
        return { success: false, error: error.message };
    }
}

export async function sendPushToUser(userId: string, title: string, body: string, data?: any) {
    try {
        // 1. Obtener todas las suscripciones del usuario
        const subscriptions = await db.query`
            SELECT * FROM notification_subscriptions WHERE user_id = ${userId}
        `;

        if (subscriptions.length === 0) return { success: false, error: 'No subscriptions found' };

        // 2. Enviar a cada una (Regla II.4)
        const results = await Promise.all(subscriptions.map(async (sub: any) => {
            const res = await push.sendNotification(sub.subscription_json, {
                title,
                body,
                ...data
            });

            if (res && (res as any).expired) {
                // Limpiar suscripción expirada
                await db.query`DELETE FROM notification_subscriptions WHERE id = ${sub.id}`;
            }
            return res;
        }));

        // 3. Registrar en el historial
        await db.query`
            INSERT INTO notifications (user_id, title, body, data, status)
            VALUES (${userId}, ${title}, ${body}, ${data || null}, 'SENT')
        `;

        return { success: true };
    } catch (error: any) {
        console.error('ACTION_SEND_PUSH_ERROR:', error);
        return { success: false, error: error.message };
    }
}
