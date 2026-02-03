
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Coordinates } from '@/lib/geolocation.wrapper';
import { geocodeAddress } from '@/app/actions/location-actions';

// Fix for default marker icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface LocationPickerProps {
    initialLocation?: Coordinates;
    onChange: (coords: Coordinates, address?: string) => void;
}

function LocationMarker({ coords, onMove }: { coords: Coordinates, onMove: (c: Coordinates) => void }) {
    useMapEvents({
        click(e) {
            onMove({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        },
    });

    return (
        <Marker position={[coords.latitude, coords.longitude]} icon={DefaultIcon} />
    );
}

export default function LocationPicker({ initialLocation, onChange }: LocationPickerProps) {
    const [location, setLocation] = useState<Coordinates>(initialLocation || { latitude: 40.416775, longitude: -3.703790 });
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!address) return;
        setLoading(true);
        try {
            const result = await geocodeAddress(address);
            if (result) {
                setLocation(result);
                onChange(result, address);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMapMove = (newCoords: Coordinates) => {
        setLocation(newCoords);
        onChange(newCoords);
    };

    return (
        <div className="location-picker">
            <div className="search-bar glass">
                <input
                    type="text"
                    placeholder="Busca la dirección de tu restaurante..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
            </div>

            <div className="map-container">
                <MapContainer center={[location.latitude, location.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker coords={location} onMove={handleMapMove} />
                </MapContainer>
            </div>

            <div className="location-info glass">
                <MapPin size={18} />
                <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
            </div>

            <style jsx>{`
                .location-picker { width: 100%; height: 400px; display: flex; flex-direction: column; gap: 12px; border-radius: var(--radius-xl); overflow: hidden; }
                .search-bar { display: flex; gap: 8px; padding: 12px; z-index: 1000; }
                .search-bar input { flex: 1; border: none; background: transparent; color: var(--text-main); font-size: 0.95rem; outline: none; }
                .search-bar button { background: var(--primary); color: white; border: none; padding: 8px; border-radius: 12px; cursor: pointer; transition: var(--transition-smooth); }
                .search-bar button:hover { transform: scale(1.05); filter: brightness(1.1); }
                
                .map-container { flex: 1; border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--glass-border); }
                
                .location-info { display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 0.85rem; color: var(--text-dim); align-self: flex-start; }
            `}</style>
        </div>
    );
}
