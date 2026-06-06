import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { rateLimit, LIMITS, rateLimitExceeded } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import {
  checkLockout,
  recordFailedAttempt,
  clearLockout,
  timingSafeCompare,
  logSecurityEvent,
  isBodyTooLarge,
} from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ───────────────────────────────────────────────────────
    const rl = rateLimit(request, LIMITS.auth, 'auth:login')
    if (rl.limited) {
      logSecurityEvent('RATE_LIMITED', { path: '/api/auth/login' })
      return rateLimitExceeded(rl.resetAt)
    }

    // ── Body size guard ─────────────────────────────────────────────────────
    if (isBodyTooLarge(request, 10 * 1024)) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { email, password } = body

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const lockoutKey      = `login:${normalizedEmail}`

    // ── Account lockout check ───────────────────────────────────────────────
    const lockout = checkLockout(lockoutKey)
    if (lockout.locked) {
      const retryAfterSecs = lockout.lockedUntil
        ? Math.max(1, Math.ceil((lockout.lockedUntil - Date.now()) / 1000))
        : 900
      logSecurityEvent('LOGIN_LOCKED', { email: normalizedEmail })
      return NextResponse.json(
        { error: 'Account temporarily locked due to too many failed attempts. Try again later.' },
        {
          status: 423,
          headers: { 'Retry-After': String(retryAfterSecs) },
        },
      )
    }

    // ── Look up user ────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // ── Timing-safe comparison (always runs bcrypt) ─────────────────────────
    const passwordValid = await timingSafeCompare(password, user?.password ?? null)

    if (!user || !passwordValid) {
      const updated = recordFailedAttempt(lockoutKey)
      logSecurityEvent('LOGIN_FAILURE', { email: normalizedEmail })
      if (updated.locked) {
        return NextResponse.json(
          { error: 'Account temporarily locked due to too many failed attempts. Try again later.' },
          { status: 423 },
        )
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Google-only account
    if (!user.password) {
      recordFailedAttempt(lockoutKey)
      logSecurityEvent('LOGIN_FAILURE', { email: normalizedEmail, reason: 'google_only_account' })
      return NextResponse.json(
        { error: 'This account uses Google sign-in. Please continue with Google.' },
        { status: 401 },
      )
    }

    // ── Success ─────────────────────────────────────────────────────────────
    clearLockout(lockoutKey)
    logSecurityEvent('LOGIN_SUCCESS', { email: normalizedEmail, userId: user.id })

    const token = generateToken({
      userId: user.id,
      email:  user.email,
      role:   user.role,
    })

    const response = NextResponse.json({
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role,
      },
      token,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60,
      path:     '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
