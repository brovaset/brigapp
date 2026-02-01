# BRIGAP - Driveway Parking Marketplace

BRIGAP is a platform that connects drivers searching for parking with homeowners who want to rent their driveways. Think Airbnb, but for parking spaces.

## Features

### For Drivers (Renters)
- **Real-Time Map Search**: Find nearby driveways based on GPS location
- **Advance Booking**: Reserve spots hours or weeks in advance
- **Instant Payment**: Secure payment via Stripe
- **Navigation Integration**: Direct links to Google Maps/Waze
- **Booking Extensions**: One-tap time extension feature

### For Hosts (Property Owners)
- **Listing Management**: Upload photos, describe spots, set entry instructions
- **Dynamic Availability Calendar**: Block dates when driveway is needed
- **Payout Dashboard**: Track earnings and transaction history
- **License Plate Verification**: Verify correct vehicles are parked

### Shared Features
- **Two-Way Ratings**: Build trust through community ratings
- **In-App Messaging**: Secure communication without sharing phone numbers
- **24/7 Support**: Live chatbot and FAQ section

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Payments**: Stripe
- **Maps**: Google Maps API
- **Authentication**: JWT with bcrypt

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Maps API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BRIGAP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your keys:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
BRIGAP/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── listings/     # Listing management
│   │   ├── bookings/     # Booking management
│   │   ├── payments/     # Stripe integration
│   │   ├── messages/     # In-app messaging
│   │   └── ratings/      # Rating system
│   ├── dashboard/        # User dashboard
│   ├── search/           # Map search interface
│   ├── host/             # Host management pages
│   └── bookings/         # Booking pages
├── components/           # React components
├── lib/                  # Utility functions
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # Helper functions
├── prisma/              # Database schema
│   └── schema.prisma    # Prisma schema
└── public/              # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Listings
- `GET /api/listings` - Get all listings (with optional lat/lng filters)
- `POST /api/listings` - Create new listing
- `GET /api/listings/[id]` - Get listing details
- `PUT /api/listings/[id]` - Update listing

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking (extend time, change status)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### Messages
- `POST /api/messages` - Send message

### Ratings
- `POST /api/ratings` - Submit rating

## Database Schema

The app uses Prisma with SQLite for development. Key models:

- **User**: Drivers and hosts with roles
- **Listing**: Parking space listings
- **Booking**: Parking reservations
- **Payment**: Stripe payment records
- **Rating**: Two-way ratings between users
- **Message**: In-app messaging
- **BlockedDate**: Host availability calendar

## Development

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Push schema changes
npm run db:push

# Generate Prisma client
npm run db:generate
```

### Environment Variables

Make sure to set up all required environment variables in `.env`:

- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret for JWT token signing
- `STRIPE_SECRET_KEY`: Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key

## Production Deployment

1. **Database**: Switch to PostgreSQL
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/brigap"
   ```

2. **Environment**: Set all production environment variables

3. **Build**: 
   ```bash
   npm run build
   npm start
   ```

4. **Stripe Webhooks**: Configure webhook endpoint in Stripe dashboard

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Host payout automation
- [ ] License plate recognition
- [ ] Integration with parking enforcement
- [ ] Multi-language support
- [ ] Analytics dashboard

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

