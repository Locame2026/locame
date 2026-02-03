import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.AUTH_SECRET || 'a-very-secret-key-that-should-be-in-env';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * SoC: Security Layer Wrapper
 * This file encapsulates all security-related logic, making the rest of the app 
 * "blind" to the underlying implementation of JWT or Hashing.
 */

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

export async function login(user: { id: string; email: string; role: string; name: string; restaurantId?: string }) {
    const session = await encrypt(user);

    // Set the session cookie
    (await cookies()).set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });
}

export async function logout() {
    (await cookies()).set('session', '', { expires: new Date(0), path: '/' });
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (err) {
        return null;
    }
}
