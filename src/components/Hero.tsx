import Link from 'next/link';
import Image from 'next/image';

/**
 * COMPONENTIZACIÓN RECURSIVA (Regla III.2)
 * Componente Hero aislado para mantener la landing page limpia y modular.
 * Cumple con el "Atomic Vibe": maneja su propia estructura visual reutilizando tokens.
 */
export function Hero() {
    return (
        <section className="hero-section">
            <div className="branding-container">
                <div className="logo-wrapper">
                    <Image
                        src="/logo-new.jpg"
                        alt="LOCAME Logo"
                        width={200}
                        height={200}
                        className="brand-logo"
                        priority
                    />
                </div>
                <h1 className="hero-title brand-font gradient-text">LOCAME</h1>
                <p className="hero-slogan brand-script">Localiza tu menú</p>
            </div>

            <p className="hero-subtitle">
                La forma más inteligente de encontrar tu <span className="highlight">menú del día</span>.
                Rápido, visual y cerca de ti.
            </p>

            <div className="cta-wrapper">
                <Link href="/auth" className="btn-primary main-cta">
                    Explorar Menús
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                </Link>

                <div className="stats-group glass">
                    <div className="stat-item">
                        <span className="stat-val">+500</span>
                        <span className="stat-label">Restaurantes</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-val">Real-time</span>
                        <span className="stat-label">Actualizado</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hero-section {
                    max-width: 850px;
                    text-align: center;
                    z-index: 10;
                    animation: fadeIn 1s ease-out;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .branding-container {
                    margin-bottom: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .logo-wrapper {
                    margin-bottom: 20px;
                    filter: drop-shadow(0 0 25px rgba(255, 204, 51, 0.4));
                }

                .brand-logo {
                    border-radius: var(--radius-xl);
                    object-fit: contain;
                }

                .brand-font {
                    font-family: 'Anton', sans-serif !important;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .brand-script {
                    font-family: 'Dancing Script', cursive !important;
                    font-size: 3rem;
                    color: var(--primary);
                    margin-top: -20px;
                    margin-bottom: 30px;
                    text-shadow: 0 0 15px rgba(255, 204, 51, 0.4);
                }

                .hero-title {
                    font-size: 7.5rem;
                    font-weight: 400;
                    line-height: 0.8;
                    margin-bottom: 15px;
                }

                .hero-subtitle {
                    font-size: 1.5rem;
                    color: var(--text-dim);
                    max-width: 650px;
                    margin: 0 auto 50px;
                    line-height: 1.6;
                }

                .highlight {
                    color: var(--text-main);
                    border-bottom: 3px solid var(--primary);
                }

                .cta-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 40px;
                }

                .main-cta {
                    font-size: 1.25rem;
                    padding: 18px 48px;
                    border-radius: 18px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .stats-group {
                    display: flex;
                    gap: 60px;
                    padding: 25px 40px;
                }

                .stat-val {
                    display: block;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .hero-title { font-size: 4.5rem; }
                    .brand-script { font-size: 2rem; }
                    .hero-subtitle { font-size: 1.2rem; }
                    .stats-group { gap: 30px; flex-direction: column; width: 100%; }
                }
            `}</style>
        </section>
    );
}
