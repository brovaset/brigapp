import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter
// ---------------------------------------------------------------------------
// Keyed by "<IP>:<routeKey>". Timestamps array holds the epoch-ms of each
// request that fell inside the current window. Entries are pruned lazily.
// ---------------------------------------------------------------------------

interface WindowRecord {
  timestamps: number[]
}

const store    = new Map<string, WindowRecord>()
const MAX_STORE_SIZE = 50_000 // prevent unbounded memory growth
let lastCleanup = Date.now()

function cleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < 120_000) return
  lastCleanup = now

  // If store is still too large after natural expiry, evict oldest entries
  if (store.size > MAX_STORE_SIZE) {
    const keys = [...store.keys()]
    for (let i = 0; i < keys.length / 2; i++) {
      store.delete(keys[i])
    }
  }

  for (const [key, record] of store) {
    if (record.timestamps.length === 0) store.delete(key)
  }
}

// ---------------------------------------------------------------------------
// Tiers
// ---------------------------------------------------------------------------

export interface RateLimitConfig {
  limit: number    // maximum requests allowed in the window
  windowMs: number // rolling window duration in milliseconds
}

export const LIMITS = {
  /** Brute-force protection — login / register / Google OAuth */
  auth: { limit: 10, windowMs: 15 * 60 * 1000 } as RateLimitConfig,

  /** Mutating operations — create bookings, listings, messages, payments … */
  write: { limit: 30, windowMs: 60 * 1000 } as RateLimitConfig,

  /** File uploads */
  upload: { limit: 20, windowMs: 60 * 1000 } as RateLimitConfig,

  /** Rating submissions — prevent flooding */
  ratings: { limit: 5, windowMs: 60 * 1000 } as RateLimitConfig,

  /** General read endpoints */
  read: { limit: 100, windowMs: 60 * 1000 } as RateLimitConfig,
} as const

// ---------------------------------------------------------------------------
// IP extraction — hardened against header injection
// ---------------------------------------------------------------------------

const PRIVATE_IP_RE =
  /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|fc|fd)/i

/**
 * Returns the most-likely real client IP from the request headers.
 * Strips port numbers and validates that the value looks like an IP address.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    // XFF may be comma-separated; the first entry is the original client
    const candidate = xff.split(',')[0].trim().replace(/:\d+$/, '')
    if (/^[\d.:a-fA-F]+$/.test(candidate) && candidate.length <= 45) {
      return candidate
    }
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    const candidate = realIp.trim().replace(/:\d+$/, '')
    if (/^[\d.:a-fA-F]+$/.test(candidate) && candidate.length <= 45) {
      return candidate
    }
  }

  return 'unknown'
}

// ---------------------------------------------------------------------------
// Core rate-limit check
// ---------------------------------------------------------------------------

/**
 * Check whether the calling IP is within the rate limit for a given route.
 *
 * Returns `{ limited: true }` if the limit is exceeded, or
 * `{ limited: false, remaining }` when the request is allowed.
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig,
  routeKey: string,
): { limited: boolean; remaining: number; resetAt: number } {
  cleanup()

  const ip          = getClientIp(request)
  const key         = `${ip}:${routeKey}`
  const now         = Date.now()
  const windowStart = now - config.windowMs

  let record = store.get(key)
  if (!record) {
    record = { timestamps: [] }
    store.set(key, record)
  }

  record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

  const used    = record.timestamps.length
  const resetAt =
    used > 0 ? record.timestamps[0] + config.windowMs : now + config.windowMs

  if (used >= config.limit) {
    return { limited: true, remaining: 0, resetAt }
  }

  record.timestamps.push(now)
  return { limited: false, remaining: config.limit - used - 1, resetAt }
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/** Returns a 429 NextResponse with standard rate-limit headers. */
export function rateLimitExceeded(resetAt: number): NextResponse {
  const retryAfterSecs = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSecs),
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    },
  )
}

/**
 * Attach informational X-RateLimit-* headers to an existing response
 * so clients can track their quota on successful requests.
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  config: RateLimitConfig,
  remaining: number,
  resetAt: number,
): void {
  response.headers.set('X-RateLimit-Limit',     String(config.limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset',     String(Math.ceil(resetAt / 1000)))
}
