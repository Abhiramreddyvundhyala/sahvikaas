# Upload Error 500 Fix Guide

## Problem
Getting 500 error when uploading files to `/api/resources/upload` after deployment on Render.

Error: `Upload error: 500 {"error":"Upload failed"}`

## Root Causes

### 1. Missing Cloudinary Environment Variables on Render
The backend needs these environment variables set in Render:

```
CLOUDINARY_CLOUD_NAME=dp7qicyzj
CLOUDINARY_API_KEY=311766218946534
CLOUDINARY_API_SECRET=rRb5jZ46pguNjElIAGZzoL809iI
```

### 2. Authentication Token Issues
The upload endpoint requires authentication. Check if:
- User is logged in
- JWT token is being sent in the Authorization header
- Token is valid and not expired

### 3. File Size Limits
- Cloudinary config allows up to 50MB
- Check if file exceeds this limit

## Quick Fix Steps

### Step 1: Verify Render Environment Variables
1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add these variables if missing:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `JWT_SECRET`
   - `MONGO_URI`
   - `GEMINI_API_KEY`

### Step 2: Check Render Logs
```bash
# In Render dashboard, go to "Logs" tab
# Look for error messages when upload fails
# Common errors:
# - "Cloudinary config error"
# - "Authentication failed"
# - "File upload failed"
```

### Step 3: Test Authentication
Open browser console and check:
```javascript
// Check if token exists
localStorage.getItem('token')

// Check request headers
// Network tab -> upload request -> Headers
// Should see: Authorization: Bearer <token>
```

### Step 4: Add Better Error Logging
The current error handler is too generic. We need to see the actual error.

## Recommended Code Fix

Update the upload endpoint to provide better error details:

```javascript
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    console.log('File uploaded successfully:', req.file)
    
    const fileUrl = req.file.path
    const sizeInMB = (req.file.size / 1024 / 1024).toFixed(2)
    const size = `${sizeInMB} MB`
    
    res.json({
      ok: true,
      fileUrl,
      size,
      filename: req.file.filename,
      originalName: req.file.originalname,
    })
  } catch (err) {
    console.error('Upload error:', err)
    // Return detailed error for debugging
    res.status(500).json({ 
      error: 'File upload failed',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
})
```

## Testing Checklist

- [ ] Cloudinary credentials are set in Render environment variables
- [ ] User is logged in (check localStorage.getItem('token'))
- [ ] Authorization header is being sent with requests
- [ ] File size is under 50MB
- [ ] Check Render logs for specific error messages
- [ ] Verify Cloudinary dashboard shows no API errors

## Common Issues

### Issue: "Upload failed" with no details
**Solution**: Check Render logs for the actual error message

### Issue: 401 Unauthorized
**Solution**: User needs to log in again, token may be expired

### Issue: Cloudinary config error
**Solution**: Verify all three Cloudinary env vars are set correctly in Render

### Issue: File too large
**Solution**: Reduce file size or increase limit in cloudinary.js

## Next Steps

1. Check Render environment variables first
2. Look at Render logs during upload attempt
3. Verify user authentication token
4. Test with a small file (< 1MB) first
5. If still failing, add detailed error logging to the endpoint
