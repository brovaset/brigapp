import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

/**
 * POST - Create Stripe Connect Express account link for host onboarding.
 * If host has no stripeAccountId, creates Express account first.
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
      select: { id: true, email: true, firstName: true, lastName: true, stripeAccountId: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let accountId = user.stripeAccountId

    // Create Express account if host doesn't have one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          name: `${user.firstName} ${user.lastName}`.trim() || 'Host',
        },
      })
      accountId = account.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/host/earnings?refresh=true`,
      return_url: `${baseUrl}/host/earnings?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: unknown) {
    console.error('Create account link error:', error)

    const stripeError = error as { type?: string; message?: string; code?: string }
    if (stripeError.type && stripeError.message) {
      return NextResponse.json(
        { error: stripeError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account link. Ensure Stripe Connect is enabled in your Stripe Dashboard.' },
      { status: 500 }
    )
  }
}
