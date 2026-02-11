import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

/**
 * POST - Cash out available earnings to host's connected Stripe account.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, stripeAccountId: true },
    })

    if (!user || !user.stripeAccountId) {
      return NextResponse.json(
        { error: 'Connect your bank account first to cash out' },
        { status: 400 }
      )
    }

    // Compute available balance: completed booking earnings minus payouts
    const completedBookings = await prisma.booking.findMany({
      where: {
        hostId: session.userId,
        status: 'COMPLETED',
        payment: { status: 'COMPLETED' },
      },
      select: { totalAmount: true },
    })

    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0)

    const paidOut = await prisma.payout.aggregate({
      where: { hostId: session.userId, status: 'PAID' },
      _sum: { amount: true },
    })

    const totalPaidOut = paidOut._sum.amount ?? 0
    const availableBalance = Math.max(0, totalEarnings - totalPaidOut)

    if (availableBalance < 1) {
      return NextResponse.json(
        { error: 'Minimum cash out is $1.00' },
        { status: 400 }
      )
    }

    // Round to 2 decimals and convert to cents
    const amountCents = Math.floor(availableBalance * 100)

    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: user.stripeAccountId,
      description: `BRIGAP earnings payout`,
    })

    await prisma.payout.create({
      data: {
        hostId: session.userId,
        amount: availableBalance,
        stripeTransferId: transfer.id,
        status: 'PAID',
      },
    })

    return NextResponse.json({
      success: true,
      amount: availableBalance,
      transferId: transfer.id,
    })
  } catch (error: unknown) {
    console.error('Cash out error:', error)

    const err = error as { type?: string; message?: string }
    if (err.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: err.message || 'Transfer failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Cash out failed' },
      { status: 500 }
    )
  }
}

/**
 * GET - List payout history for the host.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payouts = await prisma.payout.findMany({
      where: { hostId: session.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error('Get payouts error:', error)
    return NextResponse.json(
      { error: 'Failed to get payout history' },
      { status: 500 }
    )
  }
}
