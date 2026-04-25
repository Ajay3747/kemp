# Monorepo Deployment Guide - Frontend + Backend on Same Vercel Project

## ✅ New Setup (Monorepo Configuration)

Your project now uses Vercel's experimental services to deploy both frontend and backend from the same Vercel project!

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│              Vercel Project (kemp-rho)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (Vite React)    Backend (Node.js Express)     │
│  Location: /              Location: /_/backend           │
│  URL: /                   URL: /_/backend/api/*          │
│                                                           │
│  Served from: frontend/dist   Run from: backend/src      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Production URLs

- **Frontend**: `https://kemp-rho.vercel.app/`
- **Backend**: `https://kemp-rho.vercel.app/_/backend/`
- **API Calls**: `https://kemp-rho.vercel.app/_/backend/api/*`

### Local Development URLs

- **Frontend**: `http://localhost:5173/` (Vite dev server)
- **Backend**: `http://localhost:5000/` (Node.js server)
- **API Calls**: `http://localhost:5000/api/*` (Direct to Node.js)

---

## 🔧 Configuration Files

### 1. `vercel.json` (Updated)
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "experimentalServices": {
    "frontend": {
      "entrypoint": "frontend",
      "routePrefix": "/",
      "framework": "vite"
    },
    "backend": {
      "entrypoint": "backend",
      "routePrefix": "/_/backend"
    }
  }
}
```

**What this does:**
- Builds frontend: `npm run build` in frontend directory
- Serves frontend at: `/`
- Serves backend at: `/_/backend` (Vercel automatically starts your backend)

### 2. `frontend/.env.local` (Development)
```
VITE_API_URL=http://localhost:5000/api
```

**What this does:**
- Local: Frontend calls `http://localhost:5000/api` directly
- Works with: `npm run dev`

### 3. `frontend/.env.production` (Updated)
```
VITE_API_URL=/_/backend/api
```

**What this does:**
- Production: Frontend calls `/_/backend/api` (same domain)
- Works with: Built & deployed on Vercel

### 4. `frontend/vite.config.js` (Updated with Proxy)
```javascript
server: {
  proxy: {
    '/_/backend': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/_\/backend/, '')
    }
  }
}
```

**What this does:**
- In development: Proxies `/_/backend/*` → `http://localhost:5000/*`
- Allows you to test production paths locally: `http://localhost:5173/_/backend/api/auth/stats`

---

## ✅ Prerequisites for This to Work

### Backend Configuration

Your `backend/package.json` needs a `start` script (Vercel requirement):

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Backend Port Configuration

Your backend should respect the `PORT` environment variable:

```javascript
// backend/src/server.js
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### CORS Configuration

Update your backend CORS to allow the same Vercel domain:

```javascript
// backend/src/server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://kemp-rho.vercel.app'
    : 'http://localhost:5173',
  credentials: true
}));
```

---

## 🧪 Testing Locally

### Step 1: Start Backend
```bash
cd backend
npm install
npm run dev
# Backend running on http://localhost:5000
```

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```

### Step 3: Test API Calls
Open DevTools → Network tab and:
- API calls should go to `http://localhost:5000/api/*`
- Everything should work normally

### Step 4: Test Production Paths (Optional)
```bash
# Test the /_/backend proxy locally
curl http://localhost:5173/_/backend/api/auth/stats

# Should work if backend is running
```

---

## 🚀 Deployment Steps

### Step 1: Verify Files
- [ ] `vercel.json` exists at project root
- [ ] `backend/package.json` has `"start"` script
- [ ] `frontend/.env.production` set correctly
- [ ] Both `frontend/` and `backend/` directories in Git

### Step 2: Commit and Push
```bash
git add .
git commit -m "Configure monorepo deployment with both frontend and backend"
git push origin main
```

### Step 3: Vercel Redeploy
1. Go to: https://vercel.com/dashboard
2. Select: `kemp-rho`
3. Click: **Redeploy** button
4. Wait for build to complete

### Step 4: Check Logs
1. In Vercel dashboard, go to: **Deployments → [Latest] → Logs**
2. Look for:
   - ✅ `frontend` built successfully
   - ✅ `backend` started successfully
3. If errors, check deployment logs for details

### Step 5: Test in Production
```bash
# Open https://kemp-rho.vercel.app/
# Open DevTools → Network tab
# Check that API calls go to https://kemp-rho.vercel.app/_/backend/api/*

# Try logging in - should work!
```

---

## 📊 API Call Flow

### Development
```
Browser (localhost:5173)
    ↓
getApiUrl('/auth/login')
    ↓
http://localhost:5000/api/auth/login
    ↓
Backend (localhost:5000)
```

### Production
```
Browser (kemp-rho.vercel.app)
    ↓
getApiUrl('/auth/login')
    ↓
/_/backend/api/auth/login
    ↓
https://kemp-rho.vercel.app/_/backend/api/auth/login
    ↓
Backend (same Vercel project)
```

---

## 🔄 How API Utility Works

Your `frontend/src/utils/api.js` automatically handles both:

```javascript
// In development (.env.local)
import.meta.env.VITE_API_URL = 'http://localhost:5000/api'
// Result: http://localhost:5000/api/auth/login

// In production (.env.production)
import.meta.env.VITE_API_URL = '/_/backend/api'
// Result: /_/backend/api/auth/login
```

No code changes needed! 🎉

---

## 🆘 Troubleshooting

### Backend Not Starting in Production
**Error**: `502 Bad Gateway`

**Cause**: Backend has errors or missing `start` script

**Fix**:
1. Check Vercel deployment logs
2. Ensure `backend/package.json` has:
   ```json
   "start": "node src/server.js"
   ```
3. Ensure backend doesn't crash on startup
4. Redeploy

### 404 on API Calls
**Error**: `404 Not Found` on API requests

**Cause**: API utility or backend not running

**Fix**:
1. Check Network tab - is URL `/_/backend/api/*`?
2. Check backend logs - is it running?
3. Try accessing `https://kemp-rho.vercel.app/_/backend/` directly
4. If you see backend homepage, backend is working!

### CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Cause**: CORS not configured for same domain

**Fix**: Should NOT happen on same domain! But if it does:
1. Check backend CORS configuration
2. Ensure frontend and backend are on same domain
3. Test with `credentials: true` in fetch options

### Frontend Showing 404 Page
**Error**: React app shows 404 page

**Cause**: Vercel routing not configured for SPA

**Fix**:
1. Add to `vercel.json`:
   ```json
   "routes": [
     { "src": "/.*", "destination": "/index.html" }
   ]
   ```

---

## ⚡ Performance Benefits

✅ **Same Domain**: No CORS issues
✅ **Faster**: No cross-domain latency
✅ **Simpler**: One deployment process
✅ **Cheaper**: Single Vercel project
✅ **Scalable**: Can separate later if needed

---

## 📝 Environment Variable Reference

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_API_URL` | `http://localhost:5000/api` | `/_/backend/api` |
| `PORT` | N/A (frontend uses 5173) | Auto-assigned by Vercel |
| `NODE_ENV` | `development` | `production` |

---

## ✅ Deployment Checklist

Before pushing to production:

- [ ] `vercel.json` updated with experimentalServices
- [ ] `backend/package.json` has `"start"` script
- [ ] `frontend/.env.production` has `VITE_API_URL=/_/backend/api`
- [ ] Backend respects `PORT` environment variable
- [ ] CORS configured for production domain
- [ ] All files committed to Git
- [ ] Vercel redeployed (not just pushed)
- [ ] Logs show both frontend and backend starting
- [ ] API calls in DevTools show `/_/backend/api/*` URLs

---

## 🎯 Next Steps

1. **Update backend `package.json`** - Add `"start"` script if missing
2. **Update backend server** - Ensure it respects `PORT` env var
3. **Update CORS** - Configure for production domain
4. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Setup monorepo deployment: both frontend and backend on Vercel"
   git push origin main
   ```
5. **Redeploy on Vercel** - Click Redeploy button
6. **Test in production** - Verify API calls and functionality

You're now ready for true full-stack deployment! 🚀
