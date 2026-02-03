const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
const dbUrl = dbUrlMatch[1];
const sql = postgres(dbUrl);

async function testRegister() {
    const restaurantName = "Test Restaurant " + Date.now();
    const address = "Test Address 123";
    const contactEmail = "test" + Date.now() + "@test.com";
    const contactPhone = "123456789";
    const password = "password123";

    try {
        console.log('Starting transaction...');
        const result = await sql.begin(async (sql) => {
            console.log('Inserting user profile...');
            const userResult = await sql`
                INSERT INTO user_profiles (id, email, password_hash, first_name, role)
                VALUES (gen_random_uuid(), ${contactEmail}, ${password}, ${restaurantName}, 'RESTAURANT')
                RETURNING id
            `;
            const user = userResult[0];
            console.log('User inserted:', user);

            console.log('Inserting restaurant...');
            const restaurantResult = await sql`
                INSERT INTO restaurants (id, name, address, contact_email, contact_phone)
                VALUES (gen_random_uuid(), ${restaurantName}, ${address}, ${contactEmail}, ${contactPhone})
                RETURNING id
            `;
            const restaurant = restaurantResult[0];
            console.log('Restaurant inserted:', restaurant);

            console.log('Updating user profile with restaurant_id...');
            await sql`
                UPDATE user_profiles SET restaurant_id = ${restaurant.id} WHERE id = ${user.id}
            `;

            return { userId: user.id, restaurantId: restaurant.id };
        });

        console.log('SUCCESS:', result);
    } catch (error) {
        console.error('FAILURE!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } finally {
        await sql.end();
        process.exit();
    }
}

testRegister();
