# Deploy Your App NOW - Quick Guide

## Current Problem

❌ Your frontend is on GitHub Pages but backend is NOT deployed
❌ API calls fail with 405 errors
❌ App doesn't work in production

## Solution (15 Minutes)

### Step 1: Deploy Backend (5 min)

**Go to Render.com:**
1. Visit https://render.com and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Fill in:
   ```
   Name: studyhub-backend
   Root Directory: hosting/backend
   Build Command: npm install
   Start Command: npm start
   ```
5. Add Environment Variables (click "Environment"):
   ```
   MONGO_URI=mongodb+srv://abhiramreddyvundhyala_db_user:mlFLhYkkqb046HAC@studyhub.ln04j07.mongodb.net/studyhub?retryWrites=true&w=majority&appName=studyhub
   JWT_SECRET=studyhub-jwt-s3cr3t-k3y-2026-xK9mP2vL8nQ
   GEMINI_API_KEY=AIzaSyBX-MIusFvhY81PVt5ZNwtvxYhRY6e6x6g
   NODE_ENV=production
   ```
6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. **Copy your backend URL** (e.g., `https://studyhub-backend-xxxx.onrender.com`)

### Step 2: Update Frontend (2 min)

**Create `.env.production` file:**

In `hosting/` folder, create a file named `.env.production`:
```env
VITE_API_URL=https://studyhub-backend-xxxx.onrender.com
```

**Replace** `studyhub-backend-xxxx.onrender.com` with YOUR actual backend URL from Step 1.

### Step 3: Deploy Frontend (3 min)

**Run deployment script:**

```bash
cd hosting
npm run build
npm install -D gh-pages
npx gh-pages -d dist
```

Or use the script:
```bash
# Windows
deploy.bat

# Mac/Linux
chmod +x deploy.sh
./deploy.sh
```

### Step 4: Test (2 min)

1. Wait 2-3 minutes for GitHub Pages to update
2. Visit https://varma22.github.io/sahvikaas/
3. Try to sign up
4. Should work! ✅

## Troubleshooting

### Backend deployment failed?
- Check Render logs
- Verify environment variables are set
- Make sure MongoDB Atlas allows all IPs (0.0.0.0/0)

### Frontend still shows errors?
- Clear browser cache (Ctrl+Shift+Delete)
- Check `.env.production` has correct URL
- Rebuild: `npm run build`
- Redeploy: `npx gh-pages -d dist`

### CORS errors?
Update `hosting/backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://varma22.github.io',
  credentials: true
}))
```
Then redeploy backend (Render auto-deploys on git push)

## Quick Commands

```bash
# Deploy backend (after pushing to GitHub)
# Render auto-deploys

# Deploy frontend
cd hosting
npm run build
npx gh-pages -d dist

# Test backend
curl https://your-backend-url.onrender.com/api/health

# Test frontend
# Visit: https://varma22.github.io/sahvikaas/
```

## What You'll Have

✅ Backend running on Render (always online)
✅ Frontend on GitHub Pages (fast, free)
✅ MongoDB Atlas (database)
✅ Fully functional app

## Free Tier Limits

**Render Free:**
- Sleeps after 15 min inactivity
- Wakes up on first request (takes ~30 seconds)
- 750 hours/month free

**GitHub Pages:**
- Unlimited static hosting
- 100GB bandwidth/month

**MongoDB Atlas:**
- 512MB storage
- Shared cluster

## Upgrade Later

If you need better performance:
- Render Starter: $7/month (no sleep)
- MongoDB M10: $57/month (dedicated)

## Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review Render logs for backend errors
3. Check browser console for frontend errors
4. Verify environment variables are set correctly

## Summary

1. Deploy backend to Render ✅
2. Copy backend URL ✅
3. Create `.env.production` with backend URL ✅
4. Build and deploy frontend ✅
5. Test and celebrate! 🎉

Your app should now be fully functional in production!
