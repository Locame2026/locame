'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchRestaurantsWithMenus, fetchReviews, recordVisit } from '../actions';
import CheckoutContainer from '@/components/payment/PaymentForm';
import { GeolocationWrapper, Coordinates } from '@/lib/geolocation.wrapper';
import { MapPin, Navigation, Info, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewForm from '@/components/reviews/ReviewForm';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function ClientMap() {
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            const data = await fetchRestaurantsWithMenus();
            setRestaurants(data);
        };
        load();

        // Detectar ubicación del usuario
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => console.log('Geolocation error:', error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    const handleSelect = async (id: string) => {
        setSelectedId(id);
        setLoadingReviews(true);
        const userId = localStorage.getItem('locame_user_id');
        if (userId) recordVisit(userId, id);
        const data = await fetchReviews(id);
        setReviews(data);
        setLoadingReviews(false);
    };

    const selectedRest = restaurants.find(r => r.id === selectedId);

    // Calcular distancia si tenemos la ubicación del usuario
    const distanceToSelected = (selectedRest && userLocation)
        ? GeolocationWrapper.calculateDistance(userLocation, { latitude: selectedRest.lat, longitude: selectedRest.lng })
        : null;

    return (
        <div className="map-view-container">
            <div className="map-sidebar glass">
                {selectedRest ? (
                    <div className="rest-details">
                        <div className="nav-top">
                            <button className="back-link" onClick={() => setSelectedId(null)}>← Volver al mapa</button>
                            <button className="dash-link" onClick={() => router.push('/client/dashboard')}>
                                <Home size={16} /> Dashboard
                            </button>
                        </div>
                        <header>
                            <h2 className="brand-font">{selectedRest.name}</h2>
                            <div className="status-row">
                                <div className="rating-pill">⭐ {parseFloat(selectedRest.avg_rating).toFixed(1)} ({selectedRest.review_count})</div>
                                {distanceToSelected !== null && (
                                    <div className="distance-pill">
                                        <MapPin size={14} />
                                        {GeolocationWrapper.formatDistance(distanceToSelected)}
                                    </div>
                                )}
                            </div>
                        </header>

                        <div className="section-card">
                            <h3>🍽️ Menú de Hoy</h3>
                            {selectedRest.first_courses ? (
                                <div className="menu-preview">
                                    <div className="course">
                                        <strong>Primeros:</strong>
                                        <ul>{selectedRest.first_courses.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
                                    </div>
                                    <div className="course">
                                        <strong>Segundos:</strong>
                                        <ul>{selectedRest.second_courses.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
                                    </div>
                                    <div className="price-tag">{selectedRest.price}€</div>

                                    <button
                                        className="btn-primary pay-btn"
                                        onClick={() => setShowCheckout(true)}
                                    >
                                        Pagar Menú 🥘
                                    </button>
                                </div>
                            ) : (
                                <p className="no-menu">Menú no disponible para hoy.</p>
                            )}
                        </div>

                        <div className="section-card reviews-section">
                            <h3>⭐ Reseñas</h3>
                            {loadingReviews ? (
                                <p>Cargando reseñas...</p>
                            ) : reviews.length > 0 ? (
                                <div className="reviews-list">
                                    {reviews.map((rev, i) => (
                                        <div key={i} className="review-item">
                                            <div className="rev-header">
                                                <strong>{rev.first_name}</strong>
                                                <span>{Array(rev.rating).fill('⭐').join('')}</span>
                                            </div>
                                            <p>{rev.comment}</p>
                                            {rev.reply && (
                                                <div className="reply">
                                                    <strong>Respuesta del dueño:</strong>
                                                    <p>{rev.reply}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-menu">Aún no hay reseñas.</p>
                            )}
                        </div>

                        <div className="section-card">
                            <h3>⭐ Tu opinión importa</h3>
                            <ReviewForm
                                restaurantId={selectedRest.id}
                                userId={typeof window !== 'undefined' ? localStorage.getItem('locame_user_id') || '' : ''}
                                onSuccess={async () => {
                                    const data = await fetchReviews(selectedRest.id);
                                    setReviews(data);
                                }}
                            />
                        </div>

                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedRest.lat},${selectedRest.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navigate-btn btn-primary"
                        >
                            Ir con Google Maps 🚗
                        </a>
                    </div>
                ) : (
                    <div className="welcome-sidebar">
                        <div className="sidebar-header">
                            <h2 className="brand-font">Explora Menús</h2>
                            <button className="btn-dash-mini" onClick={() => router.push('/client/dashboard')}>
                                <Home size={14} /> Mi Panel
                            </button>
                        </div>
                        <p>Selecciona un restaurante en el mapa para ver sus platos de hoy y lo que dicen de él.</p>
                        <div className="rest-list">
                            {restaurants.map(r => {
                                const dist = userLocation
                                    ? GeolocationWrapper.calculateDistance(userLocation, { latitude: r.lat, longitude: r.lng })
                                    : null;
                                return (
                                    <div key={r.id} className="mini-card" onClick={() => handleSelect(r.id)}>
                                        <div className="card-info">
                                            <strong>{r.name}</strong>
                                            <div className="card-meta">
                                                <span>⭐ {parseFloat(r.avg_rating).toFixed(1)}</span>
                                                {dist !== null && <span className="dist"> • {GeolocationWrapper.formatDistance(dist)}</span>}
                                            </div>
                                        </div>
                                        <Info size={18} className="info-icon" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="map-wrapper">
                <MapContainer center={[40.528, -3.649]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {restaurants.map(r => (
                        <Marker
                            key={r.id}
                            position={[r.lat, r.lng]}
                            eventHandlers={{ click: () => handleSelect(r.id) }}
                        >
                            <Popup>
                                <strong>{r.name}</strong><br />
                                {r.price ? `${r.price}€` : 'Ver menú'}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {showCheckout && (
                <div className="checkout-overlay">
                    <CheckoutContainer
                        restaurantId={selectedRest.id}
                        userId={localStorage.getItem('locame_user_id') || ''}
                        amount={selectedRest.price}
                        onSuccess={() => {
                            setShowCheckout(false);
                            setPaymentSuccess(true);
                            setTimeout(() => setPaymentSuccess(false), 3000);
                        }}
                        onCancel={() => setShowCheckout(false)}
                    />
                </div>
            )}

            {paymentSuccess && (
                <div className="success-toast glass">
                    ¡Pago procesado con éxito! 🎉
                </div>
            )}

            <style jsx>{`
                .map-view-container { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
                .map-sidebar { width: 400px; padding: 32px; overflow-y: auto; z-index: 1000; box-shadow: 10px 0 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; background: white; }
                .map-wrapper { flex: 1; z-index: 1; }

                .rest-details header { margin-bottom: 24px; }
                .rating-pill { display: inline-block; background: var(--secondary); padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.9rem; }
                .status-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
                .distance-pill { display: flex; align-items: center; gap: 4px; background: rgba(var(--primary-rgb), 0.1); color: var(--text-main); padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem; }
                
                .section-card { background: var(--secondary); border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid var(--glass-border); }
                .section-card h3 { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; color: var(--text-dim); }
                
                .menu-preview ul { list-style: none; padding-left: 0; margin: 8px 0; }
                .menu-preview li { margin-bottom: 4px; font-size: 0.95rem; }
                .course { margin-bottom: 16px; }
                .price-tag { font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 12px; }

                .reviews-list { display: flex; flex-direction: column; gap: 16px; }
                .review-item { border-bottom: 1px solid var(--glass-border); padding-bottom: 12px; }
                .rev-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .reply { background: rgba(0,0,0,0.03); padding: 12px; border-radius: 12px; margin-top: 8px; font-size: 0.85rem; }
                
                .mini-card { padding: 16px; background: var(--secondary); border-radius: 12px; margin-bottom: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: var(--transition-smooth); }
                .mini-card:hover { transform: translateX(5px); background: #eee; border-color: var(--primary); }
                .card-meta { font-size: 0.85rem; color: var(--text-dim); margin-top: 2px; }
                .info-icon { color: var(--text-muted); opacity: 0.5; }
                .mini-card:hover .info-icon { opacity: 1; color: var(--primary); }

                .navigate-btn { width: 100%; height: 60px; font-size: 1.1rem; border: none; border-radius: var(--radius-xl); cursor: pointer; display: flex; align-items: center; justify-content: center; text-decoration: none; margin-top: 24px; }
                .pay-btn { width: 100%; margin-top: 20px; height: 50px; font-size: 1.1rem; }
                
                .success-toast {
                    position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
                    background: #059669; color: white; padding: 16px 32px; border-radius: 40px;
                    z-index: 3000; font-weight: 700; box-shadow: 0 10px 30px rgba(5, 150, 105, 0.3);
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }

                .back-to-list { background: none; border: none; color: var(--primary); font-weight: 800; cursor: pointer; margin-bottom: 16px; padding: 0; }
                
                .nav-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .dash-link, .btn-dash-mini { display: flex; align-items: center; gap: 6px; background: white; border: 1px solid var(--glass-border); padding: 6px 12px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .dash-link:hover, .btn-dash-mini:hover { background: var(--secondary); border-color: var(--primary); color: var(--primary); }
                .back-link { background: none; border: none; color: #666; font-size: 0.9rem; cursor: pointer; font-weight: 500; }
                .back-link:hover { color: var(--primary); }
                
                .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                
                .checkout-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 2000; animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                @media (max-width: 900px) {
                    .map-view-container { flex-direction: column-reverse; }
                    .map-sidebar { width: 100%; height: 50vh; }
                }
            `}</style>
        </div>
    );
}
