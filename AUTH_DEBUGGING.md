# Authentication Debugging Guide

## Overview
This guide helps troubleshoot 401 errors and authentication issues in production.

## ✅ What Was Fixed

### Frontend (Client-side)
1. **AuthContext.jsx** - Added logging for all auth operations
   - Token storage/retrieval logged
   - Login/signup/logout flow tracked
   - Token verification on app load logged

2. **AppContext.jsx** - Enhanced API request handling
   - All fetch requests now include `credentials: 'include'`
   - Authorization headers logged before sending
   - Non-array responses handled safely (fallback to empty arrays)
   - Comprehensive error logging with HTTP status codes

### Backend (Server-side)
1. **All API routes** - Added debug logging to track:
   - Authorization header receipt
   - Token verification success/failure
   - Request method and operation
   - Response status and data counts

2. **JSON responses** - All endpoints now return:
   - Proper JSON for success responses
   - Proper JSON for error responses (replaced `.end()` with `.json()`)

## 🔍 How to Debug Production Issues

### Step 1: Check Browser Console (Frontend Logs)

Open browser DevTools (F12) → Console tab and look for logs like:

```
[Auth] Token found, checking if valid
[API] Adding auth token to headers: eyJhbGciOiJIUzI1NiIs...
[Auth] Login successful, storing token
[API] Response not ok (401), attempting to parse error
```

**If you see:**
- `[Auth] No token found in localStorage` → User never logged in
- `[Auth] Token verification failed` → Token expired or invalid
- `[API] No token available for headers` → Token not in localStorage

### Step 2: Check Server Logs (Backend Logs)

Look for logs like:

```
[API /budgets] Auth header received: yes (eyJhbGciOiJIUzI1NiIs...)
[API /budgets] Token verified successfully
[API /budgets] GET request received
[API /budgets] Found 5 budgets
```

**If you see:**
- `[API /budgets] Auth header received: no` → Token not sent from frontend
- `[API /budgets] Token verification failed: jwt malformed` → Token corrupted
- `[API /budgets] Token verification failed: jwt expired` → JWT_SECRET mismatch or expired

### Step 3: Verify Environment Variables

**Check production has:**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-long-secret-key
```

**Get JWT_SECRET on server:**
```bash
echo $JWT_SECRET
# Should output your secret, not empty
```

**If empty:**
- Set in deployment platform (Vercel, Heroku, AWS, etc.)
- Restart application after setting

## 🚨 Common Issues & Fixes

### Issue 1: 401 on API calls but login works

**Root Cause:** Token not being sent in Authorization header

**Check:**
```javascript
// DevTools Console
localStorage.getItem('auth_token')
// Should output token string starting with 'eyJ...'
```

**Fix:** Ensure `credentials: 'include'` in all fetches ✅ (Already done)

---

### Issue 2: 401 immediately after successful login

**Root Cause:** JWT_SECRET mismatch between login and API routes

**Check in server logs:**
```
[API /auth/login] Login successful, token created for: user@example.com
[API /budgets] Token verification failed: jwt malformed
```

**Fix:** 
- Verify JWT_SECRET is same everywhere
- Restart application after changing JWT_SECRET
- Check for typos in secret

---

### Issue 3: Token works locally but not in production

**Root Cause:** Different JWT_SECRET locally vs. production

**Check:**
```bash
# Locally (development)
echo $JWT_SECRET
# Output: super-secret-key (fallback default)

# Production
# Check dashboard (Vercel/Heroku/etc.) for actual secret
```

**Fix:**
- Set explicit JWT_SECRET in production
- Don't rely on fallback "super-secret-key"

---

### Issue 4: Mixed 401 errors, some endpoints work

**Root Cause:** Token stored but headers not sent properly

**Check logs in order:**
1. Login: `[API /auth/login] Login successful`
2. Fetch data: `[API /budgets] Auth header received`
3. If #2 shows `no` → Headers not sent

**Fix:**
- React component re-renders → token lost
- Use `useAuth()` hook in components
- Ensure AuthProvider wraps all components

---

### Issue 5: Token valid but `User not found`

**Root Cause:** User deleted from DB or user ID mismatch

**Check logs:**
```
[API /auth/me] Token verified, user ID: 507f1f77bcf86cd799439011
[API /auth/me] User not found: 507f1f77bcf86cd799439011
```

**Fix:**
- Verify user exists in MongoDB
- Check user ID matches token payload
- Re-login to create new session

---

## 📋 Production Checklist

Before deploying to production:

- [ ] JWT_SECRET set in production environment variables
- [ ] MONGODB_URI correctly pointing to production database
- [ ] All API routes have logging (to debug future issues)
- [ ] All fetch calls include `credentials: 'include'`
- [ ] Authorization headers being sent (check logs)
- [ ] Error responses are valid JSON (not HTML)
- [ ] Frontend uses try/catch around res.json()
- [ ] Test login → access protected route → test logout

## 🔐 Security Notes

**Current Setup:**
- JWT stored in localStorage (not httpOnly)
- Token sent via Authorization header (not cookie)
- Token expires in 7 days

**For Better Security (Optional):**
1. Use httpOnly cookies instead of localStorage
2. Add HTTPS requirement (sameSite: 'strict')
3. Rotate tokens on each request
4. Implement refresh token system
5. Add rate limiting on login endpoint

## 📊 Monitoring Query

Check token age in browser:
```javascript
const token = localStorage.getItem('auth_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
const exp = new Date(payload.exp * 1000);
console.log('Token expires at:', exp);
console.log('Time until expiry:', Math.round((exp - Date.now()) / 1000), 'seconds');
```

## 🆘 Still Having Issues?

1. **Collect logs from both browser console and server**
2. **Verify all env variables are set**
3. **Clear localStorage and log in again**
4. **Check MongoDB connection is working**
5. **Verify JWT_SECRET is consistent**

All logs now include prefixes like `[Auth]`, `[API]`, `[AppContext]` to easily filter and trace issues.
