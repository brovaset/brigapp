// Validation utilities

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate && startDate > new Date()
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '')
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

  // Check if booking is too far in the future (e.g., 1 year)
  const maxFutureDate = new Date()
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1)
  if (start > maxFutureDate) {
    return { valid: false, error: 'Booking cannot be more than 1 year in advance' }
  }

  return { valid: true }
}

export function validateLicensePlate(plate: string): boolean {
  // Basic validation - alphanumeric, 2-8 characters
  const plateRegex = /^[A-Z0-9]{2,8}$/i
  return plateRegex.test(plate.trim())
}

export function validatePhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return true // Optional field
  // Basic phone validation - digits, dashes, parentheses, spaces
  const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

