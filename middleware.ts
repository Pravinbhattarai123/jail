import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/profilepage']

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const requiresAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
    if (!requiresAuth) return NextResponse.next()

    const token = req.cookies.get('auth')?.value
    // NOTE: Middleware runs on the Edge runtime. jsonwebtoken is not Edge-compatible.
    // We only check for the presence of the cookie here. Signature verification is done
    // on server routes (e.g., /api/auth/me, admin APIs). For stronger checks at the edge,
    // switch to `jose` and verify with WebCrypto.
    if (!token) {
        const url = new URL('/login', req.url)
        // Preserve full path with query if any
        const nextPath = req.nextUrl.pathname + req.nextUrl.search
        url.searchParams.set('next', nextPath)
        return NextResponse.redirect(url)
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/profilepage/:path*'],
}
