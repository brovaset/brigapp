import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// GET host earnings, available balance, Stripe Connect status, and transaction history
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

    let stripeConnected = false
    let payoutsEnabled = false
    if (user?.stripeAccountId && process.env.STRIPE_SECRET_KEY) {
      try {
        const account = await stripe.accounts.retrieve(user.stripeAccountId)
        stripeConnected = account.details_submitted ?? false
        payoutsEnabled = account.payouts_enabled ?? false
      } catch {
        stripeConnected = false
        payoutsEnabled = false
      }
    }

    // Get all completed bookings for this host
    const bookings = await prisma.booking.findMany({
      where: {
        hostId: session.userId,
        status: 'COMPLETED',
        payment: {
          status: 'COMPLETED',
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate totals
    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    const totalBookings = bookings.length
    const thisMonthEarnings = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt)
        const now = new Date()
        return bookingDate.getMonth() === now.getMonth() &&
               bookingDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, booking) => sum + booking.totalAmount, 0)

    // Available balance = total earnings - amount already paid out
    const paidOut = await prisma.payout.aggregate({
      where: { hostId: session.userId, status: 'PAID' },
      _sum: { amount: true },
    })
    const totalPaidOut = paidOut._sum.amount ?? 0
    const availableBalance = Math.max(0, totalEarnings - totalPaidOut)

    // Recent payouts
    const payouts = await prisma.payout.findMany({
      where: { hostId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      totalEarnings,
      totalBookings,
      thisMonthEarnings,
      availableBalance,
      totalPaidOut,
      stripeConnected,
      payoutsEnabled,
      payouts,
      transactions: bookings.map(booking => ({
        id: booking.id,
        listing: booking.listing,
        driver: booking.driver,
        amount: booking.totalAmount,
        date: booking.createdAt,
        paymentStatus: booking.payment?.status,
      })),
    })
  } catch (error) {
    console.error('Get earnings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

