# Deploying Resources Feature to Render

## Critical: File Storage Issue

### Problem
Render uses **ephemeral filesystem** - uploaded files are deleted on server restart.

### Solution Options

#### Option 1: Cloudinary (Recommended - Free Tier Available)
- Free: 25GB storage, 25GB bandwidth/month
- Easy setup
- Automatic image optimization
- CDN delivery

#### Option 2: AWS S3
- Pay as you go
- More complex setup
- Industry standard

#### Option 3: Disable File Upload (Quick Fix)
- Only allow URL links (no file upload)
- Works immediately on Render

## Quick Setup: Cloudinary Integration

### Step 1: Get Cloudinary Account
1. Sign up at https://cloudinary.com (free)
2. Get your credentials from dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Install Cloudinary Package
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

### Step 3: Add to .env
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Update backend/routes/resources.js
Replace the multer configuration with Cloudinary storage.

## Alternative: URL-Only Mode (No File Upload)

If you want to deploy quickly without cloud storage setup, you can:

1. Remove file upload functionality
2. Only allow users to paste URLs to their files (Google Drive, Dropbox, etc.)
3. This works immediately on Render

## Deployment Steps

### 1. Commit Changes to GitHub
```bash
git add .
git commit -m "Add resources page with folder organization"
git push origin main
```

### 2. Deploy to Render
- Render will auto-deploy from GitHub
- Make sure environment variables are set in Render dashboard

### 3. Test After Deployment
- Create account
- Upload file (if using Cloudinary)
- Logout and login from different device
- Verify files persist

## Environment Variables Needed on Render

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name (if using Cloudinary)
CLOUDINARY_API_KEY=your_api_key (if using Cloudinary)
CLOUDINARY_API_SECRET=your_api_secret (if using Cloudinary)
```

## What Happens Without Cloud Storage

If you deploy current code to Render without Cloudinary:
- ✅ File upload will work initially
- ❌ Files will be deleted when server restarts (every 15 min of inactivity)
- ❌ Files won't persist across deployments
- ❌ Users will lose their uploaded files

## Recommendation

Choose one:
1. **Setup Cloudinary** (30 min, best solution)
2. **Use URL-only mode** (5 min, works but less convenient)
3. **Deploy as-is for testing** (understand files won't persist)
