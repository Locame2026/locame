
const postgres = require('postgres');

async function run() {
    const sql = postgres('postgresql://postgres.btvbjqftfhqdoqvayzuq:jDdSnKUOYhQspxaw@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });
    try {
        console.log('Checking restaurants table columns...');
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'restaurants'
        `;
        console.log('RESTAURANTS_COLUMNS:', JSON.stringify(columns, null, 2));

        console.log('Checking menus table columns...');
        const menuColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'menus'
        `;
        console.log('MENUS_COLUMNS:', JSON.stringify(menuColumns, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

run();
