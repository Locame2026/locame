
const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connection = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function migrate() {
    try {
        console.log('Adding password_reset_required column to user_profiles...');
        await connection`
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE;
        `;
        console.log('Column added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
