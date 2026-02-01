import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyGoogleToken, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { credential } = body

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential required' },
        { status: 400 }
      )
    }

    const googleUser = await verifyGoogleToken(credential)

    if (!googleUser || !googleUser.email_verified) {
      return NextResponse.json(
        { error: 'Invalid Google credential' },
        { status: 401 }
      )
    }

    const email = googleUser.email.toLowerCase().trim()
    const firstName = googleUser.given_name || email.split('@')[0]
    const lastName = googleUser.family_name || ''

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId: googleUser.sub },
        ],
      },
    })

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.sub },
        })
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          googleId: googleUser.sub,
          role: 'BOTH',
        },
      })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
