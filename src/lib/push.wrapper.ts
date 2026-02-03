import * as webpush from 'web-push';

/**
 * AGNOSTICISMO DE DEPENDENCIAS (Regla I.2)
 * Wrapper para Web Push.
 */

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:localizatumenu@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export const push = {
    /**
     * Envía una notificación push a una suscripción específica
     */
    sendNotification: async (subscription: any, payload: any) => {
        if (!vapidPublicKey || !vapidPrivateKey) {
            console.warn('VAPID keys missing. Push notification will not be sent.');
            return;
        }

        try {
            return await webpush.sendNotification(
                subscription,
                JSON.stringify(payload)
            );
        } catch (error: any) {
            console.error('PUSH_SEND_ERROR:', error);
            if (error.statusCode === 410 || error.statusCode === 404) {
                // Suscripción expirada o inválida
                return { expired: true };
            }
            throw error;
        }
    },

    /**
     * Genera un nuevo set de llaves VAPID (Utility)
     */
    generateVAPIDKeys: () => {
        return webpush.generateVAPIDKeys();
    }
};
