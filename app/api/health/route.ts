import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, LIMITS, rateLimitExceeded } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
  const rl = rateLimit(request, LIMITS.read, 'read:health')
  if (rl.limited) return rateLimitExceeded(rl.resetAt)

  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status:    'healthy',
      timestamp: new Date().toISOString(),
      database:  'connected',
    })
  } catch {
    return NextResponse.json(
      {
        status:    'unhealthy',
        timestamp: new Date().toISOString(),
        database:  'disconnected',
      },
      { status: 503 },
    )
  }
}
