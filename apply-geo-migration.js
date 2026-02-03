
const postgres = require('postgres');
require('dotenv').config({ path: '.env.production' });

async function migrate() {
    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
        console.log('Applying geolocation migration...');

        await sql`CREATE EXTENSION IF NOT EXISTS postgis;`;

        await sql`
            ALTER TABLE restaurants 
            ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
            ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
            ADD COLUMN IF NOT EXISTS geohash TEXT,
            ADD COLUMN IF NOT EXISTS address_full TEXT;
        `;

        await sql`CREATE INDEX IF NOT EXISTS idx_restaurants_geohash ON restaurants(geohash);`;

        // PostGIS index
        try {
            await sql`
                CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants USING GIST (
                    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
                ) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
            `;
        } catch (e) {
            console.warn('PostGIS index failed (maybe extension not full):', e.message);
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sql.end();
    }
}

migrate();
