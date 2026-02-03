import { createClient } from '@supabase/supabase-js';

/**
 * AGNOSTICISMO DE DEPENDENCIAS (Regla I.2)
 * Este archivo actúa como un Wrapper para Supabase Storage.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization
let supabaseClient: any = null;

function getSupabase() {
    if (!supabaseClient) {
        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase credentials missing. Storage functionality will be limited.');
            return null;
        }
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseClient;
}

export const storage = {
    /**
     * Sube un archivo al bucket de Supabase
     */
    upload: async (bucket: string, path: string, file: Buffer | File, contentType?: string) => {
        const client = getSupabase();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client.storage
            .from(bucket)
            .upload(path, file, {
                contentType,
                upsert: true
            });

        if (error) {
            console.error('STORAGE_UPLOAD_ERROR:', error);
            throw error;
        }

        return data;
    },

    /**
     * Obtiene la URL pública de un archivo
     */
    getPublicUrl: (bucket: string, path: string) => {
        const client = getSupabase();
        if (!client) return '';

        const { data } = client.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    },

    /**
     * Elimina un archivo
     */
    delete: async (bucket: string, paths: string[]) => {
        const client = getSupabase();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client.storage
            .from(bucket)
            .remove(paths);

        if (error) {
            console.error('STORAGE_DELETE_ERROR:', error);
            throw error;
        }

        return data;
    }
};
