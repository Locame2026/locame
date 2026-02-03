'use client';

import dynamic from 'next/dynamic';

const MapContainer = dynamic(
    () => import('./MapContainer'),
    {
        ssr: false,
        loading: () => (
            <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <div className="loader">Cargando mapa...</div>
                <style jsx>{`
          .loader { font-family: 'Anton', sans-serif; font-size: 2rem; color: #ffcc33; text-transform: uppercase; letter-spacing: 0.1em; animation: pulse 1.5s infinite; }
          @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        `}</style>
            </div>
        )
    }
);

export default function MapPage() {
    return <MapContainer />;
}
