import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPassword,
  isValidDateRange,
  sanitizeString,
  validateBookingDates,
  validateLicensePlate,
  validatePhoneNumber,
} from './validation'

describe('isValidEmail', () => {
  it('returns true for valid emails', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true)
  })

  it('returns false for invalid emails', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('no-at-sign')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('nodot@domain')).toBe(false)
    expect(isValidEmail('spaces in@email.com')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('returns true for valid passwords (8+ chars, upper, lower, number)', () => {
    expect(isValidPassword('ValidPass1')).toBe(true)
    expect(isValidPassword('Abcd1234')).toBe(true)
    expect(isValidPassword('LongerPass99')).toBe(true)
  })

  it('returns false for weak passwords', () => {
    expect(isValidPassword('short')).toBe(false)
    expect(isValidPassword('nouppercase1')).toBe(false)
    expect(isValidPassword('NOLOWERCASE1')).toBe(false)
    expect(isValidPassword('NoNumberHere')).toBe(false)
    expect(isValidPassword('')).toBe(false)
  })
})

describe('isValidDateRange', () => {
  it('returns true when start < end and start is in the future', () => {
    const start = new Date()
    start.setDate(start.getDate() + 1)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)
    expect(isValidDateRange(start, end)).toBe(true)
  })

  it('returns false when start >= end', () => {
    const start = new Date()
    start.setDate(start.getDate() + 1)
    const end = new Date(start)
    expect(isValidDateRange(start, end)).toBe(false)
    expect(isValidDateRange(end, start)).toBe(false)
  })

  it('returns false when start is in the past', () => {
    const start = new Date()
    start.setDate(start.getDate() - 1)
    const end = new Date()
    end.setDate(end.getDate() + 1)
    expect(isValidDateRange(start, end)).toBe(false)
  })
})

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  foo  ')).toBe('foo')
  })

  it('removes < and >', () => {
    expect(sanitizeString('<script>')).toBe('script')
    expect(sanitizeString('a<b>c')).toBe('abc')
  })

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('')
  })
})

describe('validateBookingDates', () => {
  it('returns error for invalid date format', () => {
    expect(validateBookingDates('not-a-date', '2026-02-10')).toEqual({
      valid: false,
      error: 'Invalid date format',
    })
  })

  it('returns error when end time is not after start time', () => {
    const start = new Date()
    start.setDate(start.getDate() + 2)
    const end = new Date(start)
    expect(validateBookingDates(start, end)).toEqual({
      valid: false,
      error: 'End time must be after start time',
    })
  })

  it('returns error when start time is in the past', () => {
    const start = new Date()
    start.setDate(start.getDate() - 1)
    const end = new Date()
    end.setDate(end.getDate() + 1)
    expect(validateBookingDates(start, end)).toEqual({
      valid: false,
      error: 'Start time must be in the future',
    })
  })

  it('returns error when booking is more than 1 year in advance', () => {
    const start = new Date()
    start.setFullYear(start.getFullYear() + 2)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    expect(validateBookingDates(start, end)).toEqual({
      valid: false,
      error: 'Booking cannot be more than 1 year in advance',
    })
  })

  it('returns valid for future start and end after start within 1 year', () => {
    const start = new Date()
    start.setDate(start.getDate() + 5)
    const end = new Date(start)
    end.setHours(end.getHours() + 2)
    expect(validateBookingDates(start, end)).toEqual({ valid: true })
  })
})

describe('validateLicensePlate', () => {
  it('returns true for 2-8 alphanumeric characters', () => {
    expect(validateLicensePlate('AB')).toBe(true)
    expect(validateLicensePlate('ABC1234')).toBe(true)
    expect(validateLicensePlate('  XY12  ')).toBe(true)
  })

  it('returns false for invalid plates', () => {
    expect(validateLicensePlate('A')).toBe(false)
    expect(validateLicensePlate('TOOLONG99')).toBe(false)
    expect(validateLicensePlate('AB-CD')).toBe(false)
    expect(validateLicensePlate('')).toBe(false)
  })
})

describe('validatePhoneNumber', () => {
  it('returns true when phone is optional and not provided', () => {
    expect(validatePhoneNumber(null)).toBe(true)
    expect(validatePhoneNumber(undefined)).toBe(true)
    expect(validatePhoneNumber('')).toBe(true)
  })

  it('returns true for valid phone formats (10+ digits)', () => {
    expect(validatePhoneNumber('5551234567')).toBe(true)
    expect(validatePhoneNumber('555-123-4567')).toBe(true)
    expect(validatePhoneNumber('(555) 123-4567')).toBe(true)
    expect(validatePhoneNumber('+1 555 123 4567')).toBe(true)
  })

  it('returns false for too short', () => {
    expect(validatePhoneNumber('123')).toBe(false)
  })
})
