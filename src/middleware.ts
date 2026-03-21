import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/ngo-dashboard', '/admin-dashboard', '/profile'];
const authRoutes = ['/login', '/register'];

// Lightweight in-memory rate limiter (per Edge instance)
const ipLimits = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = ipLimits.get(ip);
    
    // Clean up memory (prevent memory leak if many IPs)
    if (ipLimits.size > 10000) ipLimits.clear();

    if (!record) {
        ipLimits.set(ip, { count: 1, lastReset: now });
        return true;
    }
    if (now - record.lastReset > windowMs) {
        record.count = 1;
        record.lastReset = now;
        return true;
    }
    if (record.count >= limit) {
        return false;
    }
    record.count++;
    return true;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // 1. Rate Limiting logic
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
        // Strict limit for auth: 5 requests per minute
        if (!checkRateLimit(ip + '_auth', 5, 60 * 1000)) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }
    } else if (pathname.startsWith('/api/')) {
        // General limit for other APIs: 60 requests per minute
        if (!checkRateLimit(ip + '_api', 60, 60 * 1000)) {
            return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
        }
    }

    // 2. Authentication & Authorization Routing
    const token = request.cookies.get('token')?.value;

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Only redirect AWAY from login/register if we have a hard cookie
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
