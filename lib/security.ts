import bcrypt from 'bcryptjs'

// ---------------------------------------------------------------------------
// Account lockout (in-memory, per email address)
// ---------------------------------------------------------------------------

interface LockoutRecord {
  attempts: number
  firstAttempt: number
  lockedUntil: number | null
}

const lockoutStore = new Map<string, LockoutRecord>()

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000
const ATTEMPT_WINDOW_MS   = 15 * 60 * 1000

export interface LockoutStatus {
  locked: boolean
  attemptsRemaining: number
  lockedUntil: number | null
}

export function checkLockout(key: string): LockoutStatus {
  const record = lockoutStore.get(key)
  const now    = Date.now()

  if (!record) {
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS, lockedUntil: null }
  }

  if (record.lockedUntil !== null) {
    if (now < record.lockedUntil) {
      return { locked: true, attemptsRemaining: 0, lockedUntil: record.lockedUntil }
    }
    lockoutStore.delete(key)
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS, lockedUntil: null }
  }

  if (now - record.firstAttempt > ATTEMPT_WINDOW_MS) {
    lockoutStore.delete(key)
    return { locked: false, attemptsRemaining: MAX_ATTEMPTS, lockedUntil: null }
  }

  return { locked: false, attemptsRemaining: MAX_ATTEMPTS - record.attempts, lockedUntil: null }
}

export function recordFailedAttempt(key: string): LockoutStatus {
  const now = Date.now()
  let record = lockoutStore.get(key)

  if (!record || (record.lockedUntil === null && now - record.firstAttempt > ATTEMPT_WINDOW_MS)) {
    record = { attempts: 0, firstAttempt: now, lockedUntil: null }
  }

  record.attempts += 1

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS
    lockoutStore.set(key, record)
    return { locked: true, attemptsRemaining: 0, lockedUntil: record.lockedUntil }
  }

  lockoutStore.set(key, record)
  return { locked: false, attemptsRemaining: MAX_ATTEMPTS - record.attempts, lockedUntil: null }
}

export function clearLockout(key: string): void {
  lockoutStore.delete(key)
}

// ---------------------------------------------------------------------------
// Timing-safe credential check
// Runs bcrypt even when the user does not exist to prevent timing-based
// user-enumeration attacks.
// ---------------------------------------------------------------------------

const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

export async function timingSafeCompare(
  password: string,
  hash: string | null,
): Promise<boolean> {
  if (hash) {
    return bcrypt.compare(password, hash)
  }
  await bcrypt.compare(password, DUMMY_HASH)
  return false
}

// ---------------------------------------------------------------------------
// Security audit log
// ---------------------------------------------------------------------------

export type SecurityEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGIN_LOCKED'
  | 'REGISTER_SUCCESS'
  | 'REGISTER_FAILURE'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED_ACCESS'
  | 'FORBIDDEN_ACCESS'
  | 'CORS_VIOLATION'
  | 'BODY_TOO_LARGE'

export function logSecurityEvent(
  event: SecurityEvent,
  details: {
    ip?: string
    email?: string
    userId?: string
    path?: string
    reason?: string
  },
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  }
  console.log('[SECURITY]', JSON.stringify(entry))
}

// ---------------------------------------------------------------------------
// Request body size guard
// ---------------------------------------------------------------------------

export function isBodyTooLarge(
  request: Request,
  maxBytes = 100 * 1024,
): boolean {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) return false
  return parseInt(contentLength, 10) > maxBytes
}
