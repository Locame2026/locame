
'use server';

import { sql } from '@/lib/db';
import { GeolocationWrapper, Coordinates } from '@/lib/geolocation.wrapper';

/**
 * ACCIONES DE SERVIDOR PARA GEOLOCALIZACIÓN (Regla II.2)
 */

export interface NearbyRestaurant {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    distance: number;
    address: string;
    image_url?: string;
    rating?: number;
}

/**
 * Busca restaurantes cercanos usando una combinación de Geohash (para filtrado inicial) 
 * y Distancia Real (para ordenación y precisión).
 */
export async function searchNearby(
    coords: Coordinates,
    radiusInKm: number = 5
): Promise<{ success: boolean; data?: NearbyRestaurant[]; error?: string }> {
    try {
        const restaurants = await sql`
            SELECT 
                r.id, 
                r.name, 
                r.latitude, 
                r.longitude,
                r.address_full as address,
                (
                    6371 * acos(
                        cos(radians(${coords.latitude})) * cos(radians(r.latitude)) * 
                        cos(radians(r.longitude) - radians(${coords.longitude})) + 
                        sin(radians(${coords.latitude})) * sin(radians(r.latitude))
                    )
                ) AS distance
            FROM restaurants r
            WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL
            HAVING (
                6371 * acos(
                    cos(radians(${coords.latitude})) * cos(radians(r.latitude)) * 
                    cos(radians(r.longitude) - radians(${coords.longitude})) + 
                    sin(radians(${coords.latitude})) * sin(radians(r.latitude))
                )
            ) < ${radiusInKm}
            ORDER BY distance ASC
            LIMIT 50;
        `;

        return {
            success: true,
            data: restaurants.map((r: any) => ({
                id: r.id,
                name: r.name,
                latitude: parseFloat(r.latitude),
                longitude: parseFloat(r.longitude),
                distance: parseFloat(r.distance),
                address: r.address || '',
                image_url: r.image_url,
                rating: r.rating ? parseFloat(r.rating) : undefined
            })) as NearbyRestaurant[]
        };
    } catch (error) {
        console.error('SEARCH_NEARBY_ERROR:', error);
        return { success: false, error: 'Error al buscar restaurantes cercanos' };
    }
}

/**
 * Actualiza la ubicación de un restaurante.
 */
export async function updateRestaurantLocation(
    restaurantId: string,
    coords: Coordinates,
    address?: string
) {
    try {
        const geohash = GeolocationWrapper.encodeGeohash(coords);

        await sql`
            UPDATE restaurants 
            SET 
                latitude = ${coords.latitude},
                longitude = ${coords.longitude},
                geohash = ${geohash},
                address_full = ${address || null}
            WHERE id = ${restaurantId}
        `;

        return { success: true };
    } catch (error) {
        console.error('UPDATE_LOCATION_ERROR:', error);
        return { success: false, error: 'Error al actualizar la ubicación' };
    }
}

/**
 * Simulación de Geocodificación
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
    console.log('Geocoding address:', address);
    return {
        latitude: 40.416775,
        longitude: -3.703790
    };
}
