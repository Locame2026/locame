'use client';

import { useState, useEffect } from 'react';

/**
 * Atomic Design: UI Component for Cookie Consent
 * SoC: Handles its own state and persistence.
 * Design: Premium glassmorphism with smooth transitions.
 */
export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user already made a choice
        const consent = localStorage.getItem('locame_cookie_consent');
        if (!consent) {
            // Delay appearance for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleChoice = (choice: 'accepted' | 'rejected') => {
        localStorage.setItem('locame_cookie_consent', choice);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner-overlay">
            <div className="cookie-card glass">
                <div className="cookie-content">
                    <div className="cookie-icon">🍪</div>
                    <div className="cookie-text">
                        <h3>Privacidad y Cookies</h3>
                        <p>
                            Usamos cookies para mejorar tu experiencia en LOCAME, tanto en web como en móvil.
                            ¿Nos das permiso para seguir ofreciéndote el mejor servicio?
                        </p>
                    </div>
                </div>
                <div className="cookie-actions">
                    <button className="btn-secondary mini" onClick={() => handleChoice('rejected')}>
                        Rechazar
                    </button>
                    <button className="btn-primary mini" onClick={() => handleChoice('accepted')}>
                        Aceptar todo
                    </button>
                </div>
            </div>

            <style jsx>{`
                .cookie-banner-overlay {
                    position: fixed;
                    bottom: 30px;
                    left: 20px;
                    right: 20px;
                    display: flex;
                    justify-content: center;
                    z-index: 9999;
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .cookie-card {
                    max-width: 500px;
                    width: 100%;
                    padding: 24px;
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .cookie-content {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                }

                .cookie-icon {
                    font-size: 2rem;
                    background: rgba(255, 204, 51, 0.1);
                    padding: 10px;
                    border-radius: 12px;
                }

                .cookie-text h3 {
                    font-size: 1.1rem;
                    font-weight: 800;
                    margin-bottom: 4px;
                    color: var(--text-main);
                }

                .cookie-text p {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: var(--text-dim);
                }

                .cookie-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                /* Mobile optimization */
                @media (max-width: 600px) {
                    .cookie-banner-overlay {
                        bottom: 20px;
                    }
                    .cookie-card {
                        padding: 20px;
                    }
                    .cookie-actions {
                        flex-direction: column-reverse;
                    }
                    .cookie-actions button {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
