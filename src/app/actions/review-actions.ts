'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Acciones de servidor para la gestión de reseñas y valoraciones.
 */

export async function createReview(formData: FormData) {
    try {
        const userId = formData.get('userId') as string;
        const restaurantId = formData.get('restaurantId') as string;
        const rating = parseInt(formData.get('rating') as string);
        const comment = formData.get('comment') as string;

        if (!userId || !restaurantId || isNaN(rating)) {
            throw new Error('Información de reseña incompleta');
        }

        // 1. Insertar reseña (Regla II.4: Atomicidad)
        const [review] = await db.query`
            INSERT INTO reviews (user_id, restaurant_id, rating, comment)
            VALUES (${userId}, ${restaurantId}, ${rating}, ${comment})
            ON CONFLICT (user_id, restaurant_id) 
            DO UPDATE SET 
                rating = EXCLUDED.rating,
                comment = EXCLUDED.comment,
                updated_at = now()
            RETURNING *
        `;

        // 2. Actualizar agregados en el restaurante (Regla I.3: Inmutabilidad/Consistencia)
        await db.query`
            UPDATE restaurants 
            SET 
                avg_rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = ${restaurantId}),
                review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ${restaurantId})
            WHERE id = ${restaurantId}
        `;

        revalidatePath(`/restaurant/${restaurantId}`);

        return { success: true, review };
    } catch (error: any) {
        console.error('ACTION_CREATE_REVIEW_ERROR:', error);
        return { success: false, error: error.message };
    }
}

export async function getRestaurantReviews(restaurantId: string, limit: number = 10, offset: number = 0) {
    try {
        return await db.query`
            SELECT r.*, up.name as user_name, up.avatar_url
            FROM reviews r
            JOIN user_profiles up ON r.user_id = up.id
            WHERE r.restaurant_id = ${restaurantId}
            ORDER BY r.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
    } catch (error) {
        console.error('ACTION_GET_REVIEWS_ERROR:', error);
        return [];
    }
}

export async function toggleReviewHelpful(reviewId: string, userId: string) {
    try {
        // Lógica simplificada de toggle
        await db.query`
            INSERT INTO review_votes (review_id, user_id, is_helpful)
            VALUES (${reviewId}, ${userId}, true)
            ON CONFLICT (review_id, user_id) DO DELETE
        `;
        return { success: true };
    } catch (error: any) {
        console.error('ACTION_TOGGLE_HELPFUL_ERROR:', error);
        return { success: false, error: error.message };
    }
}
