
import { NextResponse } from 'next/server';
import { StripeWrapper } from '@/lib/stripe.wrapper';
import { confirmTransaction } from '@/app/actions/payment-actions';

/**
 * STRIPE WEBHOOK HANDLER (Regla II.2)
 */

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    let event;

    try {
        event = StripeWrapper.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Manejar el evento
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent.id);
            await confirmTransaction(paymentIntent.id);
            break;

        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;
            console.error('Payment failed:', failedIntent.id, failedIntent.last_payment_error?.message);
            // Podríamos actualizar el estado a 'failed' en la DB si fuera necesario
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
