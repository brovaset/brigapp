import { cookies } from 'next/headers'
import { verifyToken, TokenPayload } from './auth'

export interface Session {
  userId: string
  email: string
  role: string
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  }
}

