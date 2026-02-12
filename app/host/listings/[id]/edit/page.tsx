'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { Input, Textarea, Select, ErrorMessage, LoadingSpinner } from '@/components/ui'
import { parseResponseJson } from '@/lib/utils'

const defaultFormData = {
  title: '',
  description: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  latitude: 0,
  longitude: 0,
  pricePerHour: 0,
  pricePerDay: 0,
  maxVehicleSize: '',
  photos: [] as string[],
  entryInstructions: '',
  amenities: {
    covered: false,
    evCharging: false,
    evChargerType: '' as '' | 'level1' | 'level2' | 'tesla',
    gated: false,
    accessible24_7: false,
  },
  instantBook: true,
  cancellationPolicy: 'FLEXIBLE',
  houseRules: '',
}

function parseAmenities(amenities: unknown): typeof defaultFormData.amenities {
  if (!amenities) return defaultFormData.amenities
  try {
    const a = typeof amenities === 'string' ? JSON.parse(amenities) : amenities
    return {
      covered: !!a?.covered,
      evCharging: !!a?.evCharging,
      evChargerType: a?.evChargerType || '',
      gated: !!a?.gated,
      accessible24_7: !!a?.accessible24_7,
    }
  } catch {
    return defaultFormData.amenities
  }
}

function parsePhotos(photos: unknown): string[] {
  if (!photos) return []
  try {
    const p = typeof photos === 'string' ? JSON.parse(photos) : photos
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = params?.id as string
  const [formData, setFormData] = useState(defaultFormData)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !id) return
    fetch(`/api/listings/${id}`)
      .then(async (res) => {
        const data = await parseResponseJson(res)
        if (!res.ok || !data?.id) {
          router.push('/host/listings')
          return null
        }
        return data
      })
      .then((data) => {
        if (!data) return
        setFormData({
          title: data.title || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          latitude: Number(data.latitude) || 0,
          longitude: Number(data.longitude) || 0,
          pricePerHour: Number(data.pricePerHour) || 0,
          pricePerDay: Number(data.pricePerDay) || 0,
          maxVehicleSize: data.maxVehicleSize || '',
          photos: parsePhotos(data.photos),
          entryInstructions: data.entryInstructions || '',
          amenities: parseAmenities(data.amenities),
          instantBook: data.instantBook !== false,
          cancellationPolicy: data.cancellationPolicy || 'FLEXIBLE',
          houseRules: data.houseRules || '',
        })
      })
      .catch(() => router.push('/host/listings'))
      .finally(() => setFetchLoading(false))
  }, [id, user, router])

  const handleGeocode = async () => {
    if (!formData.address || !formData.city || !formData.state) {
      setError('Please enter address, city, and state first')
      return
    }
    const address = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (apiKey) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        )
        const data = await response.json()
        if (data?.results?.[0]?.geometry?.location) {
          const location = data.results[0].geometry.location
          setFormData((prev) => ({ ...prev, latitude: location.lat, longitude: location.lng }))
          setError('')
          return
        }
      } catch (err) {
        console.error('Geocoding error:', err)
      }
    }
    const lat = prompt('Enter latitude (or use Google Maps to find coordinates):')
    const lng = prompt('Enter longitude:')
    if (lat && lng) {
      setFormData((prev) => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lng) }))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { evChargerType, ...restAmenities } = formData.amenities
      const amenitiesToSend = {
        ...restAmenities,
        ...(formData.amenities.evCharging && evChargerType && { evChargerType }),
      }
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerHour: parseFloat(formData.pricePerHour.toString()),
          pricePerDay: parseFloat(formData.pricePerDay.toString()),
          amenities: amenitiesToSend,
        }),
      })
      const data = await parseResponseJson<{ error?: string }>(res)
      if (!res.ok) {
        setError(data?.error || 'Failed to update listing')
        return
      }
      router.push(`/host/listings/${id}`)
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null
  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-car-neon border-t-transparent" />
          <p className="text-gray-600 font-medium">Loading listing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push(`/host/listings/${id}`)}
          className="mb-6 text-car-neon hover:text-car-electric transition-colors"
        >
          ← Back to Listing
        </button>

        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-8 text-gray-900">
          Edit Listing
        </motion.h1>

        {error && <ErrorMessage message={error} className="mb-6" onClose={() => setError('')} />}

        <FloatingCard delay={0}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <Input label="Listing Title" type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Spacious Driveway Near Downtown" />
              <Textarea label="Description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Describe your parking space..." />
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <Input label="Street Address" type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main St" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                <Input label="State" type="text" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="CA" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="ZIP Code" type="text" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} placeholder="12345" />
                <NeonButton type="button" variant="outline" onClick={handleGeocode} className="w-full">Get Coordinates</NeonButton>
              </div>
              {(formData.latitude || formData.longitude) && (
                <div className="p-3 bg-car-electric/10 border border-car-electric/30 rounded-lg">
                  <p className="text-sm text-car-electric font-medium">Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</p>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price per Hour ($)" type="number" step="0.01" min="0" required value={formData.pricePerHour || ''} onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) || 0 })} placeholder="5.00" />
                <Input label="Price per Day ($)" type="number" step="0.01" min="0" required value={formData.pricePerDay || ''} onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })} placeholder="50.00" />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
              <Select label="Maximum Vehicle Size (Optional)" value={formData.maxVehicleSize || ''} onChange={(e) => setFormData({ ...formData, maxVehicleSize: e.target.value || undefined })} options={[{ value: '', label: 'Any Size' }, { value: 'Sedan', label: 'Sedan' }, { value: 'SUV', label: 'SUV' }, { value: 'Truck', label: 'Truck' }, { value: 'Van', label: 'Van' }]} />
              <Textarea label="Entry Instructions (Optional)" value={formData.entryInstructions || ''} onChange={(e) => setFormData({ ...formData, entryInstructions: e.target.value || undefined })} rows={3} placeholder="e.g., Gate code is 1234..." />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing photos</label>
                <div className="flex flex-wrap gap-3 mb-2">
                  {formData.photos.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative group">
                      <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={() => setFormData({ ...formData, photos: formData.photos.filter((_, j) => j !== i) })} className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove photo">×</button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-car-neon/10 file:text-car-neon hover:file:bg-car-neon/20"
                  onChange={async (e) => {
                    const files = e.target.files
                    if (!files?.length) return
                    const urls: string[] = []
                    for (let i = 0; i < files.length; i++) {
                      const fd = new FormData()
                      fd.append('type', 'listing')
                      fd.append('file', files[i])
                      try {
                        const res = await fetch('/api/upload', { method: 'POST', body: fd })
                        const data = await parseResponseJson<{ url?: string; urls?: string[] }>(res)
                        if (res.ok && data?.url) urls.push(data.url)
                        else if (res.ok && data?.urls) urls.push(...data.urls)
                      } catch { setError('Failed to upload an image') }
                    }
                    if (urls.length) setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...urls] }))
                    e.target.value = ''
                  }}
                />
              </div>
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-4">
                  {['covered', 'evCharging', 'gated', 'accessible24_7'].map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.amenities[key as keyof typeof formData.amenities] as boolean} onChange={(e) => setFormData({ ...formData, amenities: { ...formData.amenities, [key]: e.target.checked } })} className="rounded border-gray-300" />
                      <span className="text-sm">{key === 'evCharging' ? 'EV charging' : key === 'accessible24_7' ? '24/7 access' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </label>
                  ))}
                </div>
                {formData.amenities.evCharging && (
                  <div className="mt-4 pl-4 border-l-2 border-car-electric/30">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">EV Charger Type</p>
                    <div className="flex flex-wrap gap-2">
                      {[{ value: 'level1', label: 'Level 1' }, { value: 'level2', label: 'Level 2' }, { value: 'tesla', label: 'Tesla NACS' }].map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="evChargerType" checked={formData.amenities.evChargerType === value} onChange={() => setFormData({ ...formData, amenities: { ...formData.amenities, evChargerType: value as 'level1' | 'level2' | 'tesla' } })} className="rounded border-gray-300" />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="instantBook" checked={formData.instantBook} onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })} className="rounded border-gray-300" />
                <label htmlFor="instantBook" className="text-sm font-medium text-gray-700">Instant book — Guests can book without host approval</label>
              </div>
              <Select label="Cancellation policy" value={formData.cancellationPolicy} onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })} options={[{ value: 'FLEXIBLE', label: 'Flexible — Full refund up to 24h before' }, { value: 'MODERATE', label: 'Moderate — Full refund up to 5 days before' }, { value: 'STRICT', label: 'Strict — 50% refund up to 7 days before' }]} />
              <Textarea label="House rules (Optional)" value={formData.houseRules || ''} onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })} rows={2} placeholder="e.g., No oversized vehicles, quiet after 10pm..." />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <NeonButton type="button" variant="outline" onClick={() => router.push(`/host/listings/${id}`)} className="flex-1">Cancel</NeonButton>
              <NeonButton type="submit" variant="primary" disabled={loading} className="flex-1">
                {loading ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" />Saving...</span> : 'Save Changes'}
              </NeonButton>
            </div>
          </form>
        </FloatingCard>
      </div>
    </div>
  )
}
