'use server';

import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';


export async function upgradeToPremium(restaurantId: string) {
    try {
        await sql`
            UPDATE restaurants 
            SET is_premium = true, is_featured = true 
            WHERE id = ${restaurantId}
        `;
        revalidatePath('/restaurant/dashboard');
        revalidatePath('/search');
        return { success: true };
    } catch (error) {
        console.error('Error upgrading to premium:', error);
        return { success: false, error: 'Error al procesar la suscripción' };
    }
}

export async function sendMenuNotification(restaurantId: string, menuSummary: string) {
    try {
        // Obtener usuarios que tienen el restaurante en favoritos
        const followers = await sql`
            SELECT user_id FROM favorites WHERE restaurant_id = ${restaurantId}
        `;

        if (followers.length === 0) {
            return { success: true, count: 0 };
        }

        console.log(`SIMULACIÓN PUSH: Enviando notificación a ${followers.length} usuarios sobre: ${menuSummary}`);

        // Aquí iría la integración con Firebase Cloud Messaging o similar

        return { success: true, count: followers.length };
    } catch (error) {
        console.error('Error sending notifications:', error);
        return { success: false, error: 'Error al enviar notificaciones' };
    }
}

export async function saveDailyMenu(formData: {
    restaurantId: string;
    date: string;
    firstCourses: string[];
    secondCourses: string[];
    desserts: string[];
    price: number;
    menuImageUrl?: string;
    notifyFollowers?: boolean;
}) {
    try {
        const { restaurantId, date, firstCourses, secondCourses, desserts, price, menuImageUrl, notifyFollowers } = formData;

        // Verificar si ya existe un menú para esa fecha y restaurante
        const [existing] = await sql`
            SELECT id FROM menus 
            WHERE restaurant_id = ${restaurantId} AND menu_date = ${date}
        `;

        let menuId;
        if (existing) {
            await sql`
                UPDATE menus SET
                    first_courses = ${firstCourses},
                    second_courses = ${secondCourses},
                    desserts = ${desserts},
                    price = ${price},
                    menu_image_url = ${menuImageUrl || null},
                    is_active = true
                WHERE id = ${existing.id}
            `;
            menuId = existing.id;
        } else {
            const [newMenu] = await sql`
                INSERT INTO menus (
                    restaurant_id, menu_date, first_courses, second_courses, desserts, price, menu_image_url, is_active
                ) VALUES (
                    ${restaurantId}, ${date}, ${firstCourses}, ${secondCourses}, ${desserts}, ${price}, ${menuImageUrl || null}, true
                ) RETURNING id
            `;
            menuId = newMenu.id;
        }

        // Si es premium y quiere notificar
        if (notifyFollowers) {
            const [restaurant] = await sql`SELECT is_premium FROM restaurants WHERE id = ${restaurantId}`;
            if (restaurant?.is_premium) {
                const summary = `${firstCourses[0]}... por ${price}€`;
                await sendMenuNotification(restaurantId, summary);
            }
        }

        return { success: true, menuId };
    } catch (error: any) {
        console.error('Error saving menu:', error);
        return { error: 'No se pudo guardar el menú' };
    }
}

export async function processMenuImage(base64Image: string, restaurantId: string) {
    try {
        // REGLA: Verificar suscripción premium
        const [restaurant] = await sql`SELECT is_premium FROM restaurants WHERE id = ${restaurantId}`;

        if (!restaurant?.is_premium) {
            return {
                success: false,
                error: 'Funcionalidad Premium',
                needsUpgrade: true
            };
        }

        // Simulación de procesamiento de IA (Vision)
        console.log('Procesando imagen con IA (Premium Service)...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            success: true,
            data: {
                firstCourses: ['Gazpacho con picatoste', 'Ensalada César', 'Lentejas a la riojana'],
                secondCourses: ['Pechuga de pollo a la plancha', 'Bacalao con tomate', 'Entrecot con patatas'],
                desserts: ['Flan casero', 'Fruta del tiempo', 'Tarta de queso'],
                price: 12.50
            }
        };
    } catch (error) {
        return { success: false, error: 'Error al procesar la imagen' };
    }
}

export async function saveDishImages(menuId: string, dishImages: { courseType: string, imageUrl: string, dishName: string }[]) {
    try {
        for (const img of dishImages) {
            await sql`
                INSERT INTO dish_images (menu_id, course_type, image_url, dish_name)
                VALUES (${menuId}, ${img.courseType}, ${img.imageUrl}, ${img.dishName})
            `;
        }
        return { success: true };
    } catch (error) {
        console.error('Error saving dish images:', error);
        return { error: 'No se pudieron guardar las fotos de los platos' };
    }
}

export async function fetchRestaurantReviews(restaurantId: string) {
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
        console.error('Error fetching restaurant reviews:', error);
        return [];
    }
}

export async function replyToReview(reviewId: string, reply: string) {
    try {
        await sql`
            UPDATE reviews 
            SET reply = ${reply}
            WHERE id = ${reviewId}
        `;
        revalidatePath('/restaurant/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error replying to review:', error);
        return { success: false, error: 'Error al responder a la reseña' };
    }
}

export async function deleteReview(reviewId: string, restaurantId: string) {
    try {
        // REGLA: Verificar suscripción premium
        const [restaurant] = await sql`SELECT is_premium FROM restaurants WHERE id = ${restaurantId}`;

        if (!restaurant?.is_premium) {
            return {
                success: false,
                error: 'Funcionalidad Premium',
                needsUpgrade: true
            };
        }

        // Verificar propiedad (opcional pero recomendado: la reseña debe pertenecer a este restaurante)
        const [review] = await sql`SELECT restaurant_id FROM reviews WHERE id = ${reviewId}`;
        if (review?.restaurant_id !== restaurantId) {
            return { success: false, error: 'Reseña no encontrada o no pertenece al restaurante' };
        }

        await sql`DELETE FROM reviews WHERE id = ${reviewId}`;

        revalidatePath('/restaurant/dashboard');
        return { success: true };
    } catch (error) {
        console.error('SERVER_ACTION_ERROR: Failed to delete review:', error);
        return { success: false, error: 'Error al eliminar la reseña' };
    }
}
