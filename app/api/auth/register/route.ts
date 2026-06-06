import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { rateLimit, LIMITS, rateLimitExceeded } from '@/lib/rateLimit'
import {
  isValidEmail,
  isValidPassword,
  validatePhoneNumber,
  sanitizeRequired,
  validateEnum,
  ALLOWED_ROLES,
} from '@/lib/validation'
import { logSecurityEvent, isBodyTooLarge } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ───────────────────────────────────────────────────────
    const rl = rateLimit(request, LIMITS.auth, 'auth:register')
    if (rl.limited) {
      logSecurityEvent('RATE_LIMITED', { path: '/api/auth/register' })
      return rateLimitExceeded(rl.resetAt)
    }

    // ── Body size guard ─────────────────────────────────────────────────────
    if (isBodyTooLarge(request, 20 * 1024)) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { email, password, phone, role } = body

    // Sanitize name fields
    const firstName = sanitizeRequired(body.firstName, 60)
    const lastName  = sanitizeRequired(body.lastName, 60)

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid field types' }, { status: 400 })
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, and number' },
        { status: 400 },
      )
    }

    // Validate phone if provided
    if (phone && !validatePhoneNumber(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    const validRole       = validateEnum(role, ALLOWED_ROLES) ? role : 'BOTH'
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      logSecurityEvent('REGISTER_FAILURE', { email: normalizedEmail, reason: 'email_already_exists' })
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email:     normalizedEmail,
        password:  hashedPassword,
        firstName,
        lastName,
        phone:     phone ? phone.trim().slice(0, 20) : null,
        role:      validRole,
      },
    })

    logSecurityEvent('REGISTER_SUCCESS', { email: normalizedEmail, userId: user.id })

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
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
