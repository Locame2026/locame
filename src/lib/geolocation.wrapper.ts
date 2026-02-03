
import ngeohash from 'ngeohash';

/**
 * GEOLOCATION WRAPPER (Regla I.2)
 * Encapsula la lógica de geolocalización, distancias y geohashing.
 */

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export class GeolocationWrapper {
    /**
     * Calcula la distancia entre dos puntos usando la fórmula de Haversine.
     */
    static calculateDistance(p1: Coordinates, p2: Coordinates): number {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.deg2rad(p2.latitude - p1.latitude);
        const dLon = this.deg2rad(p2.longitude - p1.longitude);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(p1.latitude)) * Math.cos(this.deg2rad(p2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distancia en km
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Genera un geohash para una coordenada.
     */
    static encodeGeohash(coords: Coordinates, precision: number = 9): string {
        return ngeohash.encode(coords.latitude, coords.longitude, precision);
    }

    /**
     * Decodifica un geohash.
     */
    static decodeGeohash(hash: string): Coordinates {
        const decoded = ngeohash.decode(hash);
        return {
            latitude: decoded.latitude,
            longitude: decoded.longitude
        };
    }

    /**
     * Obtiene los bordes de un área basada en geohash.
     */
    static getGeohashBbox(hash: string) {
        return ngeohash.decode_bbox(hash);
    }

    /**
     * Formatea la distancia para mostrar al usuario.
     */
    static formatDistance(km: number): string {
        if (km < 1) {
            return `${Math.round(km * 1000)}m`;
        }
        return `${km.toFixed(1)}km`;
    }
}
