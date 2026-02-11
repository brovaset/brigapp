import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  calculateDistance,
  calculateBookingPrice,
  cn,
  parseResponseJson,
} from './utils'

describe('formatCurrency', () => {
  it('formats number as USD', () => {
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(10.5)).toBe('$10.50')
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })
})

describe('calculateDistance', () => {
  it('returns 0 for same point', () => {
    expect(calculateDistance(40.7, -74, 40.7, -74)).toBe(0)
  })

  it('returns positive distance in km for different points', () => {
    const d = calculateDistance(40.7, -74, 40.71, -74.01)
    expect(d).toBeGreaterThan(0)
    expect(typeof d).toBe('number')
  })
})

describe('calculateBookingPrice', () => {
  it('charges by hour when under 24 hours', () => {
    const start = new Date('2026-02-10T10:00:00Z')
    const end = new Date('2026-02-10T12:00:00Z')
    expect(calculateBookingPrice(start, end, 5, 50)).toBe(10) // 2 hours * 5
  })

  it('charges by day when 24 hours or more', () => {
    const start = new Date('2026-02-10T00:00:00Z')
    const end = new Date('2026-02-11T00:00:00Z')
    expect(calculateBookingPrice(start, end, 10, 80)).toBe(80)
  })

  it('ceil hours for partial hours', () => {
    const start = new Date('2026-02-10T10:00:00Z')
    const end = new Date('2026-02-10T10:30:00Z')
    expect(calculateBookingPrice(start, end, 10, 100)).toBe(10) // 0.5 -> ceil 1
  })
})

describe('cn', () => {
  it('joins class names and filters falsy', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('a', undefined, 'b')).toBe('a b')
    expect(cn('a', null, false, 'b')).toBe('a b')
  })

  it('returns empty string when all falsy', () => {
    expect(cn(undefined, null, false)).toBe('')
  })
})

describe('parseResponseJson', () => {
  it('parses JSON object response', async () => {
    const res = new Response('{"foo":"bar"}')
    const data = await parseResponseJson<{ foo: string }>(res)
    expect(data).toEqual({ foo: 'bar' })
  })

  it('parses JSON array response', async () => {
    const res = new Response('[1,2,3]')
    const data = await parseResponseJson(res)
    expect(data).toEqual([1, 2, 3])
  })

  it('throws when body is not JSON', async () => {
    const res = new Response('<html>')
    await expect(parseResponseJson(res)).rejects.toThrow()
  })

  it('throws when body is invalid JSON', async () => {
    const res = new Response('{ invalid }')
    await expect(parseResponseJson(res)).rejects.toThrow('Invalid JSON')
  })
})
