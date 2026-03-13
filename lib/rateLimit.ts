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

const store = new Map<string, WindowRecord>()
let lastCleanup = Date.now()

function cleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < 120_000) return // run at most every 2 minutes
  lastCleanup = now
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
// Core helpers
// ---------------------------------------------------------------------------

function getIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

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

  const ip = getIp(request)
  const key = `${ip}:${routeKey}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  let record = store.get(key)
  if (!record) {
    record = { timestamps: [] }
    store.set(key, record)
  }

  // Prune timestamps outside the current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

  const used = record.timestamps.length
  const resetAt =
    used > 0 ? record.timestamps[0] + config.windowMs : now + config.windowMs

  if (used >= config.limit) {
    return { limited: true, remaining: 0, resetAt }
  }

  record.timestamps.push(now)
  return { limited: false, remaining: config.limit - used - 1, resetAt }
}

/** Returns a 429 NextResponse with Retry-After and X-RateLimit-Reset headers. */
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
