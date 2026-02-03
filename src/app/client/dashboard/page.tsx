'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchVisitHistory } from '../actions';
import { handleLogout } from '../../auth/actions';

export default function ClientDashboard() {
    const [userName, setUserName] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('locame_role');
        const user = localStorage.getItem('locame_user');
        const userId = localStorage.getItem('locame_user_id');

        if (role !== 'CLIENTE' && role !== 'CLIENT') {
            router.push('/auth');
            return;
        }

        setUserName(user || 'Usuario');

        const load = async () => {
            if (userId) {
                const data = await fetchVisitHistory(userId);
                setHistory(data);
            }
            setLoading(false);
        };
        load();
    }, [router]);

    const logout = async () => {
        setIsLoggingOut(true);
        localStorage.clear();
        await handleLogout();
    };

    return (
        <div className="client-dashboard">
            <header className="dash-header glass">
                <div className="branding" onClick={() => router.push('/')}>
                    <Image src="/icon.jpg" alt="LOCAME" width={32} height={32} className="header-logo" />
                    <span className="logo">LOCAME</span>
                </div>
                <div className="user-nav">
                    <span>Hola, <strong>{userName}</strong></span>
                    <button onClick={logout} className="exit-btn" disabled={isLoggingOut}>
                        {isLoggingOut ? 'Saliendo...' : 'Salir'}
                    </button>
                </div>
            </header>

            <main className="dash-main">
                <section className="welcome-hero glass-interactive" onClick={() => router.push('/client/map')}>
                    <div className="hero-content">
                        <h1 className="brand-font">¿Qué comemos hoy?</h1>
                        <p>Encuentra los mejores menús del día en el mapa interactivo.</p>
                        <button className="btn-primary">Ver Mapa de Restaurantes 🗺️</button>
                    </div>
                </section>

                <section className="history-section">
                    <header className="section-header">
                        <h2>Tu Historial de Visitas</h2>
                        <p>Restaurantes que has explorado recientemente.</p>
                    </header>

                    {loading ? (
                        <div className="loading-state">Cargando tu historial...</div>
                    ) : history.length > 0 ? (
                        <div className="history-grid">
                            {history.map((item, i) => (
                                <div key={i} className="history-card glass-interactive" onClick={() => router.push(`/client/map?id=${item.restaurant_id}`)}>
                                    <div className="card-header">
                                        <h3>{item.restaurant_name}</h3>
                                        <span className="stars">⭐ {parseFloat(item.avg_rating).toFixed(1)}</span>
                                    </div>
                                    <p className="address">{item.address}</p>
                                    <div className="card-footer">
                                        <span className="date">Visitado el {new Date(item.visited_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-history glass">
                            <p>Aún no tienes visitas registradas. ¡Empieza a explorar el mapa!</p>
                            <button className="btn-secondary" onClick={() => router.push('/client/map')}>Ir al Mapa</button>
                        </div>
                    )}
                </section>
            </main>

            <style jsx>{`
                .client-dashboard { min-height: 100vh; background: #fff; padding: 20px; max-width: 1200px; margin: 0 auto; }
                
                .dash-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-radius: 20px; margin-bottom: 32px; background: white; z-index: 100; position: sticky; top: 20px; }
                .branding { display: flex; align-items: center; gap: 10px; cursor: pointer; }
                .logo { font-family: 'Anton', sans-serif !important; font-size: 1.5rem; color: var(--primary); text-transform: uppercase; }
                .user-nav { display: flex; align-items: center; gap: 16px; font-size: 0.9rem; }
                .exit-btn { background: none; border: 1px solid var(--glass-border); padding: 4px 12px; border-radius: 8px; cursor: pointer; transition: 0.3s; }
                .exit-btn:hover { background: var(--secondary); }

                .welcome-hero { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); color: white; padding: 60px 40px; border-radius: 32px; margin-bottom: 48px; cursor: pointer; position: relative; overflow: hidden; }
                .welcome-hero::after { content: '🥘'; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 8rem; opacity: 0.1; }
                .hero-content { position: relative; z-index: 2; max-width: 500px; }
                .welcome-hero h1 { font-size: 3.5rem; line-height: 1; margin-bottom: 16px; }
                .welcome-hero p { font-size: 1.1rem; color: rgba(255,255,255,0.7); margin-bottom: 32px; }

                .history-section { padding-bottom: 60px; }
                .section-header { margin-bottom: 24px; }
                .section-header h2 { font-size: 1.8rem; margin-bottom: 4px; }
                .section-header p { color: var(--text-dim); }

                .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .history-card { padding: 24px; border-radius: 20px; background: white; cursor: pointer; border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 12px; }
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .card-header h3 { font-size: 1.2rem; }
                .stars { font-weight: 700; background: var(--secondary); padding: 2px 8px; border-radius: 12px; font-size: 0.85rem; }
                .address { font-size: 0.9rem; color: var(--text-dim); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .card-footer { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--glass-border); }
                .date { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

                .empty-history { padding: 60px; text-align: center; border-radius: 24px; background: var(--secondary); display: flex; flex-direction: column; align-items: center; gap: 20px; }
                
                @media (max-width: 600px) {
                    .welcome-hero h1 { font-size: 2.5rem; }
                    .welcome-hero { padding: 40px 24px; }
                    .history-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
