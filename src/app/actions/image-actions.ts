'use server';

import { storage } from '@/lib/storage.wrapper';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Acciones de servidor para la gestión de imágenes.
 * Sigue el patrón de la Regla II.4 (Atomicidad en cambios).
 */

export async function uploadEntityImage(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const entityId = formData.get('entityId') as string;
        const entityType = formData.get('entityType') as string;
        const bucket = formData.get('bucket') as string || 'restaurant-images';

        if (!file || !entityId || !entityType) {
            throw new Error('Información de archivo o entidad faltante');
        }

        // 1. Preparar path único (Regla IV.2: Evitar colisiones)
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const cleanFileName = `${entityId}/${entityType.toLowerCase()}_${timestamp}.${extension}`;

        // 2. Subir a Supabase Storage via Wrapper
        const buffer = Buffer.from(await file.arrayBuffer());
        await storage.upload(bucket, cleanFileName, buffer, file.type);

        // 3. Obtener URL pública
        const publicUrl = storage.getPublicUrl(bucket, cleanFileName);

        // 4. Registrar en base de datos (Regla I.1: SoC)
        const [imageRecord] = await db.query`
            INSERT INTO images (
                url, 
                storage_path, 
                bucket, 
                entity_type, 
                entity_id, 
                original_name, 
                content_type, 
                size
            ) VALUES (
                ${publicUrl}, 
                ${cleanFileName}, 
                ${bucket}, 
                ${entityType}, 
                ${entityId}, 
                ${file.name}, 
                ${file.type}, 
                ${file.size}
            ) RETURNING *
        `;

        revalidatePath('/'); // Revalidar según sea necesario

        return { success: true, image: imageRecord };
    } catch (error: any) {
        console.error('ACTION_UPLOAD_IMAGE_ERROR:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteEntityImage(imageId: string) {
    try {
        // 1. Obtener info de la imagen (Regla II.1: Chesterton’s Fence)
        const [image] = await db.query`SELECT * FROM images WHERE id = ${imageId}`;

        if (!image) throw new Error('Imagen no encontrada');

        // 2. Eliminar de Storage via Wrapper
        await storage.delete(image.bucket, [image.storage_path]);

        // 3. Eliminar de Base de Datos
        await db.query`DELETE FROM images WHERE id = ${imageId}`;

        revalidatePath('/');

        return { success: true };
    } catch (error: any) {
        console.error('ACTION_DELETE_IMAGE_ERROR:', error);
        return { success: false, error: error.message };
    }
}

export async function getEntityImages(entityId: string, entityType: string) {
    try {
        return await db.query`
            SELECT * FROM images 
            WHERE entity_id = ${entityId} 
            AND entity_type = ${entityType}
            ORDER BY created_at DESC
        `;
    } catch (error) {
        console.error('ACTION_GET_IMAGES_ERROR:', error);
        return [];
    }
}
