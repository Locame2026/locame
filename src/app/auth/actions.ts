'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { login, logout } from '@/lib/auth';
import { hashPassword, comparePassword } from '@/lib/password';
import { getAppSession } from '@/lib/auth.wrapper';
import { sendPasswordResetEmail } from '@/lib/mail';

/**
 * SoC: Auth Layer handles user identification and session lifecycle.
 * PATTERN: Early Return para mejorar legibilidad (Regla IV.3).
 * SOLID: Funciones atómicas.
 */

export async function handleRegisterClient(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const birthday = formData.get('birthday') as string;

    // 1. Validaciones iniciales (Early Return)
    if (password !== confirmPassword) {
        return { error: 'Las contraseñas no coinciden' };
    }

    try {
        const hashedPassword = await hashPassword(password);

        // 2. Interacción con DB vía Wrapper
        await db.query`
            INSERT INTO user_profiles (id, email, password_hash, first_name, last_name, phone, birthday, role)
            VALUES (gen_random_uuid(), ${email}, ${hashedPassword}, ${firstName}, ${lastName}, ${phone}, ${birthday || null}, 'CLIENTE')
        `;

        return { success: true };
    } catch (error: any) {
        console.error('AUTH_ERROR: Client registration failed:', error);
        if (error.code === '23505') {
            return { error: 'El email ya está registrado' };
        }
        return { error: 'Error al registrar el usuario' };
    }
}

export async function handleRegisterRestaurant(formData: FormData) {
    const restaurantName = formData.get('restaurantName') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const address = formData.get('address') as string;
    const contactPhone = formData.get('contactPhone') as string;

    if (password !== confirmPassword) {
        return { error: 'Las contraseñas no coinciden' };
    }

    try {
        const hashedPassword = await hashPassword(password);

        // Transacción atómica (Regla II.3)
        const result = await db.begin(async (tx) => {
            const [user] = await tx`
                INSERT INTO user_profiles (id, email, password_hash, first_name, role)
                VALUES (gen_random_uuid(), ${contactEmail}, ${hashedPassword}, ${restaurantName}, 'RESTAURANT')
                RETURNING id
            `;

            const [restaurant] = await tx`
                INSERT INTO restaurants (id, name, address, contact_email, contact_phone)
                VALUES (gen_random_uuid(), ${restaurantName}, ${address}, ${contactEmail}, ${contactPhone})
                RETURNING id
            `;

            await tx`
                UPDATE user_profiles SET restaurant_id = ${restaurant.id} WHERE id = ${user.id}
            `;

            return { userId: user.id, restaurantId: restaurant.id };
        });

        return { success: true, ...result };
    } catch (error: any) {
        console.error('AUTH_ERROR: Restaurant registration failed:', error);
        if (error.code === '23505') {
            return { error: 'El email ya está registrado' };
        }
        return { error: 'Error al registrar el restaurante' };
    }
}

export async function handleRegisterCompany(formData: FormData) {
    const companyName = formData.get('companyName') as string;
    const cif = formData.get('cif') as string;
    const adminEmail = formData.get('adminEmail') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
        return { error: 'Las contraseñas no coinciden' };
    }

    try {
        const hashedPassword = await hashPassword(password);

        const result = await db.begin(async (tx) => {
            // 1. Create the company
            const [company] = await tx`
                INSERT INTO companies (name, cif, available_balance)
                VALUES (${companyName}, ${cif}, 0)
                RETURNING id
            `;

            // 2. Create the admin user
            const [user] = await tx`
                INSERT INTO user_profiles (id, email, password_hash, first_name, role, company_id)
                VALUES (gen_random_uuid(), ${adminEmail}, ${hashedPassword}, ${companyName}, 'COMPANY_ADMIN', ${company.id})
                RETURNING id
            `;

            return { userId: user.id, companyId: company.id };
        });

        return { success: true, ...result };
    } catch (error: any) {
        console.error('AUTH_ERROR: Company registration failed:', error);
        if (error.code === '23505') {
            return { error: 'El email o CIF ya está registrado' };
        }
        return { error: 'Error al registrar la empresa' };
    }
}

/**
 * Iniciar sesión: Diagnóstico de arquitectura.
 */
export async function handleLogin(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        // 1. Buscar usuario vía Wrapper
        const results = await db.query`
            SELECT id, email, password_hash, role, first_name as name, restaurant_id 
            FROM user_profiles 
            WHERE email = ${email}
            LIMIT 1
        `;

        const user = results[0];

        if (!user) {
            return { error: 'Credenciales inválidas' };
        }

        // 2. Validar password
        const isPasswordCorrect = await comparePassword(password, user.password_hash);
        if (!isPasswordCorrect) {
            return { error: 'Credenciales inválidas' };
        }

        // 3. Crear Sesión (Capa de Auth)
        await login({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            restaurantId: user.restaurant_id
        });

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                restaurantId: user.restaurant_id
            }
        };
    } catch (error) {
        // Regla IV.4: No silenciar errores.
        console.error('LOGIN_CRITICAL_ERROR:', error);
        return { error: 'Error de conexión o servidor' };
    }
}

export async function handleLogout() {
    await logout();
    // Revalidamos para asegurar que el middleware detecte el cambio de sesión
    revalidatePath('/');
    redirect('/');
}

export async function handleForgotPassword(formData: FormData) {
    const email = formData.get('email') as string;

    try {
        const [user] = await db.query`SELECT id FROM user_profiles WHERE email = ${email}`;

        if (!user) {
            // Regla IV.3: Early Return - No revelamos si el usuario existe por seguridad,
            // pero el mensaje de éxito es genérico.
            return { success: true, message: 'Si el correo existe, recibirás un enlace de recuperación.' };
        }

        // Generamos un token (id de usuario + timestamp por ahora, muy simplificado)
        const token = btoa(`${user.id}:${Date.now()}`);
        // 3. Enviar Correo Real
        const resetResult = await sendPasswordResetEmail(email, token);

        if (!resetResult.success) {
            return { error: 'Error al enviar el correo de recuperación. Revisa tu conexión.' };
        }

        return { message: 'Si el email existe, recibirás un enlace de recuperación' };
    } catch (error) {
        console.error('AUTH_ERROR: Forgot password failed:', error);
        return { error: 'Error al procesar la solicitud' };
    }
}

export async function handleResetPassword(formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
        return { error: 'Las contraseñas no coinciden' };
    }

    try {
        // Decodificar token (Extremadamente simplificado para este MVP)
        const decoded = atob(token);
        const [userId, timestamp] = decoded.split(':');

        // Validar expiración (p.ej. 1 hora = 3600000ms)
        if (Date.now() - parseInt(timestamp) > 3600000) {
            return { error: 'El enlace ha expirado' };
        }

        const hashedPassword = await hashPassword(password);

        await db.query`
            UPDATE user_profiles 
            SET password_hash = ${hashedPassword} 
            WHERE id = ${userId}
        `;

        return { success: true };
    } catch (error) {
        console.error('AUTH_ERROR: Reset password failed:', error);
        return { error: 'Token inválido o error en servidor' };
    }
}

/**
 * Acciones Protegidas: Uso de getAppSession Wrapper.
 */
export async function getAllUsers() {
    try {
        const session = await getAppSession();

        if (!session || session.role !== 'ADMIN') {
            return [];
        }

        return await db.query`
            SELECT id, email, first_name, last_name, role, created_at 
            FROM user_profiles 
            ORDER BY created_at DESC
        `;
    } catch (error) {
        console.error('AUTH_ERROR: Fetch users failed:', error);
        return [];
    }
}

export async function updateUserRole(userId: string, newRole: string) {
    try {
        const session = await getAppSession();

        if (!session || session.role !== 'ADMIN') {
            return { error: 'No autorizado' };
        }

        await db.query`
            UPDATE user_profiles SET role = ${newRole} WHERE id = ${userId}
        `;

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('AUTH_ERROR: Role update failed:', error);
        return { error: 'Error al actualizar el rol' };
    }
}
