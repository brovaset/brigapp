import { prisma } from '@/lib/prisma'
import type { Session } from '@/lib/session'

export async function getBookingsServer(session: Session) {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { driverId: session.userId },
        { hostId: session.userId },
      ],
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          photos: true,
        },
      },
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      host: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      payment: true,
      _count: { select: { messages: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return bookings
}
