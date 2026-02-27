# Deployment Guide - StudyHub

## Current Issue

Your frontend is deployed on GitHub Pages, but the backend API is not deployed. GitHub Pages only serves static files and cannot run Node.js servers.

**Error:** `405 Method Not Allowed` on `/api/auth/signup` and `/api/auth/login`

**Cause:** API calls are going to GitHub Pages instead of a Node.js server.

## Solution: Deploy Backend + Frontend Separately

### Architecture

```
Frontend (GitHub Pages)          Backend (Render/Railway)
├── React/Vite App       →       ├── Node.js/Express
├── Static Files                 ├── MongoDB Connection
└── Calls API at:                ├── Socket.IO
    https://your-backend.com     └── REST API Endpoints
```

## Step 1: Deploy Backend (Choose One)

### Option A: Render.com (Recommended - Free)

**1. Create Render Account**
- Go to https://render.com
- Sign up with GitHub

**2. Create New Web Service**
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select repository: `Savikaasai` (or your repo name)

**3. Configure Service**
```
Name: studyhub-backend
Region: Choose closest to you
Branch: main
Root Directory: hosting/backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**4. Add Environment Variables**
Click "Environment" and add:
```
MONGO_URI=mongodb+srv://abhiramreddyvundhyala_db_user:mlFLhYkkqb046HAC@studyhub.ln04j07.mongodb.net/studyhub?retryWrites=true&w=majority&appName=studyhub
JWT_SECRET=studyhub-jwt-s3cr3t-k3y-2026-xK9mP2vL8nQ
GEMINI_API_KEY=AIzaSyBX-MIusFvhY81PVt5ZNwtvxYhRY6e6x6g
PORT=5000
NODE_ENV=production
```

**5. Deploy**
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Copy your backend URL: `https://studyhub-backend-xxxx.onrender.com`

**6. Test Backend**
```bash
curl https://your-backend-url.onrender.com/api/health
```
Should return: `{"status":"ok","message":"StudyHub Backend Running"}`

### Option B: Railway.app (Easy Alternative)

**1. Create Railway Account**
- Go to https://railway.app
- Sign up with GitHub

**2. New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository

**3. Configure**
- Root Directory: `hosting/backend`
- Add environment variables (same as above)

**4. Deploy**
- Railway auto-deploys
- Copy your backend URL

### Option C: Vercel (Serverless)

**Note:** Requires some code changes for serverless functions.

## Step 2: Update Frontend Configuration

### Create Production Environment File

Create `hosting/.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

**Replace** `your-backend-url.onrender.com` with your actual backend URL from Step 1.

### Update Socket Configuration

Update `hosting/src/lib/socket.js`:

```javascript
const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com'
```

## Step 3: Rebuild and Redeploy Frontend

### Build with Production Config

```bash
cd hosting
npm run build
```

This creates a `dist` folder with your production build.

### Deploy to GitHub Pages

**Option 1: Using gh-pages package**
```bash
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

**Option 2: Manual GitHub Pages**
1. Go to your GitHub repository
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `gh-pages` or `main`
5. Folder: `/dist` or `/docs`
6. Save

### Update GitHub Pages Settings

If using custom domain or base path, ensure `vite.config.js` has correct base:
```javascript
export default defineConfig({
  base: '/sahvikaas/', // Your repo name
  // ... rest of config
})
```

## Step 4: Configure CORS on Backend

Update `hosting/backend/server.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://varma22.github.io',
    'https://your-custom-domain.com'
  ],
  credentials: true
}))
```

## Step 5: Test Deployment

### Test Backend
```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Test with actual request
curl -X POST https://your-backend-url.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

### Test Frontend
1. Visit your GitHub Pages URL
2. Try to sign up
3. Check browser console for errors
4. Verify API calls go to your backend URL

## Troubleshooting

### Issue: CORS Errors

**Symptom:** `Access-Control-Allow-Origin` errors in console

**Solution:** Update CORS configuration in `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://varma22.github.io',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### Issue: 404 on API Routes

**Symptom:** API calls return 404

**Solution:** 
1. Check backend is running: Visit `https://your-backend-url.onrender.com/api/health`
2. Verify `VITE_API_URL` is set correctly
3. Check browser Network tab for actual URL being called

### Issue: MongoDB Connection Failed

**Symptom:** Backend logs show MongoDB errors

**Solution:**
1. Check MongoDB Atlas network access
2. Add `0.0.0.0/0` to IP whitelist (for cloud deployments)
3. Verify connection string in environment variables

### Issue: Environment Variables Not Working

**Symptom:** Backend can't find `process.env.MONGO_URI`

**Solution:**
1. Verify variables are set in Render/Railway dashboard
2. Restart the service
3. Check logs for "MongoDB connected" message

### Issue: Socket.IO Not Connecting

**Symptom:** Real-time features don't work

**Solution:**
1. Update socket URL in `socket.js`
2. Ensure backend allows WebSocket connections
3. Check CORS settings include Socket.IO

## Complete Deployment Checklist

### Backend
- [ ] Backend deployed to Render/Railway
- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] Health check endpoint returns 200
- [ ] CORS configured for frontend domain
- [ ] Backend URL copied

### Frontend
- [ ] `.env.production` created with backend URL
- [ ] `socket.js` updated with backend URL
- [ ] Built with `npm run build`
- [ ] Deployed to GitHub Pages
- [ ] Base path configured correctly

### Testing
- [ ] Can access frontend URL
- [ ] Signup works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create rooms
- [ ] Real-time features work
- [ ] No console errors

## Alternative: Deploy Both on Same Platform

### Vercel (Frontend + Serverless Backend)

**Pros:** Single platform, easy setup
**Cons:** Requires serverless function conversion

### Netlify (Frontend + Serverless Backend)

**Pros:** Good free tier, easy setup
**Cons:** Requires serverless function conversion

### DigitalOcean App Platform

**Pros:** Can deploy both together
**Cons:** Paid service

## Recommended Setup

**For Free Deployment:**
```
Frontend: GitHub Pages (Free)
Backend: Render.com (Free tier)
Database: MongoDB Atlas (Free tier)
```

**For Production:**
```
Frontend: Vercel/Netlify (Better performance)
Backend: Railway/Render (Paid tier for better uptime)
Database: MongoDB Atlas (Paid tier)
```

## Environment Variables Reference

### Backend (.env)
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-api-key
PORT=5000
NODE_ENV=production
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## Post-Deployment

### Monitor Your App

**Render Dashboard:**
- Check logs for errors
- Monitor resource usage
- View deployment history

**MongoDB Atlas:**
- Monitor database connections
- Check query performance
- Review storage usage

### Update Deployment

**Backend:**
```bash
git push origin main
# Render auto-deploys on push
```

**Frontend:**
```bash
npm run build
npm run deploy
# Or push to GitHub (if auto-deploy enabled)
```

## Cost Estimate

### Free Tier (Recommended for Development)
- Frontend (GitHub Pages): Free
- Backend (Render): Free (sleeps after 15 min inactivity)
- Database (MongoDB Atlas): Free (512MB)
- **Total: $0/month**

### Paid Tier (Recommended for Production)
- Frontend (Vercel Pro): $20/month
- Backend (Render Starter): $7/month
- Database (MongoDB Atlas M10): $57/month
- **Total: ~$84/month**

## Support

If deployment fails:
1. Check service logs (Render/Railway dashboard)
2. Verify environment variables
3. Test backend health endpoint
4. Check MongoDB Atlas network access
5. Review CORS configuration

## Summary

1. ✅ Deploy backend to Render/Railway
2. ✅ Add environment variables
3. ✅ Get backend URL
4. ✅ Update frontend `.env.production`
5. ✅ Rebuild frontend
6. ✅ Deploy to GitHub Pages
7. ✅ Test everything works

Your app will then be fully deployed and functional! 🚀
