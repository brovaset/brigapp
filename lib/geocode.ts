/**
 * Server-side geocoding so listings without coordinates can be placed on the map.
 */

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) return null
  const fullAddress = [address, city, state, zipCode].filter(Boolean).join(', ')
  if (!fullAddress.trim()) return null
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
    )
    const data = await res.json()
    if (data?.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
  } catch (e) {
    console.error('Geocode error:', e)
  }
  return null
}
