'use server';

import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function fetchRestaurantsWithMenus() {
    try {
        const restaurants = await sql`
            SELECT 
                r.*,
                m.first_courses,
                m.second_courses,
                m.desserts,
                m.price,
                (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE restaurant_id = r.id) as avg_rating,
                (SELECT COUNT(*) FROM reviews WHERE restaurant_id = r.id) as review_count
            FROM restaurants r
            LEFT JOIN menus m ON m.restaurant_id = r.id 
                AND m.menu_date = CURRENT_DATE
                AND m.is_active = true
            WHERE r.lat IS NOT NULL AND r.lng IS NOT NULL
        `;
        return restaurants;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
    }
}

export async function submitReview(formData: {
    restaurantId: string;
    userId: string;
    rating: number;
    comment: string;
}) {
    try {
        await sql`
            INSERT INTO reviews (restaurant_id, user_id, rating, comment)
            VALUES (${formData.restaurantId}, ${formData.userId}, ${formData.rating}, ${formData.comment})
        `;
        revalidatePath('/client/map');
        return { success: true };
    } catch (error) {
        console.error('Error submitting review:', error);
        return { success: false, error: 'Error al enviar la reseña' };
    }
}

export async function fetchReviews(restaurantId: string) {
    try {
        const reviews = await sql`
            SELECT 
                r.*,
                u.first_name,
                u.last_name
            FROM reviews r
            JOIN user_profiles u ON r.user_id = u.id
            WHERE r.restaurant_id = ${restaurantId}
            ORDER BY r.created_at DESC
        `;
        return reviews;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

export async function fetchVisitHistory(userId: string) {
    try {
        const history = await sql`
            SELECT 
                vh.visited_at,
                r.name as restaurant_name,
                r.address,
                r.id as restaurant_id,
                (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE restaurant_id = r.id) as avg_rating
            FROM visit_history vh
            JOIN restaurants r ON vh.restaurant_id = r.id
            WHERE vh.user_id = ${userId}
            ORDER BY vh.visited_at DESC
            LIMIT 10
        `;
        return history;
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

export async function recordVisit(userId: string, restaurantId: string) {
    try {
        await sql`
            INSERT INTO visit_history (user_id, restaurant_id)
            VALUES (${userId}, ${restaurantId})
        `;
        return { success: true };
    } catch (error) {
        console.error('Error recording visit:', error);
        return { success: false };
    }
}
