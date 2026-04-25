# Quick Update Reference - Replace All Hardcoded API URLs

## Copy-Paste Examples for Each File Type

### ✅ Pattern 1: Simple API_URL Variable (Most Common)

**Files**: `LoginPage.jsx`, `Community.jsx`, `Profile.jsx`, `Buying.jsx`, `AdminDashboard.jsx`, etc.

**OLD CODE:**
```javascript
const API_URL = "http://localhost:5000/api/auth";
const API_URL = "http://localhost:5000/api/products";
const API_URL = "http://localhost:5000/api";
```

**NEW CODE:**
```javascript
import { getApiUrl } from '@/utils/api';

// Use like this:
await fetch(getApiUrl('/auth/login'), { method: 'POST', ... });
await fetch(getApiUrl('/products'), { method: 'GET', ... });
await fetch(getApiUrl('/path'), { method: 'GET', ... });
```

### ✅ Pattern 2: Hardcoded in Fetch Call

**Files**: `Home.jsx` (already updated), `ProductDetailModal.jsx`, `SaleRecordModal.jsx`

**OLD CODE:**
```javascript
const response = await fetch('http://localhost:5000/api/notifications/purchase', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**NEW CODE:**
```javascript
import { getApiUrl } from '@/utils/api';

const response = await fetch(getApiUrl('/notifications/purchase'), {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### ✅ Pattern 3: Template Literal with User ID

**Files**: `LoginPage.jsx`, `UserProfile.jsx`

**OLD CODE:**
```javascript
idCardUrl: `http://localhost:5000/api/auth/idcard/${data.userId}`,
```

**NEW CODE:**
```javascript
import { getApiUrl } from '@/utils/api';

idCardUrl: getApiUrl(`/auth/idcard/${data.userId}`),
```

### ✅ Pattern 4: Multiple API URLs in Component

**Files**: `AdminDashboard.jsx`, `Profile.jsx`

**OLD CODE:**
```javascript
const API_URL = "http://localhost:5000/api/auth";
const NOTIFICATION_API_URL = "http://localhost:5000/api";

// Used separately:
fetch(API_URL + '/users')
fetch(NOTIFICATION_API_URL + '/notifications')
```

**NEW CODE:**
```javascript
import { getApiUrl } from '@/utils/api';

// Now use directly:
fetch(getApiUrl('/auth/users'))
fetch(getApiUrl('/notifications'))
```

---

## File-by-File Update Instructions

### 1. **LoginPage.jsx** (2 occurrences)
```javascript
// Line 7: Replace
const API_URL = "http://localhost:5000/api/auth";
// With:
import { getApiUrl } from '@/utils/api';

// Line 160: Replace
idCardUrl: `http://localhost:5000/api/auth/idcard/${data.userId}`,
// With:
idCardUrl: getApiUrl(`/auth/idcard/${data.userId}`),

// Line 81-87: Replace
fetch(`${API_URL}/register`, ...)
// With:
fetch(getApiUrl('/auth/register'), ...)

// Line 100-105: Replace
fetch(`${API_URL}/login`, ...)
// With:
fetch(getApiUrl('/auth/login'), ...)
```

### 2. **Buying.jsx** (1 occurrence)
```javascript
// Line 4: Replace
const API_URL = "http://localhost:5000/api/products";
// With:
import { getApiUrl } from '@/utils/api';

// Usage: Replace
fetch(`${API_URL}`)
// With:
fetch(getApiUrl('/products'))
```

### 3. **Community.jsx** (1 occurrence)
```javascript
// Line 6: Replace
const API_URL = 'http://localhost:5000/api/community';
// With:
import { getApiUrl } from '@/utils/api';

// Usage: Replace
fetch(API_URL, ...)
// With:
fetch(getApiUrl('/community'), ...)
```

### 4. **AdminDashboard.jsx** (2 occurrences)
```javascript
// Lines 4-5: Replace
const API_URL = "http://localhost:5000/api/auth";
const NOTIFICATION_API_URL = "http://localhost:5000/api";
// With:
import { getApiUrl } from '@/utils/api';

// Usage: Replace all
fetch(API_URL + '/...')
fetch(NOTIFICATION_API_URL + '/...')
// With:
fetch(getApiUrl('/auth/...'))
fetch(getApiUrl('/...'))
```

### 5. **Profile.jsx** (1 occurrence)
```javascript
// Line 8: Replace
const API_URL = "http://localhost:5000/api";
// With:
import { getApiUrl } from '@/utils/api';

// Usage: Replace
fetch(`${API_URL}/...`)
// With:
fetch(getApiUrl('/...'))
```

### 6. **UserProfile.jsx** (1 occurrence)
```javascript
// Line 37: Replace
idCardUrl: userId ? `http://localhost:5000/api/auth/idcard/${userId}` : "#",
// With:
import { getApiUrl } from '@/utils/api';
// At line 37:
idCardUrl: userId ? getApiUrl(`/auth/idcard/${userId}`) : "#",
```

### 7. **ProductDetailModal.jsx** (1 occurrence)
```javascript
// Line 42: Replace
const notificationResponse = await fetch('http://localhost:5000/api/notifications/purchase', {
// With:
import { getApiUrl } from '@/utils/api';
// At line 42:
const notificationResponse = await fetch(getApiUrl('/notifications/purchase'), {
```

### 8. **SaleRecordModal.jsx** (2 occurrences)
```javascript
// Line 48: Replace
const response = await fetch('http://localhost:5000/api/sales/sales-records', {
// With:
import { getApiUrl } from '@/utils/api';
// At line 48:
const response = await fetch(getApiUrl('/sales/sales-records'), {

// Line 75: Replace
const deleteResponse = await fetch(`http://localhost:5000/api/products/${product._id}`, {
// With:
const deleteResponse = await fetch(getApiUrl(`/products/${product._id}`), {
```

### 9. **SellingForm.jsx** (1 occurrence)
```javascript
// Line 4: Replace
const API_URL = "http://localhost:5000/api/products";
// With:
import { getApiUrl } from '@/utils/api';

// Usage: Replace
fetch(API_URL, ...)
// With:
fetch(getApiUrl('/products'), ...)
```

### 10. **Admin Pages** (AdminLoginPage.jsx, AdminUsersManagement.jsx, StaffDashboard.jsx, StaffLoginPage.jsx)
All follow same pattern:
```javascript
// Replace:
const API_URL = "http://localhost:5000/api/auth";
// With:
import { getApiUrl } from '@/utils/api';

// Replace all usages:
fetch(API_URL + '/path', ...)
fetch(`${API_URL}/path`, ...)
// With:
fetch(getApiUrl('/auth/path'), ...)
```

### 11. **Notifications.jsx** (1 occurrence)
```javascript
// Line 5: Replace
const API_URL = "http://localhost:5000/api";
// With:
import { getApiUrl } from '@/utils/api';
```

---

## Bulk Update Script (Manual - No Tools)

### Using VS Code Find & Replace:

1. **Open Find & Replace**: `Ctrl+H`
2. **Find**: `const API_URL = "http://localhost:5000/api/auth";`
3. **Replace**: (Keep empty to just remove)
4. **Replace All**: Click replace all button
5. **Add import**: Add `import { getApiUrl } from '@/utils/api';` at top of file

Repeat for other URL patterns found in your codebase.

---

## Verification Checklist

After updating each file:
- [ ] File has `import { getApiUrl } from '@/utils/api';` at the top
- [ ] No `http://localhost:5000` remains in the file
- [ ] No `const API_URL = ...` with hardcoded URL
- [ ] All fetch calls use `getApiUrl('/path')`
- [ ] Component compiles without errors (`npm run build`)

---

## Test Command

After updating ALL files, test:
```bash
# Local testing (uses .env.local)
npm run dev

# Test production build locally
npm run build
npm run preview

# Should show API calls to http://localhost:5000/api in DevTools
# When deployed, will use VITE_API_URL from Vercel environment
```

---

## Expected Result

✅ After all updates:
- All 20+ API URLs will be environment-aware
- Local development: Uses `http://localhost:5000/api`
- Production: Uses `VITE_API_URL` from Vercel
- No more hardcoded URLs
- Easy to change backend without rebuilding code

---

## Time Estimate
- Find & understand pattern: 5 min
- Update all files: 15-20 min
- Test locally: 5 min
- **Total: ~25 minutes**

Good luck! 🚀
