/**
 * Browser geolocation helper with clear error handling for "Use my location" search.
 */

export interface GeoPosition {
  lat: number
  lng: number
}

export type GeoErrorCode = 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED'

export class GeoError extends Error {
  constructor(
    message: string,
    public code: GeoErrorCode
  ) {
    super(message)
    this.name = 'GeoError'
  }
}

const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
}

/**
 * Returns the user's current position. Rejects with GeoError for permission denied,
 * position unavailable, timeout, or when geolocation is not supported.
 */
export function getCurrentPosition(options: PositionOptions = {}): Promise<GeoPosition> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.reject(
      new GeoError('Location is not supported by this browser.', 'NOT_SUPPORTED')
    )
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error: GeolocationPositionError) => {
        const codeMap: Record<number, GeoErrorCode> = {
          1: 'PERMISSION_DENIED',
          2: 'POSITION_UNAVAILABLE',
          3: 'TIMEOUT',
        }
        const code = codeMap[error.code] ?? 'POSITION_UNAVAILABLE'
        const messages: Record<GeoErrorCode, string> = {
          PERMISSION_DENIED: 'Location access was denied. Enable location for this site or enter an address.',
          POSITION_UNAVAILABLE: 'Location is unavailable. Try again or enter an address.',
          TIMEOUT: 'Location request timed out. Try again or enter an address.',
          NOT_SUPPORTED: 'Location is not supported.',
        }
        reject(new GeoError(messages[code], code))
      },
      { ...DEFAULT_OPTIONS, ...options }
    )
  })
}
