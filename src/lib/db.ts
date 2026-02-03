import 'server-only';
import postgres from 'postgres';

/**
 * AGNOSTICISMO DE DEPENDENCIAS (Regla I.2)
 * Este archivo actúa como un Wrapper para la librería de base de datos.
 */

let connection: ReturnType<typeof postgres> | null = null;

// Lazy initialization: solo se conecta cuando se usa (Regla IV.4)
function getConnection() {
    if (!connection) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }

        // Configuración de conexión optimizada para Supabase Pooler (Regla IV.4: Manejo global)
        connection = postgres(process.env.DATABASE_URL, {
            max: 10,
            idle_timeout: 20,
            connect_timeout: 30, // Aumentado para redes con latencia
            prepare: false,
            ssl: 'require',     // Forzar SSL explícitamente
            onnotice: (notice) => console.log('DB_NOTICE:', notice),
            onparameter: (param, value) => console.log('DB_PARAM:', param, value),
        });
    }
    return connection;
}

/**
 * Interfaz de base de datos del sistema.
 */
export const db = {
    // Wrapper para queries con logging de errores (Regla IV.4)
    query: async (strings: TemplateStringsArray, ...values: any[]) => {
        try {
            return await getConnection()(strings, ...values);
        } catch (error) {
            console.error('DATABASE_QUERY_ERROR:', error);
            throw error; // Propagar según Regla IV.4
        }
    },
    // Acceso a la instancia raw para transacciones
    get raw() {
        return getConnection();
    },
    // Helper para transacciones con logging
    begin: async (callback: (tx: any) => Promise<any>) => {
        try {
            return await getConnection().begin(callback);
        } catch (error) {
            console.error('DATABASE_TRANSACTION_ERROR:', error);
            throw error;
        }
    }
};

// Compatibilidad temporal
export const sql = db.query;
