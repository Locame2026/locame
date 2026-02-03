import { hashPassword, comparePassword, encrypt, decrypt } from './src/lib/auth';

async function testAuth() {
    console.log('--- Testing Auth Logic ---');

    // 1. Test Password Hashing
    const password = 'my-secure-password';
    const hash = await hashPassword(password);
    console.log('Hash generated:', hash.substring(0, 10) + '...');

    const isMatch = await comparePassword(password, hash);
    console.log('Password matches hash:', isMatch ? '✅' : '❌');

    const isWrongMatch = await comparePassword('wrong-password', hash);
    console.log('Wrong password mismatch:', !isWrongMatch ? '✅' : '❌');

    // 2. Test JWT Encryption
    const payload = { id: '123', role: 'ADMIN' };
    const token = await encrypt(payload);
    console.log('Token generated:', token.substring(0, 20) + '...');

    const decoded = await decrypt(token);
    console.log('Decoded payload matches:', (decoded.id === payload.id && decoded.role === payload.role) ? '✅' : '❌');

    console.log('--- Auth Test Completed ---');
}

testAuth().catch(console.error);
