# Fix Upload 500 Error on Render - Quick Guide

## The Problem
After deploying to Render, file uploads fail with:
```
Failed to load resource: the server responded with a status of 500
Upload error: 500 {"error":"Upload failed"}
```

## The Solution (3 Steps)

### Step 1: Set Environment Variables in Render

1. Go to https://dashboard.render.com
2. Click on your backend service (e.g., "studyhub-backend")
3. Click "Environment" in the left sidebar
4. Add these environment variables (click "Add Environment Variable" for each):

```
CLOUDINARY_CLOUD_NAME=dp7qicyzj
CLOUDINARY_API_KEY=311766218946534
CLOUDINARY_API_SECRET=rRb5jZ46pguNjElIAGZzoL809iI
JWT_SECRET=studyhub-jwt-s3cr3t-k3y-2026-xK9mP2vL8nQ
MONGO_URI=mongodb+srv://abhiramreddyvundhyala_db_user:mlFLhYkkqb046HAC@studyhub.ln04j07.mongodb.net/studyhub?retryWrites=true&w=majority&appName=studyhub
GEMINI_API_KEY=AIzaSyCTUGN8bRmEEnBXgfXehrsNWj8oO-fW6XY
PORT=5000
```

4. Click "Save Changes"
5. Render will automatically redeploy your service

### Step 2: Wait for Deployment
- Watch the "Logs" tab in Render
- Wait for the message: "✅ Cloudinary configured: dp7qicyzj"
- This confirms Cloudinary is working

### Step 3: Test Upload
1. Go to your deployed app
2. Make sure you're logged in
3. Try uploading a file
4. If it still fails, check Render logs for the specific error

## How to Check Render Logs

1. In Render dashboard, click your backend service
2. Click "Logs" tab
3. Try uploading a file
4. Look for error messages in the logs
5. You should now see detailed error information

## Common Issues After Setting Env Vars

### Issue 1: "Authentication failed" or 401 error
**Cause**: User not logged in or token expired
**Fix**: Log out and log back in to get a fresh token

### Issue 2: "File too large"
**Cause**: File exceeds 50MB limit
**Fix**: Use a smaller file or increase limit in `backend/config/cloudinary.js`

### Issue 3: Still getting 500 error
**Cause**: Check Render logs for specific error
**Fix**: Look at the logs and share the error message for further help

## Verify It's Working

After deployment, you should see in Render logs:
```
✅ Cloudinary configured: dp7qicyzj
🚀 StudyHub Backend running on http://0.0.0.0:5000
```

When you upload a file, you should see:
```
Upload request received: { hasFile: true, user: 'YourName', userId: '...' }
File uploaded successfully: { filename: '...', originalname: '...', ... }
```

## Still Not Working?

1. Share the Render logs (from the moment you try to upload)
2. Check browser console for any errors
3. Verify you're logged in (check localStorage.getItem('token') in browser console)
4. Try with a very small file (< 1MB) first

## Code Changes Made

I've improved error logging in:
- `backend/routes/resources-cloudinary.js` - Better upload error messages
- `backend/config/cloudinary.js` - Verifies Cloudinary config on startup

These changes will help identify the exact issue if uploads still fail.
