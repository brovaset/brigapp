// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'DRIVER' | 'HOST' | 'BOTH'
  phone?: string | null
  profileImageUrl?: string | null
}

export interface AuthUser {
  userId: string
  email: string
  role: string
}

// Listing Amenities (stored as JSON)
export interface ListingAmenities {
  covered?: boolean
  evCharging?: boolean
  evChargerType?: 'level1' | 'level2' | 'tesla'
  gated?: boolean
  accessible24_7?: boolean
  petFriendly?: boolean
}

// Listing Types
export interface Listing {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
  pricePerHour: number
  pricePerDay: number
  maxVehicleSize?: string | null
  photos: string[]
  amenities?: ListingAmenities | string | null
  instantBook?: boolean
  entryInstructions?: string | null
  isActive: boolean
  hostId: string
  createdAt: string
  updatedAt: string
  host?: {
    id: string
    firstName: string
    lastName: string
  }
  averageRating?: number
  ratingCount?: number
  distance?: number // Distance in kilometers (calculated client-side)
}

// Booking Types
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface Booking {
  id: string
  listingId: string
  driverId: string
  hostId: string
  startTime: string
  endTime: string
  vehicleMake: string
  vehicleModel: string
  licensePlate: string
  totalAmount: number
  status: BookingStatus
  createdAt: string
  updatedAt: string
  listing?: Listing
  driver?: User
  host?: User
  payment?: Payment
  messages?: Message[]
  driverRating?: Rating
  hostRating?: Rating
}

// Payment Types
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface Payment {
  id: string
  bookingId: string
  stripePaymentId: string
  amount: number
  status: PaymentStatus
  createdAt: string
  updatedAt: string
}

// Message Types
export interface Message {
  id: string
  bookingId: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
  }
}

// Rating Types
export interface Rating {
  id: string
  bookingId: string
  listingId: string
  driverId: string
  hostId: string
  rating: number
  comment?: string | null
  createdAt: string
  updatedAt: string
}

// Blocked Date Types
export interface BlockedDate {
  id: string
  listingId: string
  startDate: string
  endDate: string
  reason?: string | null
  createdAt: string
  updatedAt: string
}

// Host Earnings Types
export interface HostEarnings {
  totalEarnings: number
  totalBookings: number
  thisMonthEarnings: number
  pendingPayouts: number
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  listing: {
    id: string
    title: string
    address: string
  }
  driver: {
    firstName: string
    lastName: string
  }
  amount: number
  date: string
  paymentStatus?: PaymentStatus
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface ListingsResponse {
  listings: Listing[]
}

export interface BookingsResponse {
  bookings: Booking[]
}

export interface BookingResponse {
  booking: Booking
}

export interface MessagesResponse {
  messages: Message[]
}

export interface MessageResponse {
  message: Message
}

export interface RatingResponse {
  rating: Rating
}

// Form Types
export interface BookingFormData {
  listingId: string
  startTime: string
  endTime: string
  vehicleMake: string
  vehicleModel: string
  licensePlate: string
}

export interface ListingFormData {
  title: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
  pricePerHour: number
  pricePerDay: number
  maxVehicleSize?: string
  photos: string[]
  entryInstructions?: string
}

export interface RatingFormData {
  bookingId: string
  rating: number
  comment?: string
}
