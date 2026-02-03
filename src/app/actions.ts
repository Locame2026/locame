'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getAppSession } from '@/lib/auth.wrapper';

/**
 * SoC: Data layer focuses on validation and DB interaction.
 * SOLID: S - Each function handles one specific operation.
 * PATTERN: Early Return para reducir anidamiento (Regla IV.3).
 */
export async function saveMenu(formData: {
    restaurantId: string;
    firstCourses: string[];
    secondCourses: string[];
    desserts: string[];
    price: number;
}) {
    try {
        const session = await getAppSession();

        // 1. Authorization check: Early Return Pattern
        if (!session) {
            return { success: false, error: 'Inicia sesión para continuar' };
        }

        if (session.role !== 'RESTAURANT' || session.restaurantId !== formData.restaurantId) {
            return { success: false, error: 'No tienes permiso para realizar esta acción' };
        }

        const { restaurantId, firstCourses, secondCourses, desserts, price } = formData;

        // 2. Database interaction via Wrapper
        await db.query`
            INSERT INTO menus (restaurant_id, first_courses, second_courses, desserts, price, menu_date)
            VALUES (${restaurantId}, ${firstCourses}, ${secondCourses}, ${desserts}, ${price}, CURRENT_DATE)
            ON CONFLICT (restaurant_id, menu_date) 
            DO UPDATE SET 
                first_courses = EXCLUDED.first_courses,
                second_courses = EXCLUDED.second_courses,
                desserts = EXCLUDED.desserts,
                price = EXCLUDED.price,
                created_at = now()
        `;

        revalidatePath('/search');
        return { success: true };
    } catch (error) {
        // Manejo de errores global (Regla IV.4) - No silenciar
        console.error('SERVER_ACTION_ERROR: Failed to save menu:', error);
        return { success: false, error: 'Error interno de base de datos' };
    }
}

export async function getNearbyRestaurants(lat: number, lng: number, radiusKm: number = 5) {
    try {
        // Validation: Early Return
        if (isNaN(lat) || isNaN(lng)) {
            return [];
        }

        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

        const session = await getAppSession();
        const userId = session?.userId;

        // Use db.query via Wrapper
        const results = await db.query`
            SELECT r.id, r.name, r.address, r.lat, r.lng, r.is_featured,
                   m.first_courses, m.second_courses, m.desserts, m.price,
                   EXISTS(SELECT 1 FROM favorites f WHERE f.restaurant_id = r.id AND f.user_id = ${userId || null}) as is_favorited
            FROM restaurants r
            JOIN menus m ON r.id = m.restaurant_id
            WHERE m.menu_date = CURRENT_DATE
                AND r.lat BETWEEN ${lat - latDelta} AND ${lat + latDelta}
                AND r.lng BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}
            ORDER BY r.is_featured DESC, r.name ASC
        `;

        return results;
    } catch (error) {
        console.error('SERVER_ACTION_ERROR: Failed to search restaurants:', error);
        return [];
    }
}

export async function toggleFavorite(restaurantId: string) {
    try {
        const session = await getAppSession();
        if (!session?.userId) {
            return { success: false, error: 'Inicia sesión para guardar favoritos' };
        }

        const userId = session.userId;

        const [existing] = await db.query`
            SELECT id FROM favorites WHERE user_id = ${userId} AND restaurant_id = ${restaurantId}
        `;

        if (existing) {
            await db.query`DELETE FROM favorites WHERE id = ${existing.id}`;
            return { success: true, favorited: false };
        } else {
            await db.query`
                INSERT INTO favorites (user_id, restaurant_id)
                VALUES (${userId}, ${restaurantId})
            `;
            return { success: true, favorited: true };
        }
    } catch (error) {
        console.error('SERVER_ACTION_ERROR: Failed to toggle favorite:', error);
        return { success: false, error: 'Error al actualizar favoritos' };
    }
}
