# Production Deployment Checklist

Complete this before deploying to production.

## ✅ Environment Configuration

### JWT Secret
- [ ] Generate secure JWT_SECRET
  ```bash
  # Option 1 (macOS/Linux)
  openssl rand -base64 32

  # Option 2 (Node.js)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Add JWT_SECRET to production environment variables
- [ ] Verify it matches no local value (use complex random string)
- [ ] DO NOT commit JWT_SECRET to git

### MongoDB
- [ ] Verify MONGODB_URI points to production database
- [ ] Test connection: `mongodb+srv://user:pass@cluster.mongodb.net/prod-db`
- [ ] Ensure connection string uses strong password
- [ ] IP whitelist includes production server IP/all IPs (0.0.0.0/0)

### Environment Variables
- [ ] All required vars present:
  ```
  MONGODB_URI=...
  JWT_SECRET=...
  ```
- [ ] No hardcoded secrets in code
- [ ] .env file NOT committed to git (check .gitignore)
- [ ] .env.example exists with template

## ✅ Code Changes

- [ ] All fetch requests include `credentials: 'include'`
- [ ] All API routes verify JWT token
- [ ] All responses are JSON (no text/html responses)
- [ ] Logging present for debugging: `[Auth]`, `[API]`, `[AppContext]`
- [ ] Error handling catches all paths

## ✅ Security

- [ ] HTTPS enforced in production
- [ ] JWT expires in reasonable time (7 days: ✅)
- [ ] Passwords hashed with bcrypt (✅)
- [ ] No sensitive data in error messages
- [ ] CORS configured (if needed)

## ✅ Testing Before Deploy

### Local Testing
```bash
# 1. Clear everything
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. Build
pnpm build

# 3. Start production server
pnpm start

# 4. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Should return: { "token": "eyJ...", "user": {...} }
```

### In-App Testing (Browser)
1. Open DevTools (F12) → Console
2. Full login flow:
   - [ ] Go to /signup → create account
   - [ ] Check console for `[Auth]` logs
   - [ ] Go to /login → sign in
   - [ ] Check token stored: `JSON.parse(localStorage.getItem('auth_token'))`
   - [ ] Redirect to dashboard
   - [ ] View budgets/transactions (verify `[API]` logs show token)
   - [ ] Create new transaction (verify POST succeeds)
   - [ ] Delete transaction (verify DELETE succeeds)
   - [ ] Sign out
   - [ ] Verify redirected to /login
   - [ ] Fresh page load → should redirect to /login (not dashboard)

### Error Cases
1. [ ] Try accessing /api/budgets without token → 401
   ```
   curl http://localhost:3000/api/budgets
   # Returns: { "message": "Missing authorization token" }
   ```

2. [ ] Try with invalid token → 401
   ```
   curl -H "Authorization: Bearer invalid" \
     http://localhost:3000/api/budgets
   # Returns: { "message": "Invalid or expired token" }
   ```

3. [ ] Server logs show clear error messages

## ✅ Deployment Platform Setup

### Vercel
- [ ] JWT_SECRET added in Settings → Environment Variables
- [ ] MONGODB_URI added in Settings → Environment Variables
- [ ] Deploy from main/master branch
- [ ] Wait for build to complete
- [ ] Test deployed app immediately

### Docker/VPS
- [ ] JWT_SECRET in `/etc/environment` or `.env`
- [ ] Run `source /etc/environment` before starting app
- [ ] Verify with `echo $JWT_SECRET`
- [ ] Restart application: `pm2 restart app` or equivalent

### Heroku
```bash
heroku config:set JWT_SECRET="$(openssl rand -base64 32)"
heroku config:set MONGODB_URI="your-production-uri"
git push heroku main
```

### AWS/Lambda
- [ ] Secrets Manager: Create secret with JWT_SECRET
- [ ] Lambda Environment Variables: Add MONGODB_URI
- [ ] IAM Role: Has secrets access
- [ ] Test endpoint after deploy

## ✅ Post-Deployment Verification

1. [ ] Application loads without errors
2. [ ] Can create account (watch browser console for logs)
3. [ ] Can login (token stored in localStorage)
4. [ ] Can view budgets/transactions
5. [ ] API responses are JSON (check Network tab)
6. [ ] No 401 errors when authenticated
7. [ ] Logout works correctly
8. [ ] Fresh page load maintains session
9. [ ] Server logs show `[Auth]` and `[API]` prefixes
10. [ ] Monitor logs for JWT_SECRET-related errors

## ✅ Monitoring

### Logs to Watch For

✅ Healthy:
```
[Auth] Login successful, storing token
[API /budgets] Auth header received: yes (eyJhbGci...)
[API /budgets] Token verified successfully
```

⚠️ Warning:
```
[API /budgets] Auth header received: no
# → Frontend not sending token
```

❌ Error:
```
[API /budgets] Token verification failed: jwt malformed
# → JWT_SECRET mismatch between machines
```

### Log Rotation
- [ ] Set up log rotation if using server logs
- [ ] Logs should persist for at least 7 days (JWT expiry)
- [ ] Can search logs by `[Auth]`, `[API]` prefix

## ✅ Backup Plan

If 401 errors occur post-deployment:

1. [ ] Check JWT_SECRET is set: `echo $JWT_SECRET`
2. [ ] Restart application
3. [ ] Check MongoDB connection
4. [ ] Review logs for specific errors
5. [ ] Follow AUTH_DEBUGGING.md guide
6. [ ] If still stuck, rollback to previous version

## ✅ Post-Launch Monitoring

First 24 hours:
- [ ] No 401 errors in logs
- [ ] Users can login/logout
- [ ] No crashes related to auth
- [ ] Token is properly verified

First week:
- [ ] Monitor error rate
- [ ] Check if any tokens expire (7-day cycle)
- [ ] Verify logs are being written
- [ ] Test with actual user data

## ⚠️ Important

**NEVER:**
- [ ] Commit .env file with real values
- [ ] Use same JWT_SECRET as other apps
- [ ] Share JWT_SECRET in emails/chat
- [ ] Log full tokens (truncated to 20 chars is OK)

**ALWAYS:**
- [ ] Use HTTPS in production
- [ ] Keep JWT_SECRET secure
- [ ] Rotate JWT_SECRET periodically
- [ ] Monitor authentication logs
- [ ] Test login flow before declaring done

## 📞 Quick Reference

| What | Where |
|------|-------|
| JWT_SECRET | Production env vars only |
| MONGODB_URI | Production env vars only |
| Debug logs | Browser console: `[Auth]`, `[API]` |
| Server logs | Application logs or platform logs |
| Troubleshooting | AUTH_DEBUGGING.md |
| Changes made | AUTHENTICATION_FIX_SUMMARY.md |

---

**Last Updated:** April 2, 2026  
**Status:** ✅ Ready for Production  
**Next Review:** After first user feedback
