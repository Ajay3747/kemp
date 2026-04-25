# KEMP - Environment Variables & Deployment Guide

## Problem Resolved
**Error**: 404 NOT_FOUND when accessing https://kemp-rho.vercel.app/

**Root Cause**: Frontend was hardcoded to call `http://localhost:5000/api` which doesn't exist in production.

---

## Solution Overview

Your project now uses **environment variables** to handle different API URLs for development and production.

### Files Created/Modified:

1. **`vercel.json`** - Deployment configuration
2. **`.env.local`** - Local development environment
3. **`vite.config.js`** - Build configuration
4. **`src/utils/api.js`** - Centralized API utility (NEW)

---

## How to Use

### Option 1: Use the New API Utility (RECOMMENDED)

**Before (Old Way):**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials),
});
```

**After (New Way):**
```javascript
import { apiCall } from '@/utils/api';

const response = await apiCall('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});
```

### Option 2: Manual Environment Variable Usage

```javascript
import API_BASE_URL from '@/utils/api';

const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  body: JSON.stringify(credentials),
});
```

---

## Environment Setup

### Development (Local Machine)
Your `.env.local` file is already created:
```
VITE_API_URL=http://localhost:5000/api
```

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add this variable:
   ```
   VITE_API_URL = https://your-backend-url/api
   ```

**You have 2 backend options:**

#### Option A: Deploy Backend to Vercel
- Create a separate Vercel project for your backend
- Use its URL: `https://kemp-api.vercel.app/api`
- OR deploy to Railway/Heroku if you prefer

#### Option B: Use Same Vercel with API Routes
- Create `/frontend/api/` directory for serverless functions
- Vercel automatically serves these as `/api/*`

---

## File-by-File Migration Guide

### 1. Home.jsx (Stats API Call)
```javascript
// OLD
const response = await fetch('http://localhost:5000/api/auth/stats');

// NEW
import API_BASE_URL from '@/utils/api';
const response = await fetch(`${API_BASE_URL}/auth/stats`);
```

### 2. LoginPage.jsx (All API calls)
```javascript
import { apiCall, getApiUrl } from '@/utils/api';

// Replace all instances of 'http://localhost:5000/api/auth' with:
const url = getApiUrl('/auth/login');

// Or use apiCall for convenience:
const response = await apiCall('/auth/login', {
  method: 'POST',
  body: JSON.stringify(data),
});

// For ID card URL:
const idCardUrl = getApiUrl(`/auth/idcard/${userId}`);
```

### 3. All Other Components
Same pattern - search for `http://localhost:5000/api` and replace with:
```javascript
import { getApiUrl } from '@/utils/api';
const url = getApiUrl('/endpoint-path');
```

---

## Quick Deployment Checklist

- [ ] Update all API URLs in components (or use new `api.js` utility)
- [ ] Test locally with `npm run dev`
- [ ] Add `VITE_API_URL` environment variable in Vercel dashboard
- [ ] Deploy backend (if not using API routes)
- [ ] Commit changes: `git add . && git commit -m "Add environment variable support"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Vercel redeploys automatically
- [ ] Test production URL: `https://kemp-rho.vercel.app/`

---

## Testing

### Local Development
```bash
npm run dev
# API calls go to: http://localhost:5000/api
```

### Production Build (Test Before Deploy)
```bash
npm run build
npm run preview
# API calls will use VITE_API_URL value
```

---

## Troubleshooting

### Still Getting 404 Errors?
1. ✅ Check `VITE_API_URL` is set in Vercel dashboard
2. ✅ Rebuild/redeploy on Vercel
3. ✅ Check browser DevTools Network tab for actual URL being called
4. ✅ Verify backend is running at the configured URL

### CORS Errors?
If backend is on different domain:
1. Add to backend `server.js`:
```javascript
app.use(cors({
  origin: 'https://kemp-rho.vercel.app',
  credentials: true
}));
```

### Environment Variables Not Loading?
1. Check file is named `.env.local` (not `.env` or `.env.development`)
2. Variables must start with `VITE_` for Vite to expose them
3. Restart dev server after changing `.env.local`

---

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`:
   ```
   .env.local
   .env.*.local
   ```

2. **Frontend environment variables are public** - Don't put secrets here!
   - Keep API keys/credentials in backend `.env`
   - Only share URLs in frontend `.env`

3. **Use HTTPS in production** - Always use `https://` for APIs

---

## FAQ

**Q: Why can't I just use `localhost:5000` in production?**
A: `localhost` only resolves on the machine it's running on. In production, your code runs on Vercel's servers, where there is no `localhost`.

**Q: Do I need to redeploy when changing environment variables?**
A: Yes. Change in Vercel dashboard → click "Redeploy" button.

**Q: What if I want different URLs for different environments?**
A: Vite supports multiple `.env` files:
- `.env` - All environments
- `.env.local` - Local development (never committed)
- `.env.production` - Production only

---

## Next Steps

1. Update all remaining API calls in your frontend to use the new `api.js` utility
2. Deploy your backend to production (Vercel/Railway/Heroku)
3. Set the production `VITE_API_URL` in Vercel dashboard
4. Push code to GitHub - Vercel auto-redeploys
5. Test at `https://kemp-rho.vercel.app/`

Happy deploying! 🚀
