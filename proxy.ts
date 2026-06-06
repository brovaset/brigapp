import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, rateLimitExceeded } from '@/lib/rateLimit'

// ---------------------------------------------------------------------------
// Content Security Policy
// ---------------------------------------------------------------------------
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://accounts.google.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.replit.dev https://*.repl.co https://*.amazonaws.com https://*.cloudinary.com",
  "connect-src 'self' https://maps.googleapis.com https://api.stripe.com https://accounts.google.com https://*.replit.dev wss://*.replit.dev ws://localhost:*",
  "frame-src https://js.stripe.com https://accounts.google.com",
  "worker-src blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOrigin(request: NextRequest): string | null {
  return request.headers.get('origin')
}

function getHostOrigin(request: NextRequest): string {
  const host = request.headers.get('host') || ''
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  return `${proto}://${host}`
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

function isWebhookRoute(pathname: string): boolean {
  return pathname === '/api/payments/webhook'
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response     = NextResponse.next()

  // ── Security headers (applied to every response) ────────────────────────
  response.headers.set('Content-Security-Policy', CSP)
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  // ── Skip static assets ───────────────────────────────────────────────────
  if (pathname.startsWith('/_next/')) {
    return response
  }

  // ── API route hardening ──────────────────────────────────────────────────
  if (isApiRoute(pathname)) {
    const origin     = getOrigin(request)
    const hostOrigin = getHostOrigin(request)

    // CORS — block cross-origin requests except the Stripe webhook
    // (webhooks come from Stripe servers without an Origin header)
    if (origin && !isWebhookRoute(pathname)) {
      const allowed =
        origin === hostOrigin ||
        origin.endsWith('.replit.dev') ||
        origin.endsWith('.repl.co') ||
        origin === 'http://localhost:5000' ||
        origin === 'http://localhost:3000'

      if (!allowed) {
        console.log('[SECURITY]', JSON.stringify({
          timestamp: new Date().toISOString(),
          event: 'CORS_VIOLATION',
          origin,
          path: pathname,
        }))
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // CORS headers for allowed origins
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Vary', 'Origin')
    }

    // Preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers })
    }

    // Global API rate-limit fallback (generous — per-route limits are stricter)
    // This guards any future route that might be missing its own rate limit call.
    const rl = rateLimit(request, { limit: 300, windowMs: 60_000 }, 'global:api')
    if (rl.limited) {
      console.log('[SECURITY]', JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'RATE_LIMITED',
        path: pathname,
      }))
      return rateLimitExceeded(rl.resetAt)
    }

    return response
  }

  // ── Public pages — no auth required ─────────────────────────────────────
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/terms' ||
    pathname === '/privacy'
  ) {
    return response
  }

  // ── Protected frontend routes ─────────────────────────────────────────────
  const protectedRoutes = ['/dashboard', '/search', '/host', '/bookings', '/messages', '/profile']
  const isProtected     = protectedRoutes.some((r) => pathname.startsWith(r))

  if (isProtected) {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
