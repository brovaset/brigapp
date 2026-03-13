// Validation and sanitization utilities

const ALLOWED_ROLES = ['DRIVER', 'HOST', 'BOTH'] as const
const ALLOWED_BOOKING_STATUSES = ['CONFIRMED', 'CANCELLED', 'ACTIVE', 'COMPLETED'] as const
const ALLOWED_CANCELLATION_POLICIES = ['FLEXIBLE', 'MODERATE', 'STRICT'] as const
const ALLOWED_VEHICLE_SIZES = ['SEDAN', 'SUV', 'TRUCK', 'VAN', 'MOTORCYCLE', 'OTHER', ''] as const

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate && startDate > new Date()
}

/**
 * Strips HTML/script tags and dangerous characters, trims whitespace.
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .trim()
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove null bytes and control characters except newlines/tabs
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Neutralise javascript: and data: URIs inside text
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
}

/**
 * Sanitise and enforce a maximum length. Returns null if blank after sanitisation.
 */
export function sanitizeStringMax(input: unknown, maxLen: number): string | null {
  if (input == null || input === '') return null
  const s = sanitizeString(String(input))
  if (!s) return null
  return s.slice(0, maxLen)
}

/**
 * Sanitise a required string field with a max length.
 * Returns the sanitised string or null if empty.
 */
export function sanitizeRequired(input: unknown, maxLen: number): string | null {
  const s = sanitizeStringMax(input, maxLen)
  return s && s.length > 0 ? s : null
}

/**
 * Validate a value against an allowed set.
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

/**
 * Parse a number and validate it within optional min/max bounds.
 */
export function validateNumber(
  value: unknown,
  min?: number,
  max?: number
): number | null {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(n)) return null
  if (min !== undefined && n < min) return null
  if (max !== undefined && n > max) return null
  return n
}

/**
 * Validate that a URL is from the expected local uploads path.
 */
export function isValidUploadUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false
  return /^\/uploads\/(listing|profile|message)\/[a-zA-Z0-9_\-.]+$/.test(url)
}

export function validateBookingDates(
  startTime: string | Date,
  endTime: string | Date
): { valid: boolean; error?: string } {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const now = new Date()

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }

  if (start >= end) {
    return { valid: false, error: 'End time must be after start time' }
  }

  if (start < now) {
    return { valid: false, error: 'Start time must be in the future' }
  }

  const maxFutureDate = new Date()
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1)
  if (start > maxFutureDate) {
    return { valid: false, error: 'Booking cannot be more than 1 year in advance' }
  }

  return { valid: true }
}

export function validateLicensePlate(plate: string): boolean {
  const plateRegex = /^[A-Z0-9]{2,8}$/i
  return plateRegex.test(plate.trim())
}

export function validatePhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return true
  const phoneRegex = /^[\d\s\-\(\)\+]{7,20}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export { ALLOWED_ROLES, ALLOWED_BOOKING_STATUSES, ALLOWED_CANCELLATION_POLICIES, ALLOWED_VEHICLE_SIZES }
