const postgres = require('postgres');

async function findAdmin() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('DATABASE_URL not found');
        return;
    }

    // Probar con el Hostname Original
    console.log('--- Testing with Hostname ---');
    const sqlHostname = postgres(dbUrl, { connect_timeout: 10, ssl: 'require', prepare: false });
    try {
        const result = await sqlHostname`SELECT 1 as connected`;
        console.log('✅ Hostname Connection Success:', JSON.stringify(result));
    } catch (e) {
        console.error('❌ Hostname Connection Failed:', e.message);
    } finally {
        await sqlHostname.end();
    }

    // Probar con el IP Directo (51.21.18.29)
    console.log('\n--- Testing with Direct IP (51.21.18.29) ---');
    const ipUrl = dbUrl.replace('aws-1-eu-north-1.pooler.supabase.com', '51.21.18.29');
    const sqlIp = postgres(ipUrl, { connect_timeout: 10, ssl: 'require', prepare: false });
    try {
        const result = await sqlIp`SELECT 1 as connected`;
        console.log('✅ IP Connection Success:', JSON.stringify(result));
    } catch (e) {
        console.error('❌ IP Connection Failed:', e.message);
    } finally {
        await sqlIp.end();
    }

    process.exit();
}

findAdmin();
