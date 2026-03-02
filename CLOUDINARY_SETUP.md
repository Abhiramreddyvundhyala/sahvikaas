# Cloudinary Setup Guide

## ✅ Integration Complete!

Cloudinary has been integrated into your project. Now you just need to add your credentials.

## Step 1: Get Cloudinary Account (5 minutes)

1. Go to **https://cloudinary.com**
2. Click **"Sign Up for Free"**
3. Fill in your details or sign up with Google/GitHub
4. Verify your email

### Free Tier Includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ More than enough for your project!

## Step 2: Get Your Credentials (2 minutes)

1. After signing up, you'll see your **Dashboard**
2. Look for the **"Product Environment Credentials"** section
3. You'll see three values:
   ```
   Cloud Name: dxxxxxxxx
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz
   ```
4. Copy these values

## Step 3: Add to Your .env File (1 minute)

Open `backend/.env` and update these lines:

```env
CLOUDINARY_CLOUD_NAME=dxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

Replace with your actual values from the Cloudinary dashboard.

## Step 4: Test Locally (2 minutes)

1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Open your app in browser
3. Go to Resources page
4. Try uploading a file
5. Check if it works!

## Step 5: Deploy to Render (5 minutes)

### Add Environment Variables to Render:

1. Go to your Render dashboard
2. Select your backend service
3. Click **"Environment"** tab
4. Add these three variables:
   - Key: `CLOUDINARY_CLOUD_NAME` → Value: `your_cloud_name`
   - Key: `CLOUDINARY_API_KEY` → Value: `your_api_key`
   - Key: `CLOUDINARY_API_SECRET` → Value: `your_api_secret`
5. Click **"Save Changes"**
6. Render will automatically redeploy

### Commit and Push to GitHub:

```bash
git add .
git commit -m "Integrate Cloudinary for file uploads"
git push origin main
```

Render will auto-deploy from GitHub.

## Step 6: Test on Production (2 minutes)

1. Wait for Render deployment to complete (5-10 min)
2. Visit your deployed app
3. Register/Login
4. Go to Resources page
5. Upload a file
6. Logout and login again
7. Verify file is still there!

## What's Been Changed:

### Files Modified:
- ✅ `backend/server.js` - Now uses Cloudinary routes
- ✅ `backend/.env` - Added Cloudinary placeholders
- ✅ `backend/package.json` - Added Cloudinary packages

### Files Created:
- ✅ `backend/config/cloudinary.js` - Cloudinary configuration
- ✅ `backend/routes/resources-cloudinary.js` - Routes with Cloudinary storage

### How It Works:
1. User uploads file → Sent to your backend
2. Backend uploads to Cloudinary → Gets back URL
3. URL saved to MongoDB with user ID
4. User can access file from any device
5. Files persist forever (not deleted on server restart)

## Troubleshooting

### Error: "Invalid credentials"
- Check that you copied the correct values from Cloudinary
- Make sure there are no extra spaces
- Verify the environment variables are set in Render

### Error: "File upload failed"
- Check file size (max 50MB)
- Check file type (PDF, DOC, PPT, MP4, JPG, PNG, ZIP)
- Check Cloudinary dashboard for quota limits

### Files not showing after deployment
- Verify environment variables are set in Render
- Check Render logs for errors
- Make sure you pushed latest code to GitHub

## Cloudinary Dashboard

Visit https://cloudinary.com/console to:
- View uploaded files
- Check storage usage
- Monitor bandwidth
- See upload statistics
- Manage file transformations

## Security Notes

- ✅ Files are stored securely in Cloudinary
- ✅ Each user only sees their own files (filtered by userId)
- ✅ Authentication required for all operations
- ✅ File URLs are random and hard to guess
- ✅ Cloudinary provides CDN delivery (fast worldwide)

## Next Steps

After setup:
1. Test file upload locally
2. Commit and push to GitHub
3. Add env vars to Render
4. Test on production
5. Show off your working file upload feature! 🎉

## Need Help?

If you encounter any issues:
1. Check Render logs for errors
2. Verify Cloudinary credentials
3. Test locally first before deploying
4. Check Cloudinary dashboard for upload activity

---

**You're all set!** Just add your Cloudinary credentials and you're ready to deploy! 🚀
