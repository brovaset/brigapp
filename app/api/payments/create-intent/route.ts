import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { rateLimit, LIMITS, rateLimitExceeded } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, LIMITS.write, 'write:payments')
    if (rl.limited) return rateLimitExceeded(rl.resetAt)

    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env' },
        { status: 503 }
      )
    }

    if (booking.driverId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Booking already processed' },
        { status: 400 }
      )
    }

    // Create payment intent (use automatic_payment_methods for Payment Element)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: booking.id,
        driverId: booking.driverId,
        hostId: booking.hostId,
      },
    })

    // Keep booking PENDING until payment succeeds (webhook will update)

    // Create payment record (status PENDING until webhook confirms)
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentId: paymentIntent.id,
        amount: booking.totalAmount,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

