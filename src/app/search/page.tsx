'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getNearbyRestaurants, toggleFavorite } from '../actions';

export default function UserSearch() {
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('locame_role');
        if (!role) router.push('/auth');
    }, [router]);

    const searchNearMe = () => {
        setLoading(true);

        if (!navigator.geolocation) {
            alert('La geolocalización no está soportada por tu navegador');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Llamada real al server action
                const results = await getNearbyRestaurants(latitude, longitude);

                // Simulación de "distancia" para la UI (en una app real se calcularía en el query o en el biz logic)
                const decoratedResults = results.map(res => ({
                    ...res,
                    rating: (4 + Math.random()).toFixed(1), // Simulado
                    distance: `${Math.floor(Math.random() * 900 + 100)}m` // Simulado
                }));

                setRestaurants(decoratedResults);
            } catch (error) {
                console.error('Error searching:', error);
                alert('Hubo un error al buscar restaurantes cercanos');
            } finally {
                setLoading(false);
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            alert('No pudimos obtener tu ubicación');
            setLoading(false);
        });
    };

    return (
        <div className="app-container">
            <header className="app-header glass">
                <div className="logo-container" onClick={() => router.push('/')}>
                    <Image src="/favicon.jpg" alt="LOCAME" width={40} height={40} className="header-logo" />
                    <span className="logo">LOCAME</span>
                </div>
                <div className="user-nav">
                    <span className="user-badge">Explorador</span>
                    <button onClick={() => {
                        localStorage.clear();
                        router.push('/');
                    }} className="logout-btn">Salir</button>
                </div>
            </header>

            <main className="content">
                <section className="search-hero">
                    <h1 className="brand-font">Menús de Hoy</h1>
                    <p>Descubre qué se cuece cerca de ti en este momento.</p>
                    <button
                        onClick={searchNearMe}
                        className="btn-primary search-trigger"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loader">Localizando...</span>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                Buscar cerca de mí
                            </>
                        )}
                    </button>
                </section>

                <div className="results-container">
                    {restaurants.map(res => (
                        <div key={res.id} className={`glass-interactive menu-card ${res.is_featured ? 'featured-card' : ''}`}>
                            {res.is_featured && <div className="featured-ribbon">DESTACADO</div>}

                            <div className="res-header">
                                <div>
                                    <h3>{res.name}</h3>
                                    <div className="res-meta">
                                        <span className="rating">★ {res.rating}</span>
                                        <span className="dot">•</span>
                                        <span className="distance">{res.distance}</span>
                                    </div>
                                </div>
                                <div className="price-tag">{res.price}€</div>
                            </div>

                            <button
                                className={`favorite-btn ${res.is_favorited ? 'active' : ''}`}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const result = await toggleFavorite(res.id);
                                    if (result.success) {
                                        setRestaurants(restaurants.map(r =>
                                            r.id === res.id ? { ...r, is_favorited: result.favorited } : r
                                        ));
                                    } else {
                                        alert(result.error);
                                    }
                                }}
                            >
                                {res.is_favorited ? '❤️' : '🤍'}
                            </button>

                            <div className="menu-content">
                                <div className="course-section">
                                    <label>Primero</label>
                                    <p>{res.first_courses?.[0] || 'Plato del día'}</p>
                                </div>
                                <div className="course-section">
                                    <label>Segundo</label>
                                    <p>{res.second_courses?.[0] || 'Especialidad de la casa'}</p>
                                </div>
                            </div>

                            <div className="card-footer">
                                <span className="address-hint">{res.address}</span>
                                <button className="btn-view-full" onClick={() => alert('Próximamente: Detalle del menú completo')}>
                                    Ver carta completa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {restaurants.length === 0 && !loading && (
                    <div className="empty-state glass">
                        <div className="empty-icon">📍</div>
                        <h3>¿Hambre?</h3>
                        <p>Pulsa el botón de búsqueda para encontrar los menús más frescos a tu alrededor.</p>
                    </div>
                )}
            </main>

            <style jsx>{`
                .app-container { padding: 24px; min-height: 100vh; max-width: 1200px; margin: 0 auto; color: var(--text-main); }
                .app-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; margin-bottom: 60px; border-radius: 24px; background: white; }
                .logo-container { display: flex; align-items: center; gap: 12px; cursor: pointer; }
                .logo { font-family: 'Anton', sans-serif; font-size: 2rem; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; }
                
                .user-nav { display: flex; align-items: center; gap: 20px; }
                .user-badge { font-size: 0.8rem; font-weight: 800; background: var(--secondary); color: var(--text-main); padding: 4px 16px; border-radius: 100px; border: 1px solid var(--glass-border); }
                .logout-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; font-weight: 600; }

                .search-hero { text-align: center; margin-bottom: 80px; padding: 40px 0; }
                .search-hero h1 { font-size: 4rem; margin-bottom: 12px; }
                .search-hero p { font-size: 1.2rem; color: var(--text-dim); margin-bottom: 40px; }
                .search-trigger { font-size: 1.2rem; padding: 20px 50px; border-radius: 20px; box-shadow: 0 10px 30px rgba(var(--primary-rgb), 0.3); }

                .results-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 32px; }
                
                .menu-card { padding: 32px; display: flex; flex-direction: column; gap: 24px; position: relative; overflow: hidden; }
                .featured-card { border: 2.5px solid gold; box-shadow: 0 15px 40px rgba(218, 165, 32, 0.2); transform: scale(1.02); z-index: 10; padding: 31px; /* border offset */}
                .featured-ribbon { position: absolute; top: 12px; right: -30px; background: gold; color: black; font-weight: 900; font-size: 0.7rem; padding: 4px 40px; transform: rotate(45deg); box-shadow: 0 2px 10px rgba(0,0,0,0.1); }

                .res-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .res-header h3 { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
                .res-meta { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
                .rating { color: #fbbf24; font-weight: 900; }
                .distance { color: var(--primary); font-weight: 800; }
                
                .price-tag { background: var(--text-main); color: white; padding: 8px 16px; border-radius: 12px; font-weight: 900; font-size: 1.2rem; }

                .favorite-btn {
                    position: absolute;
                    top: 80px;
                    right: 32px;
                    background: white;
                    border: 1px solid var(--glass-border);
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: 0.3s;
                    box-shadow: var(--shadow-sm);
                    z-index: 15;
                }
                .favorite-btn:hover { transform: scale(1.1); }
                .favorite-btn.active { border-color: #f87171; background: #fef2f2; }

                .menu-content { display: flex; flex-direction: column; gap: 20px; }
                .course-section label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.1em; }
                .course-section p { font-size: 1.1rem; font-weight: 600; color: var(--text-main); line-height: 1.4; }

                .card-footer { margin-top: auto; display: flex; flex-direction: column; gap: 16px; }
                .address-hint { font-size: 0.8rem; color: var(--text-dim); }
                .btn-view-full { width: 100%; padding: 14px; border-radius: 14px; background: var(--secondary); border: 1px solid var(--glass-border); color: var(--text-main); font-weight: 800; cursor: pointer; transition: 0.3s; }
                .btn-view-full:hover { background: white; border-color: var(--primary); transform: translateY(-2px); }

                .empty-state { text-align: center; padding: 100px 40px; max-width: 600px; margin: 0 auto; }
                .empty-icon { font-size: 4rem; margin-bottom: 24px; animation: bounce 2s infinite; }
                
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

                @media (max-width: 768px) {
                    .search-hero h1 { font-size: 2.5rem; }
                    .results-container { grid-template-columns: 1fr; }
                    .featured-card { transform: none; }
                }
            `}</style>
        </div>
    );
}
