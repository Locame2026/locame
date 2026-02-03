'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { handleForgotPassword } from '../actions';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData();
        formData.append('email', email);

        const result = await handleForgotPassword(formData);

        if (result.error) {
            setError(result.error);
        } else {
            setMessage(result.message || 'Solicitud procesada');
        }
        setLoading(false);
    };

    return (
        <div className="auth-wrapper">
            <div className="glow-top"></div>
            <div className="auth-card glass">
                <header className="auth-header">
                    <div className="logo-icon-wrapper">
                        <Image src="/logo-new.jpg" alt="LOCAME" width={150} height={150} className="auth-logo" />
                    </div>
                    <h1 className="brand-font gradient-text" style={{ fontSize: '3rem' }}>Recuperar</h1>
                    <p className="brand-script">Accede de nuevo a tu mundo</p>
                </header>

                {message ? (
                    <div className="success-container">
                        <div className="icon">✉️</div>
                        <p>{message}</p>
                        <Link href="/auth" className="back-btn">Volver al inicio</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label>Email de tu cuenta</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@locame.es"
                                required
                                className="input-field"
                            />
                        </div>

                        {error && <p className="error-msg">{error}</p>}

                        <button type="submit" disabled={loading} className="btn-primary submit-btn">
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                        </button>

                        <Link href="/auth" className="back-btn">Cancelar y volver</Link>
                    </form>
                )}
            </div>

            <style jsx>{`
                .auth-wrapper { min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 40px 20px; background: #ffffff; position: relative; overflow: hidden; }
                .glow-top { position: absolute; top: -15%; right: -5%; width: 60%; height: 60%; background: radial-gradient(circle, rgba(255, 204, 51, 0.15) 0%, transparent 70%); z-index: 1; filter: blur(60px); }
                .auth-card { width: 100%; max-width: 500px; padding: 60px 40px; z-index: 10; border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(20px); border-radius: 40px; box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.15); }
                .auth-header { text-align: center; margin-bottom: 40px; }
                .logo-icon-wrapper { margin-bottom: 20px; display: flex; justify-content: center; }
                .auth-logo { border-radius: 20px; }
                .brand-font { font-family: 'Anton', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
                .brand-script { font-family: 'Dancing Script', cursive; font-size: 1.8rem; color: var(--primary); margin-top: -5px; }
                .gradient-text { background: linear-gradient(135deg, #111827 0%, #ffcc33 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .auth-form { display: flex; flex-direction: column; gap: 24px; }
                .input-group label { display: block; font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px; text-align: left; }
                .input-field { width: 100%; padding: 14px 18px; border-radius: 14px; border: 1px solid var(--glass-border); background: white; color: #1a1a1a; font-size: 1rem; }
                .submit-btn { padding: 18px; border-radius: 18px; background: var(--primary); color: black !important; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.3s; }
                .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(255, 204, 51, 0.3); }
                .back-btn { text-align: center; color: var(--text-muted); font-weight: 600; text-decoration: underline; font-size: 0.9rem; margin-top: 10px; }
                .success-container { text-align: center; display: flex; flex-direction: column; gap: 20px; align-items: center; }
                .success-container .icon { font-size: 4rem; }
                .error-msg { color: #b91c1c; font-size: 0.9rem; font-weight: 600; background: #fef2f2; padding: 12px; border-radius: 12px; }
            `}</style>
        </div>
    );
}
