import { db } from './src/lib/db';

async function findAdmin() {
    try {
        console.log('Searching for admin user...');
        const users = await db.query`
            SELECT email, role 
            FROM user_profiles 
            WHERE role = 'ADMIN'
            LIMIT 5
        `;
        console.log('ADMIN_USERS_FOUND:', users);

        console.log('\nChecking user paco.solarosa@gmail.com...');
        const paco = await db.query`
            SELECT id, email, role, password_hash
            FROM user_profiles
            WHERE email = 'paco.solarosa@gmail.com'
        `;
        console.log('PACO_USER:', paco);

    } catch (error) {
        console.error('FIND_ADMIN_ERROR:', error);
    } finally {
        process.exit();
    }
}

findAdmin();
