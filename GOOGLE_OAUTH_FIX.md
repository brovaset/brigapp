# Fix Google OAuth "Error 400: origin_mismatch"

This error occurs when the URL where you're running the app is not registered in Google Cloud Console. Here's how to fix it:

## Steps to Fix

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Select your project** (or create one if needed)

3. **Open OAuth credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Click on your **OAuth 2.0 Client ID** (type: "Web application")

4. **Add Authorized JavaScript origins:**
   Under **Authorized JavaScript origins**, add every URL where your app runs:

   **Local development:**
   ```
   http://localhost:3000
   ```
   If you use a different port (e.g. 3001), add that too:
   ```
   http://localhost:3001
   ```

   **Production (e.g. Vercel):**
   ```
   https://your-app.vercel.app
   ```
   or your custom domain:
   ```
   https://yourdomain.com
   ```

5. **Add Authorized redirect URIs (if needed):**
   For Google Sign-In, you typically only need JavaScript origins. But if the error mentions redirect URIs, add:
   - `http://localhost:3000` (local)
   - `https://your-app.vercel.app` (production)

6. **Save** the credentials

7. **Wait 1–2 minutes** for changes to take effect, then try signing in again

## Quick checklist

- [ ] `http://localhost:3000` is in Authorized JavaScript origins (for local dev)
- [ ] Your production URL (e.g. `https://*.vercel.app`) is added if you're deployed
- [ ] No trailing slash on URLs (use `http://localhost:3000` not `http://localhost:3000/`)
- [ ] Use `http://` for localhost, `https://` for production
- [ ] OAuth consent screen is configured (APIs & Services → OAuth consent screen)

## Still having issues?

- Ensure **NEXT_PUBLIC_GOOGLE_CLIENT_ID** in `.env` matches the Client ID shown in the Google Cloud Console
- Restart your dev server after changing `.env`
- Try in an incognito/private window to rule out cached credentials
