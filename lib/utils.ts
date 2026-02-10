export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

export function calculateBookingPrice(
  startTime: Date,
  endTime: Date,
  pricePerHour: number,
  pricePerDay: number
): number {
  const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  
  if (hours >= 24) {
    const days = Math.ceil(hours / 24)
    return days * pricePerDay
  }
  
  return Math.ceil(hours) * pricePerHour
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Safely parse a Response body as JSON. Avoids "Unexpected token '<'" when the
 * server returns HTML (e.g. error page or redirect) instead of JSON.
 */
export async function parseResponseJson<T = unknown>(res: Response): Promise<T> {
  const text = await res.text()
  const trimmed = text.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(text) as T
    } catch {
      throw new Error('Invalid JSON in response')
    }
  }
  throw new Error(res.ok ? 'Response is not JSON' : `Request failed: ${res.status}`)
}

