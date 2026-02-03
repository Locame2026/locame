
const postgres = require('postgres');
require('dotenv').config({ path: '.env.production' });

async function testConnection() {
    const sql = postgres(process.env.DATABASE_URL, {
        ssl: 'require',
        connect_timeout: 30
    });

    try {
        console.log('Testing connection to:', process.env.DATABASE_URL.split('@')[1]);
        const result = await sql`SELECT 1 as connected`;
        console.log('Connection successful:', result);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await sql.end();
    }
}

testConnection();
