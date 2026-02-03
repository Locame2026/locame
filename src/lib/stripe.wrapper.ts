
import Stripe from 'stripe';

/**
 * STRIPE WRAPPER (Regla I.2: Agnosticismo de Dependencias)
 * Encapsula la lógica de Stripe para facilitar cambios futuros.
 */

let stripeInstance: Stripe | null = null;

function getStripe() {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn('STRIPE_SECRET_KEY is not defined in environment variables. Using placeholder for build.');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }
    return stripeInstance;
}

export class StripeWrapper {
    /**
     * Crea un Payment Intent para un pago directo.
     */
    static async createPaymentIntent(amount: number, currency: string = 'eur', metadata: any = {}) {
        try {
            const paymentIntent = await getStripe().paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe usa céntimos
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
            };
        } catch (error: any) {
            console.error('STRIPE_CREATE_PAYMENT_INTENT_ERROR:', error);
            throw new Error(`Error al crear el intento de pago: ${error.message}`);
        }
    }

    /**
     * Recupera un Payment Intent por su ID.
     */
    static async retrievePaymentIntent(id: string) {
        try {
            return await getStripe().paymentIntents.retrieve(id);
        } catch (error: any) {
            console.error('STRIPE_RETRIEVE_PAYMENT_INTENT_ERROR:', error);
            throw new Error(`Error al recuperar el intento de pago: ${error.message}`);
        }
    }

    /**
     * Verifica la firma del webhook de Stripe.
     */
    static constructEvent(payload: string | Buffer, sig: string, secret: string) {
        try {
            return getStripe().webhooks.constructEvent(payload, sig, secret);
        } catch (error: any) {
            console.error('STRIPE_WEBHOOK_VERIFICATION_ERROR:', error);
            throw new Error(`error en la verificación del webhook: ${error.message}`);
        }
    }
}
