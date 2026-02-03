'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ amount, onSuccess }: { amount: string, onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/client/map?payment=success',
            },
            redirect: 'if_required'
        });

        if (result.error) {
            setError(result.error.message || 'Error en el pago');
        } else {
            onSuccess();
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <PaymentElement />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={!stripe || loading} className="pay-btn">
                {loading ? 'Procesando...' : `Pagar ${amount}€`}
            </button>
        </form>
    );
}

export default function PaymentContainer({ restaurantId, userId, amount, onSuccess, onCancel }: { restaurantId: string, userId: string, amount: string, onSuccess: () => void, onCancel: () => void }) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    // En una implementación real, aquí llamaríamos al backend para crear el PaymentIntent
    // Para simplificar el ejemplo build, solo mostramos un modal simulado si no hay stripe key
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        return (
            <div className="checkout-modal glass">
                <h3>Pago seguro (Demo)</h3>
                <p>Módulo de pago simulado para la demo.</p>
                <div className="checkout-actions">
                    <button onClick={onSuccess} className="btn-primary">Simular Pago Exitoso</button>
                    <button onClick={onCancel} className="btn-secondary">Cancelar</button>
                </div>
                <style jsx>{`
                    .checkout-modal { background: white; padding: 32px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; }
                    .checkout-actions { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="checkout-modal glass">
            {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm amount={amount} onSuccess={onSuccess} />
                </Elements>
            ) : (
                <p>Cargando pasarela...</p>
            )}
            <button onClick={onCancel} className="close-btn">X</button>
        </div>
    );
}
