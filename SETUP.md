# BRIGAP Setup Guide

## Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
GOOGLE_CLIENT_ID="your_oauth_client_id.apps.googleusercontent.com"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_oauth_client_id.apps.googleusercontent.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Getting API Keys:**

1. **Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Maps JavaScript API"
   - Create credentials (API Key)
   - Add to `.env` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

2. **Google Sign-In (OAuth):**
   - In Google Cloud Console, go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - **Important:** Add your app URLs to **Authorized JavaScript origins**:
     - `http://localhost:3000` (local dev — no trailing slash)
     - Your production URL (e.g. `https://your-app.vercel.app`) for deploy
   - Add both `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env` (same value)
   - **Getting "Error 400: origin_mismatch"?** See [GOOGLE_OAUTH_FIX.md](./GOOGLE_OAUTH_FIX.md)

3. **Stripe Keys:**
   - Sign up at [Stripe](https://stripe.com)
   - Go to Developers > API keys
   - Copy Publishable key and Secret key
   - For webhook secret, create a webhook endpoint pointing to `http://localhost:3000/api/payments/webhook` (use Stripe CLI for local testing)

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing Stripe Webhooks Locally

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Login and forward webhooks:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Copy the webhook signing secret to your `.env` file.

## Creating Your First User

1. Go to http://localhost:3000/register
2. Sign up with:
   - Email: test@example.com
   - Password: (any password)
   - Role: Choose "Both (Drive & Host)" to test all features

## Testing the App

### As a Host:
1. Login and go to Dashboard
2. Click "My Listings" tab
3. Click "Create New Listing"
4. Fill in the form:
   - Get coordinates from Google Maps (right-click on location > coordinates)
   - Set prices (e.g., $5/hour, $30/day)
5. Save listing

### As a Driver:
1. Go to "Find Parking" tab
2. Click "Search for Parking"
3. The map will load (if Google Maps API key is set)
4. Click on a marker or listing to view details
5. Click "Book This Spot"
6. Fill in booking details
7. Complete payment (use Stripe test card: 4242 4242 4242 4242)

## Common Issues

### Map Not Loading
- Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly
- Ensure Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for errors

### Database Errors
- Run `npx prisma db push` to sync schema
- If issues persist, delete `prisma/dev.db` and run again

### Payment Not Working
- Ensure Stripe keys are set correctly
- Check Stripe dashboard for test mode
- Verify webhook endpoint is configured

### Authentication Issues
- Clear browser cookies
- Check that `JWT_SECRET` is set in `.env`
- Restart the development server

## Production Deployment

1. **Switch to PostgreSQL:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/brigap"
   ```

2. **Update environment variables:**
   - Use production Stripe keys
   - Use production Google Maps API key
   - Set secure `JWT_SECRET`

3. **Build and start:**
   ```bash
   npm run build
   npm start
   ```

4. **Configure Stripe webhook:**
   - Point to your production URL: `https://yourdomain.com/api/payments/webhook`
   - Copy webhook secret to production `.env`

## Next Steps

- Add real geocoding API for address to coordinates
- Implement Stripe Elements for secure card input
- Add image upload for listing photos
- Set up email notifications
- Add real-time messaging with WebSockets
- Implement booking extensions feature

