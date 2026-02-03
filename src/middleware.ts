import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

/**
 * Early Return Pattern: Verify session and redirect quickly.
 * Solid: Middleware handles ONLY routing and session validation.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get('session')?.value;

    // 1. Decrypt and verify session
    let user = null;
    if (session) {
        try {
            user = await decrypt(session);
        } catch (err) {
            // Invalid session - clear it and force re-auth if trying to access protected route
            const response = NextResponse.redirect(new URL('/auth', request.url));
            response.cookies.delete('session');
            return response;
        }
    }

    // 2. Protect Admin routes
    if (pathname.startsWith('/admin')) {
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/auth', request.url));
        }
    }

    // 3. Protect Restaurant routes
    if (pathname.startsWith('/restaurant')) {
        if (!user || user.role !== 'RESTAURANT') {
            return NextResponse.redirect(new URL('/auth', request.url));
        }
    }

    // 4. Protect Client Dashboard
    if (pathname.startsWith('/client/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }
    }

    // 5. Redirect logged in users away from /auth
    if (pathname === '/auth' && user) {
        if (user.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/users', request.url));
        if (user.role === 'RESTAURANT') return NextResponse.redirect(new URL('/restaurant/dashboard', request.url));
        return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/restaurant/:path*', '/client/dashboard/:path*', '/auth'],
};
