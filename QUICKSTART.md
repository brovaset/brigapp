# BRIGAP - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install
```bash
npm install
```

### Step 2: Environment Setup
Create `.env` file:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="change-this-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_key"
GOOGLE_CLIENT_ID="your_oauth_client_id.apps.googleusercontent.com"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_oauth_client_id.apps.googleusercontent.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Quick API Keys:**
- **Google Maps**: Get free key at https://console.cloud.google.com/ (enable Maps JavaScript API)
- **Google Sign-In**: Create OAuth 2.0 Client ID (Web application) at https://console.cloud.google.com/apis/credentials — add `http://localhost:3000` to Authorized JavaScript origins
- **Stripe**: Sign up at https://stripe.com (use test mode keys)

### Step 3: Database
```bash
npx prisma generate
npx prisma db push
```

### Step 4: Run
```bash
npm run dev
```

Open http://localhost:3000

## ✅ What's Built

### Core Features
- ✅ User authentication (register/login)
- ✅ Real-time map search for parking
- ✅ Booking system with advance booking
- ✅ Stripe payment integration
- ✅ Host listing management
- ✅ In-app messaging
- ✅ Two-way ratings system
- ✅ Booking extensions
- ✅ Navigation integration

### Pages
- `/` - Landing page with FAQ
- `/register` - User registration
- `/login` - User login
- `/dashboard` - User dashboard
- `/search` - Map-based parking search
- `/host/listings` - Host listing management
- `/host/listings/new` - Create new listing
- `/bookings/[id]` - Booking details with messaging
- `/bookings/[id]/payment` - Payment page

### API Endpoints
- `/api/auth/*` - Authentication
- `/api/listings/*` - Listing management
- `/api/bookings/*` - Booking management
- `/api/payments/*` - Stripe payments
- `/api/messages` - In-app messaging
- `/api/ratings` - Rating system

## 🧪 Test the App

1. **Register** as a user (choose "Both" role)
2. **Create a listing**:
   - Go to Dashboard → My Listings
   - Click "Create New Listing"
   - Use Google Maps to get coordinates (right-click location)
   - Set prices (e.g., $5/hour, $30/day)
3. **Book parking**:
   - Go to Dashboard → Find Parking
   - Click on a listing
   - Fill booking form
   - Complete payment (use test card: 4242 4242 4242 4242)
4. **Send messages** and **extend bookings** from booking details page

## 📝 Notes

- Payment uses test mode (hardcoded test card for MVP)
- In production, implement Stripe Elements for secure card input
- Google Maps requires API key (free tier available)
- Database is SQLite for development (switch to PostgreSQL for production)

## 🐛 Troubleshooting

**Map not loading?**
- Check Google Maps API key in `.env`
- Enable Maps JavaScript API in Google Cloud Console

**Database errors?**
- Run `npx prisma db push` again
- Delete `prisma/dev.db` and regenerate

**Payment not working?**
- Verify Stripe keys are correct
- Check Stripe dashboard for test mode

## 📚 Next Steps

See `SETUP.md` for detailed setup instructions and `README.md` for full documentation.

