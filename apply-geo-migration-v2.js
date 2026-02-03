
const postgres = require('postgres');
require('dotenv').config({ path: '.env.production' });

async function migrate() {
    // Intentar conexión directa si el pooler falla
    const url = process.env.DATABASE_URL;
    console.log('Migrating database...');

    const sql = postgres(url, {
        ssl: 'require',
        connect_timeout: 60,
        idle_timeout: 20,
        max: 1
    });

    try {
        console.log('Checking connection...');
        await sql`SELECT 1`;

        console.log('Adding columns...');
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);`;
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);`;
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS geohash TEXT;`;
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address_full TEXT;`;

        console.log('Creating index 1...');
        await sql`CREATE INDEX IF NOT EXISTS idx_restaurants_geohash ON restaurants(geohash);`;

        console.log('Migration successful!');
    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        await sql.end();
    }
}

migrate();
