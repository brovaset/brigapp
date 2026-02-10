import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        profileImageUrl: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { firstName, lastName, phone, role, profileImageUrl } = body

    const updateData: Record<string, unknown> = {}
    if (typeof firstName === 'string') updateData.firstName = firstName.trim()
    if (typeof lastName === 'string') updateData.lastName = lastName.trim()
    if (phone !== undefined) updateData.phone = phone === null || phone === '' ? null : String(phone)
    if (role === 'DRIVER' || role === 'HOST' || role === 'BOTH') updateData.role = role
    if (typeof profileImageUrl === 'string' || profileImageUrl === null) updateData.profileImageUrl = profileImageUrl || null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        profileImageUrl: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

