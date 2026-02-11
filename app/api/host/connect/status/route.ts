import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

/**
 * GET - Check if host has connected Stripe account and if it's fully onboarded.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { stripeAccountId: true },
    })

    if (!user || !user.stripeAccountId) {
      return NextResponse.json({ stripeConnected: false, chargesEnabled: false })
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId)
    const chargesEnabled = account.charges_enabled ?? false
    const payoutsEnabled = account.payouts_enabled ?? false
    const detailsSubmitted = account.details_submitted ?? false

    return NextResponse.json({
      stripeConnected: true,
      stripeAccountId: user.stripeAccountId,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    })
  } catch (error) {
    console.error('Get connect status error:', error)
    return NextResponse.json(
      { error: 'Failed to get connect status' },
      { status: 500 }
    )
  }
}
