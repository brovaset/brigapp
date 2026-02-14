import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await prisma.message.findMany({
      where: {
        listingId: { not: null },
        OR: [
          { senderId: session.userId },
          { receiverId: session.userId },
        ],
      },
      include: {
        listing: {
          select: { id: true, title: true, hostId: true },
        },
        sender: {
          select: { id: true, firstName: true, lastName: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    type ThreadKey = string
    type Thread = {
      listingId: string
      listingTitle: string
      hostId: string
      otherUserId: string
      otherUser: { id: string; firstName: string; lastName: string }
      lastMessage: { content: string | null; imageUrl: string | null; createdAt: string }
      unreadCount: number
    }

    const threadMap = new Map<ThreadKey, Thread>()

    for (const msg of messages) {
      if (!msg.listingId || !msg.listing) continue
      const otherUserId = msg.senderId === session.userId ? msg.receiverId : msg.senderId
      const otherUser = msg.senderId === session.userId ? msg.receiver : msg.sender
      const key: ThreadKey = `${msg.listingId}:${otherUserId}`

      if (!threadMap.has(key)) {
        threadMap.set(key, {
          listingId: msg.listing.id,
          listingTitle: msg.listing.title,
          hostId: msg.listing.hostId,
          otherUserId,
          otherUser: {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
          },
          lastMessage: {
            content: msg.content,
            imageUrl: msg.imageUrl,
            createdAt: msg.createdAt.toISOString(),
          },
          unreadCount: 0,
        })
      }
      const thread = threadMap.get(key)!
      if (msg.receiverId === session.userId && !msg.isRead) {
        thread.unreadCount += 1
      }
    }

    const threads = Array.from(threadMap.values())

    return NextResponse.json({ threads })
  } catch (error) {
    console.error('Get inquiry threads error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
