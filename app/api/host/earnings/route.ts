import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET host earnings and transaction history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Get pending payouts (bookings with completed payments but not yet paid out)
    const pendingPayouts = bookings.filter(
      booking => booking.payment?.status === 'COMPLETED'
    )

    return NextResponse.json({
      totalEarnings,
      totalBookings,
      thisMonthEarnings,
      pendingPayouts: pendingPayouts.length,
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

