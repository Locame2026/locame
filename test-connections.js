const postgres = require('postgres');

const configs = [
    {
        name: "Pooler Hostname - Port 5432 (Session)",
        url: "postgresql://postgres.btvbjqftfhqdoqvayzuq:o2djy16a2AtVBi6k@aws-0-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require"
    },
    {
        name: "Pooler Hostname - Port 6543 (Transaction)",
        url: "postgresql://postgres.btvbjqftfhqdoqvayzuq:o2djy16a2AtVBi6k@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require"
    },
    {
        name: "Pooler IP - Port 6543 (Transaction)",
        url: "postgresql://postgres.btvbjqftfhqdoqvayzuq:o2djy16a2AtVBi6k@16.16.102.12:6543/postgres?sslmode=require"
    },
    {
        name: "Direct Hostname - Port 5432 (Will likely fail DNS)",
        url: "postgresql://postgres:o2djy16a2AtVBi6k@db.btvbjqftfhqdoqvayzuq.supabase.co:5432/postgres?sslmode=require"
    }
];

async function testAll() {
    for (const config of configs) {
        console.log(`\nTesting: ${config.name}...`);
        const sql = postgres(config.url, { connect_timeout: 10 });
        try {
            const result = await sql`SELECT 1 as connected`;
            console.log(`✅ SUCCESS: ${config.name}`);
        } catch (err) {
            console.error(`❌ FAILED: ${config.name}`);
            console.error(`   Error Message: ${err.message}`);
            console.error(`   Error Code: ${err.code}`);
        } finally {
            await sql.end();
        }
    }
}

testAll();
