'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { handleResetPassword } from '../actions';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="error-container">
                <p>Enlace de recuperación inválido o expirado.</p>
                <button onClick={() => router.push('/auth')} className="back-btn">Volver al inicio</button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('token', token);
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);

        const result = await handleResetPassword(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => router.push('/auth'), 3000);
        }
    };

    return (
        <div className="reset-container">
            {success ? (
                <div className="success-state">
                    <div className="icon">✅</div>
                    <h2>¡Contraseña actualizada!</h2>
                    <p>Serás redirigido al inicio en unos segundos...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Nueva Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="input-field"
                            />
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Confirmar Nueva Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="input-field"
                            />
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary submit-btn">
                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="auth-wrapper">
            <div className="glow-bottom"></div>
            <div className="auth-card glass">
                <header className="auth-header">
                    <div className="logo-icon-wrapper">
                        <Image src="/logo-new.jpg" alt="LOCAME" width={100} height={100} className="auth-logo" />
                    </div>
                    <h1 className="brand-font gradient-text">Nueva Clave</h1>
                    <p className="brand-script">Asegura tu cuenta</p>
                </header>

                <Suspense fallback={<div>Cargando...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>

            <style jsx>{`
                .auth-wrapper { min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 40px 20px; background: #ffffff; position: relative; overflow: hidden; }
                .glow-bottom { position: absolute; bottom: -15%; left: -5%; width: 60%; height: 60%; background: radial-gradient(circle, rgba(255, 204, 51, 0.1) 0%, transparent 70%); z-index: 1; filter: blur(60px); }
                .auth-card { width: 100%; max-width: 500px; padding: 60px 40px; z-index: 10; border: 1px solid var(--glass-border); background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(20px); border-radius: 40px; }
                .auth-header { text-align: center; margin-bottom: 30px; }
                .auth-logo { border-radius: 15px; }
                .brand-font { font-family: 'Anton', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; font-size: 2.5rem; }
                .gradient-text { background: linear-gradient(135deg, #111827 0%, #ffcc33 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .brand-script { font-family: 'Dancing Script', cursive; font-size: 1.6rem; color: var(--primary); }
                .auth-form { display: flex; flex-direction: column; gap: 20px; }
                .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px; text-align: left; }
                .password-wrapper { position: relative; width: 100%; }
                .input-field { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--glass-border); color: #1a1a1a; }
                .toggle-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #666; cursor: pointer; display: flex; align-items: center; padding: 4px; }
                .submit-btn { padding: 16px; border-radius: 16px; background: var(--primary); color: black !important; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; width: 100%; }
                .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(255, 204, 51, 0.2); }
                .success-state { text-align: center; }
                .success-state .icon { font-size: 3rem; margin-bottom: 15px; }
                .error-msg { color: #b91c1c; font-size: 0.85rem; background: #fef2f2; padding: 10px; border-radius: 10px; }
            `}</style>
        </div>
    );
}
