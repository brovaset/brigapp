'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { motion } from 'framer-motion'
import FloatingCard from '@/components/FloatingCard'
import NeonButton from '@/components/NeonButton'
import { Input, Textarea, Select, ErrorMessage, LoadingSpinner } from '@/components/ui'
import type { ListingFormData } from '@/types'

export default function NewListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
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
    amenities: { covered: false, evCharging: false, gated: false, accessible24_7: false },
    instantBook: true,
    cancellationPolicy: 'FLEXIBLE',
    houseRules: '',
  })

  const handleGeocode = async () => {
    if (!formData.address || !formData.city || !formData.state) {
      setError('Please enter address, city, and state first')
      return
    }

    const address = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`
    
    // Use Google Geocoding API if available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (apiKey) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        )
        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location
          setFormData({
            ...formData,
            latitude: location.lat,
            longitude: location.lng,
          })
          setError('')
          return
        }
      } catch (err) {
        console.error('Geocoding error:', err)
      }
    }

    // Fallback to manual input
    const lat = prompt('Enter latitude (or use Google Maps to find coordinates):')
    const lng = prompt('Enter longitude:')

    if (lat && lng) {
      setFormData({
        ...formData,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      })
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.latitude || !formData.longitude) {
      setError('Please set location coordinates')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerHour: parseFloat(formData.pricePerHour.toString()),
          pricePerDay: parseFloat(formData.pricePerDay.toString()),
          amenities: formData.amenities,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create listing')
        return
      }

      router.push('/host/listings')
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.push('/host/listings')}
          className="mb-6 text-car-neon hover:text-car-electric transition-colors"
        >
          ← Back to Listings
        </button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-gray-900"
        >
          Create New Listing
        </motion.h1>

        {error && <ErrorMessage message={error} className="mb-6" onClose={() => setError('')} />}

        <FloatingCard delay={0}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Input
                  label="Listing Title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Spacious Driveway Near Downtown"
                  helperText="Make it catchy and descriptive"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Textarea
                  label="Description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe your parking space, amenities, and any special instructions..."
                />
              </motion.div>
            </div>

            {/* Location */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Input
                  label="Street Address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    label="City"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    label="State"
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                  />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Input
                    label="ZIP Code"
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="12345"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-end"
                >
                  <NeonButton
                    type="button"
                    variant="outline"
                    onClick={handleGeocode}
                    className="w-full"
                  >
                    Get Coordinates
                  </NeonButton>
                </motion.div>
              </div>

              {(formData.latitude || formData.longitude) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-car-electric/10 border border-car-electric/30 rounded-lg"
                >
                  <p className="text-sm text-car-electric font-medium">
                    Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Input
                    label="Price per Hour ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.pricePerHour || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerHour: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="5.00"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Input
                    label="Price per Day ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.pricePerDay || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerDay: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="50.00"
                  />
                </motion.div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Select
                  label="Maximum Vehicle Size (Optional)"
                  value={formData.maxVehicleSize || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, maxVehicleSize: e.target.value || undefined })
                  }
                  options={[
                    { value: '', label: 'Any Size' },
                    { value: 'Sedan', label: 'Sedan' },
                    { value: 'SUV', label: 'SUV' },
                    { value: 'Truck', label: 'Truck' },
                    { value: 'Van', label: 'Van' },
                  ]}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Textarea
                  label="Entry Instructions (Optional)"
                  value={formData.entryInstructions || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, entryInstructions: e.target.value || undefined })
                  }
                  rows={3}
                  placeholder="e.g., Gate code is 1234, park in the right side of driveway..."
                  helperText="Help drivers find and access your parking space"
                />
              </motion.div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'covered', label: 'Covered', desc: 'Under cover' },
                    { key: 'evCharging', label: 'EV charging', desc: 'EV outlet' },
                    { key: 'gated', label: 'Gated', desc: 'Secure access' },
                    { key: 'accessible24_7', label: '24/7 access', desc: 'Anytime' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities[key as keyof typeof formData.amenities]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amenities: { ...formData.amenities, [key]: e.target.checked },
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="instantBook"
                  checked={formData.instantBook}
                  onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="instantBook" className="text-sm font-medium text-gray-700">
                  Instant book — Guests can book without host approval
                </label>
              </div>

              <Select
                label="Cancellation policy"
                value={formData.cancellationPolicy}
                onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                options={[
                  { value: 'FLEXIBLE', label: 'Flexible — Full refund up to 24h before' },
                  { value: 'MODERATE', label: 'Moderate — Full refund up to 5 days before' },
                  { value: 'STRICT', label: 'Strict — 50% refund up to 7 days before' },
                ]}
              />

              <Textarea
                label="House rules (Optional)"
                value={formData.houseRules || ''}
                onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
                rows={2}
                placeholder="e.g., No oversized vehicles, quiet after 10pm..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <NeonButton
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </NeonButton>
              <NeonButton
                type="submit"
                variant="primary"
                disabled={loading || !formData.latitude || !formData.longitude}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Creating...
                  </span>
                ) : (
                  'Create Listing'
                )}
              </NeonButton>
            </div>
          </form>
        </FloatingCard>
      </div>
    </div>
  )
}
