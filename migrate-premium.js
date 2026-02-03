
const postgres = require('postgres');

async function run() {
    const sql = postgres('postgresql://postgres.btvbjqftfhqdoqvayzuq:jDdSnKUOYhQspxaw@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });
    try {
        console.log('Applying database migration...');

        await sql`
            ALTER TABLE restaurants 
            ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
        `;
        console.log('Columns is_premium and is_featured added to restaurants.');

        await sql`
            CREATE TABLE IF NOT EXISTS favorites (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(user_id, restaurant_id)
            );
        `;
        console.log('Table favorites created.');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

run();
