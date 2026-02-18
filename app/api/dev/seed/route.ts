import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

/** Dev-only: seeds test user test@brigap.com / Test123! */
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }
  try {
    const password = await hashPassword('Test123!')
    const user = await prisma.user.upsert({
      where: { email: 'test@brigap.com' },
      update: { password },
      create: {
        email: 'test@brigap.com',
        password,
        firstName: 'Test',
        lastName: 'User',
        role: 'BOTH',
      },
    })
    return NextResponse.json({
      ok: true,
      message: 'Test user created/updated',
      email: user.email,
      credentials: 'test@brigap.com / Test123!',
    })
  } catch (e) {
    console.error('Dev seed error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Seed failed' },
      { status: 500 }
    )
  }
}
