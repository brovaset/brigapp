'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { calculateDistance, parseResponseJson } from '@/lib/utils'

export interface MapSearchListing {
  id: string
  title: string
  address: string
  latitude: number
  longitude: number
  pricePerHour: number
  pricePerDay: number
  averageRating: number
  ratingCount: number
  photos: string[]
  distance?: number
}

interface MapSearchProps {
  onListingSelect: (listing: MapSearchListing) => void
  userLocation?: { lat: number; lng: number }
}

export default function MapSearch({ onListingSelect, userLocation }: MapSearchProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [listings, setListings] = useState<MapSearchListing[]>([])
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [trackingEnabled, setTrackingEnabled] = useState(false)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    const loadMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        setApiKeyMissing(true)
        setLoading(false)
        return
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'],
      })

      try {
        await loader.load()

        if (!mapRef.current) {
          setLoading(false)
          return
        }

        const defaultLocation = userLocation || { lat: 40.7128, lng: -74.0060 } // NYC default

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        })

        setMap(mapInstance)
        mapInstanceRef.current = mapInstance

        // Get user location with high accuracy
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              setCurrentLocation(userPos)
              setLocationAccuracy(position.coords.accuracy)
              mapInstance.setCenter(userPos)
              mapInstance.setZoom(15)
              
              // Add user location marker
              addUserMarker(userPos, mapInstance)
              
              loadListings(userPos.lat, userPos.lng, mapInstance)
            },
            (error: GeolocationPositionError) => {
              // Geolocation failed (permission denied, timeout, or unavailable) - fall back to default location
              const messages: Record<number, string> = {
                1: 'Location permission denied',
                2: 'Location unavailable',
                3: 'Location request timed out',
              }
              if (process.env.NODE_ENV === 'development') {
                console.warn('Geolocation:', messages[error?.code] ?? 'Could not get location')
              }
              loadListings(defaultLocation.lat, defaultLocation.lng, mapInstance)
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          )
        } else {
          loadListings(defaultLocation.lat, defaultLocation.lng, mapInstance)
        }
      } catch (error) {
        console.error('Error loading map:', error)
        setLoading(false)
      }
    }

    loadMap()

    // Cleanup watch position on unmount
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const loadListings = async (lat: number, lng: number, mapInstance?: google.maps.Map) => {
    try {
      const res = await fetch(`/api/listings?lat=${lat}&lng=${lng}&radius=5`)
      const data = await parseResponseJson<{ listings?: MapSearchListing[] }>(res)

      if (data?.listings) {
        // Calculate distances for each listing
        const listingsWithDistance = data.listings.map((listing: MapSearchListing) => {
          const distance = calculateDistance(lat, lng, listing.latitude, listing.longitude)
          return { ...listing, distance }
        }).sort((a: MapSearchListing, b: MapSearchListing) => (a.distance || 0) - (b.distance || 0))

        setListings(listingsWithDistance)
        updateMarkers(listingsWithDistance, mapInstance || map)
      }
    } catch (error) {
      console.error('Error loading listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const addUserMarker = (position: { lat: number; lng: number }, mapInstance: google.maps.Map) => {
    // Remove existing user marker
    if (userMarker) {
      userMarker.setMap(null)
    }

    // Create custom user location icon
    const userIcon = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: '#007aff',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
    }

    const marker = new google.maps.Marker({
      position,
      map: mapInstance,
      icon: userIcon,
      title: 'Your Location',
      zIndex: 1000,
    })

    // Add accuracy circle
    if (locationAccuracy) {
      const circle = new google.maps.Circle({
        strokeColor: '#007aff',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#007aff',
        fillOpacity: 0.1,
        map: mapInstance,
        center: position,
        radius: locationAccuracy, // meters
      })
    }

    setUserMarker(marker)
  }

  const startTracking = () => {
    if (!navigator.geolocation || !map) return

    setTrackingEnabled(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        
        setCurrentLocation(userPos)
        setLocationAccuracy(position.coords.accuracy)

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(userPos)
          addUserMarker(userPos, mapInstanceRef.current)
          loadListings(userPos.lat, userPos.lng, mapInstanceRef.current)
        }
      },
      () => {
        setTrackingEnabled(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setTrackingEnabled(false)
  }

  const updateMarkers = (listingsData: MapSearchListing[], mapInstance: google.maps.Map) => {
    if (!mapInstance) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))

    const newMarkers = listingsData.map(listing => {
      // Custom marker icon based on distance
      let iconColor = '#34c759' // Green for close
      if (listing.distance) {
        if (listing.distance > 2) iconColor = '#ff9500' // Orange for medium
        if (listing.distance > 5) iconColor = '#ff3b30' // Red for far
      }

      const marker = new google.maps.Marker({
        position: { lat: listing.latitude, lng: listing.longitude },
        map: mapInstance,
        title: listing.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: iconColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: google.maps.Animation.DROP,
      })

      const distanceText = listing.distance 
        ? `${listing.distance < 1 ? Math.round(listing.distance * 1000) + 'm' : listing.distance.toFixed(1) + 'km'} away`
        : ''

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="font-weight: 600; margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px;">${listing.title}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 13px;">${listing.address}</p>
            ${distanceText ? `<p style="margin: 0 0 8px 0; color: #007aff; font-size: 12px; font-weight: 500;">${distanceText}</p>` : ''}
            <p style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">$${listing.pricePerHour.toFixed(2)}/hr</p>
            ${listing.averageRating > 0 ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${listing.averageRating.toFixed(1)} (${listing.ratingCount || 0} reviews)</p>` : ''}
            <button 
              onclick="window.selectListing('${listing.id}')"
              style="margin-top: 8px; padding: 8px 16px; background: linear-gradient(to right, #007aff, #34c759); color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%;"
              onmouseover="this.style.opacity='0.9'"
              onmouseout="this.style.opacity='1'"
            >
              View Details
            </button>
          </div>
        `,
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
        onListingSelect(listing)
      })

      return marker
    })

    setMarkers(newMarkers)

    // Make selectListing available globally
    ;(window as any).selectListing = (id: string) => {
      const listing = listingsData.find(l => l.id === id)
      if (listing) {
        onListingSelect(listing)
      }
    }
  }

  if (apiKeyMissing) {
    return (
      <div className="w-full h-[600px] bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
        <div className="max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-car-neon/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-car-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map unavailable</h3>
          <p className="text-gray-600 text-sm mb-4">
            Add <code className="px-2 py-0.5 bg-gray-200 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="px-2 py-0.5 bg-gray-200 rounded text-xs">.env</code> file to enable the map view.
          </p>
          <p className="text-gray-500 text-xs">
            Get an API key from Google Cloud Console (Maps JavaScript API). Then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 shadow-lg">
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/95 z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-car-neon border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* GPS Tracking Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {currentLocation && (
          <div className="bg-white rounded-lg shadow-lg px-3 py-2 border border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2 h-2 bg-car-neon rounded-full animate-pulse"></span>
              <span>GPS Active</span>
            </div>
            {locationAccuracy && (
              <p className="text-xs text-gray-500 mt-1">
                ±{Math.round(locationAccuracy)}m
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={trackingEnabled ? stopTracking : startTracking}
          className={`px-4 py-2 rounded-lg shadow-lg font-semibold text-sm transition-all ${
            trackingEnabled
              ? 'bg-car-speed text-white hover:bg-car-speed/90'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          {trackingEnabled ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Stop Tracking
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Start GPS Tracking
            </span>
          )}
        </button>

        {currentLocation && (
          <button
            onClick={() => {
              if (mapInstanceRef.current && currentLocation) {
                mapInstanceRef.current.setCenter(currentLocation)
                mapInstanceRef.current.setZoom(15)
                loadListings(currentLocation.lat, currentLocation.lng, mapInstanceRef.current)
              }
            }}
            className="px-4 py-2 bg-white rounded-lg shadow-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all"
          >
            Center on Me
          </button>
        )}
      </div>

      {/* Nearby Spots Counter */}
      {listings.length > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg px-4 py-3 border border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-car-neon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {listings.length} {listings.length === 1 ? 'spot' : 'spots'} nearby
              </p>
              {listings[0]?.distance && (
                <p className="text-xs text-gray-500">
                  Closest: {listings[0].distance < 1 
                    ? Math.round(listings[0].distance * 1000) + 'm'
                    : listings[0].distance.toFixed(1) + 'km'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-car-electric"></div>
            <span className="text-gray-600">&lt; 2km</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">2-5km</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-car-speed"></div>
            <span className="text-gray-600">&gt; 5km</span>
          </div>
        </div>
      </div>
    </div>
  )
}

