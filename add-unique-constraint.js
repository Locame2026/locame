import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres.btvbjqftfhqdoqvayzuq:jDdSnKUOYhQspxaw@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require";

async function run() {
    console.log('--- Connecting to Supabase ---');
    const sql = postgres(DATABASE_URL, { ssl: 'require' });

    try {
        console.log('Cleaning up duplicate reviews...');
        const deleted = await sql`
            DELETE FROM reviews a USING reviews b
            WHERE a.id < b.id 
            AND a.user_id = b.user_id 
            AND a.restaurant_id = b.restaurant_id
            RETURNING a.id;
        `;
        console.log(`✅ Cleaned up ${deleted.length} duplicates`);

        console.log('Adding UNIQUE constraint to reviews (user_id, restaurant_id)...');
        await sql`
            ALTER TABLE reviews 
            ADD CONSTRAINT unique_user_restaurant_review UNIQUE (user_id, restaurant_id);
        `;
        console.log('✅ Success: Unique constraint added');

    } catch (error) {
        if (error.code === '42P16' || error.message.includes('already exists')) {
            console.log('ℹ️ Constraint already exists');
        } else {
            console.error('❌ Error:', error);
        }
    } finally {
        await sql.end();
        process.exit(0);
    }
}

run();
