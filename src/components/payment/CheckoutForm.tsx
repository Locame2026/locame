
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { createPaymentSession } from '@/app/actions/payment-actions';

// Proveedor de Stripe (Cargado una sola vez)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
    restaurantId: string;
    userId: string;
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

function PaymentForm({ amount, onSuccess, onCancel }: { amount: number, onSuccess: () => void, onCancel: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard?payment=success`,
            },
            redirect: 'if_required',
        });

        if (submitError) {
            setError(submitError.message || 'Error al procesar el pago');
            setProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <PaymentElement />

            {error && (
                <div className="error-message glass">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <div className="actions">
                <button type="button" className="cancel-btn" onClick={onCancel} disabled={processing}>
                    Cancelar
                </button>
                <button type="submit" className="pay-btn" disabled={!stripe || processing}>
                    {processing ? <Loader2 className="animate-spin" size={20} /> : `Pagar ${amount}€`}
                </button>
            </div>

            <style jsx>{`
                .payment-form { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 400px; }
                .error-message { display: flex; align-items: center; gap: 8px; padding: 12px; color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.3); border-radius: 12px; font-size: 0.9rem; }
                .actions { display: flex; gap: 12px; margin-top: 10px; }
                .pay-btn { flex: 1; background: var(--primary); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; justify-content: center; align-items: center; }
                .pay-btn:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
                .pay-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                .cancel-btn { padding: 14px 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: var(--text-dim); border-radius: 12px; cursor: pointer; transition: var(--transition-smooth); }
                .cancel-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-main); }
            `}</style>
        </form>
    );
}

export default function CheckoutContainer({ restaurantId, userId, amount, onSuccess, onCancel }: CheckoutFormProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initSession() {
            const res = await createPaymentSession(userId, restaurantId, amount);
            if (res.success && res.clientSecret) {
                setClientSecret(res.clientSecret);
            }
            setLoading(false);
        }
        initSession();
    }, [userId, restaurantId, amount]);

    if (loading) return (
        <div className="checkout-loading">
            <Loader2 className="animate-spin" size={40} />
            <p>Iniciando pago seguro...</p>
            <style jsx>{`
                .checkout-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px; color: var(--text-dim); }
            `}</style>
        </div>
    );

    if (!clientSecret) return <p>Error al iniciar Stripe. Verifica las claves API.</p>;

    return (
        <div className="checkout-container glass">
            <div className="header">
                <ShieldCheck size={24} className="safe-icon" />
                <h3>Pago Seguro con Stripe</h3>
            </div>

            <Elements stripe={stripePromise} options={{
                clientSecret,
                appearance: {
                    theme: 'night',
                    variables: {
                        colorPrimary: '#f06292', // Rosa LOCAME
                        colorBackground: '#1a1a1a',
                        colorText: '#ffffff',
                    }
                }
            }}>
                <PaymentForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
            </Elements>

            <style jsx>{`
                .checkout-container { padding: 24px; border-radius: var(--radius-xl); border: 1px solid var(--glass-border); display: flex; flex-direction: column; align-items: center; gap: 20px; }
                .header { display: flex; align-items: center; gap: 12px; width: 100%; }
                .header h3 { font-size: 1.1rem; font-weight: 500; }
                .safe-icon { color: var(--primary); }
            `}</style>
        </div>
    );
}
