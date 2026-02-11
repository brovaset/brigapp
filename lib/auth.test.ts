import { describe, it, expect } from 'vitest'
import {
  generateToken,
  verifyToken,
  getTokenFromRequest,
  getUserIdFromRequest,
  hashPassword,
  verifyPassword,
} from './auth'
import { NextRequest } from 'next/server'

describe('generateToken', () => {
  it('returns a non-empty string', () => {
    const token = generateToken({
      userId: 'user-1',
      email: 'test@example.com',
      role: 'BOTH',
    })
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })
})

describe('verifyToken', () => {
  it('returns payload for valid token', () => {
    const payload = { userId: 'user-1', email: 'test@example.com', role: 'BOTH' }
    const token = generateToken(payload)
    const decoded = verifyToken(token)
    expect(decoded).toMatchObject(payload)
    expect(decoded?.userId).toBe(payload.userId)
    expect(decoded?.email).toBe(payload.email)
    expect(decoded?.role).toBe(payload.role)
  })

  it('returns null for invalid token', () => {
    expect(verifyToken('invalid.token.here')).toBe(null)
    expect(verifyToken('')).toBe(null)
  })
})

describe('getTokenFromRequest', () => {
  it('extracts token from Bearer header', () => {
    const req = new NextRequest('http://localhost', {
      headers: { Authorization: 'Bearer my-token-123' },
    })
    expect(getTokenFromRequest(req)).toBe('my-token-123')
  })

  it('returns null when no Authorization header', () => {
    const req = new NextRequest('http://localhost')
    expect(getTokenFromRequest(req)).toBe(null)
  })

  it('returns null when Authorization is not Bearer', () => {
    const req = new NextRequest('http://localhost', {
      headers: { Authorization: 'Basic xyz' },
    })
    expect(getTokenFromRequest(req)).toBe(null)
  })
})

describe('getUserIdFromRequest', () => {
  it('returns userId when valid token in header', () => {
    const token = generateToken({
      userId: 'user-abc',
      email: 'u@x.com',
      role: 'BOTH',
    })
    const req = new NextRequest('http://localhost', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(getUserIdFromRequest(req)).toBe('user-abc')
  })

  it('returns null when no token', () => {
    const req = new NextRequest('http://localhost')
    expect(getUserIdFromRequest(req)).toBe(null)
  })

  it('returns null when token is invalid', () => {
    const req = new NextRequest('http://localhost', {
      headers: { Authorization: 'Bearer invalid' },
    })
    expect(getUserIdFromRequest(req)).toBe(null)
  })
})

describe('hashPassword', () => {
  it('returns a string different from input', async () => {
    const hashed = await hashPassword('plain')
    expect(typeof hashed).toBe('string')
    expect(hashed).not.toBe('plain')
  })

  it('produces different hashes for same password (salt)', async () => {
    const a = await hashPassword('same')
    const b = await hashPassword('same')
    expect(a).not.toBe(b)
  })
})

describe('verifyPassword', () => {
  it('returns true for correct password', async () => {
    const hashed = await hashPassword('secret123')
    const ok = await verifyPassword('secret123', hashed)
    expect(ok).toBe(true)
  })

  it('returns false for wrong password', async () => {
    const hashed = await hashPassword('secret123')
    const ok = await verifyPassword('wrong', hashed)
    expect(ok).toBe(false)
  })
})
