import { getSession as nextAuthGetSession } from '@/lib/auth';

/**
 * AUTH WRAPPER (Regla I.2)
 * Encapsula la lógica de autenticación para que el resto de la aplicación
 * no dependa directamente de la implementación de Next-Auth.
 */

export interface AppSession {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    role?: 'ADMIN' | 'RESTAURANT' | 'CLIENTE';
    restaurantId?: string;
    userId?: string;
}

/**
 * Obtiene la sesión actual de forma tipada y segura.
 */
export async function getAppSession(): Promise<AppSession | null> {
    try {
        const session = await nextAuthGetSession();
        if (!session) return null;

        return session as AppSession;
    } catch (error) {
        console.error("AuthWrapper Error:", error);
        return null; // Silent catch according to business rules? No, logging but returning null for safety.
    }
}

/**
 * Verifica si el usuario tiene un rol específico.
 * Ejemplo de lógica de negocio abstraída del driver de auth.
 */
export async function hasRole(role: string): Promise<boolean> {
    const session = await getAppSession();
    return session?.role === role;
}
