# Cloudinary Setup Guide for Photo Uploads

## 🚨 IMPORTANT: Photo Uploads Require Cloudinary

Your application currently **does not have Cloudinary configured**, which is why photo uploads are not working. You need to set up a free Cloudinary account to enable photo evidence uploads.

## Why Cloudinary?

Cloudinary is a cloud-based image and video management service that:
- ✅ Stores images securely in the cloud
- ✅ Automatically optimizes images for web
- ✅ Provides fast CDN delivery
- ✅ Offers a generous **FREE tier** (25GB storage, 25GB bandwidth/month)
- ✅ No credit card required for free tier

## Step-by-Step Setup

### 1. Create a Free Cloudinary Account

1. **Go to:** https://cloudinary.com/users/register/free
2. **Sign up** with your email or Google account
3. **Verify** your email address
4. **Login** to your Cloudinary dashboard

### 2. Get Your Credentials

Once logged in, you'll see your dashboard:

1. Look for the **"Product Environment Credentials"** section
2. You'll see three important values:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123`)

3. **Copy these values** - you'll need them in the next step

### 3. Configure Your Application

1. **Open** `server/.env` file
2. **Find** the Cloudinary section (at the bottom)
3. **Replace** the placeholder values with your actual credentials:

```env
# Cloudinary Settings
CLOUDINARY_CLOUD_NAME=dxyz123abc          # Your Cloud Name
CLOUDINARY_API_KEY=123456789012345        # Your API Key
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123  # Your API Secret
```

**Example:**
```env
# Before (placeholder)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# After (with your actual credentials)
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

4. **Save** the file

### 4. Restart Your Server

```bash
# Stop the server (Ctrl+C if running)
# Then restart it
cd server
npm run dev
```

You should see in the logs:
```
[info]: Image Upload Service Initialization (Cloudinary)
[info]: Cloud Name: CONFIGURED
```

### 5. Test Photo Upload

1. **Go to** the public suggestion form: `http://localhost:3000`
2. **Fill out** the form
3. **Click** "Click to upload photo" in the "Attach Photo" section
4. **Select** an image (JPEG, PNG, GIF, or WebP, max 2MB)
5. **See** the preview appear
6. **Submit** the form
7. **Check** the admin panel - you should see the 📷 icon
8. **Click** on the suggestion - "View Evidence" button should appear

## Cloudinary Dashboard Features

### View Uploaded Images

1. **Login** to Cloudinary dashboard
2. **Click** "Media Library" in the left sidebar
3. **See** all uploaded images in the `ssg-innovoice` folder
4. **Click** on any image to see details, URL, and transformations

### Monitor Usage

1. **Click** "Dashboard" in the left sidebar
2. **See** your usage statistics:
   - Storage used
   - Bandwidth used
   - Transformations used
3. **Free tier limits:**
   - 25GB storage
   - 25GB bandwidth per month
   - 25,000 transformations per month

### Image Optimization

Cloudinary automatically:
- Compresses images for faster loading
- Converts to WebP format when supported
- Limits image dimensions (max 1200x1200 in your app)
- Serves images via fast CDN

## Troubleshooting

### "Image upload skipped - Cloudinary not configured"

**Problem:** Cloudinary credentials are not set or incorrect

**Solution:**
1. Check `server/.env` file
2. Verify all three values are set (not placeholders)
3. Make sure there are no extra spaces
4. Restart the server

### "Image upload failed"

**Problem:** Invalid credentials or network issue

**Solution:**
1. Double-check your credentials in Cloudinary dashboard
2. Make sure you copied them correctly (no extra spaces)
3. Check server logs: `tail -f server/logs/error.log`
4. Verify your internet connection

### "Image too large"

**Problem:** Image exceeds 2MB limit

**Solution:**
1. Compress the image before uploading
2. Use a smaller image
3. Convert to JPEG format (usually smaller than PNG)

### "Invalid image format"

**Problem:** Unsupported file type

**Solution:**
Only these formats are supported:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## Security Notes

### Keep Your API Secret Safe

⚠️ **NEVER commit your `.env` file to Git!**

The `.env` file is already in `.gitignore`, but double-check:
```bash
# Make sure .env is ignored
cat .gitignore | grep .env
```

Should show:
```
.env
.env.local
.env.*.local
server/.env
```

### For Production Deployment

When deploying to Vercel, Render, or other platforms:

1. **Add environment variables** in the platform's dashboard
2. **Don't hardcode** credentials in your code
3. **Use** the platform's secure environment variable system

**Example for Vercel:**
1. Go to your project settings
2. Click "Environment Variables"
3. Add:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Free Tier Limits

Cloudinary's free tier is generous:

| Feature | Free Tier Limit |
|---------|----------------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Transformations | 25,000/month |
| Images | Unlimited |
| Videos | Up to 500 MB |

For a student suggestion system, this should be **more than enough**!

## Alternative: Disable Photo Uploads

If you don't want to use Cloudinary, you can disable photo uploads:

1. **Remove** the photo upload section from the form
2. **Or** keep it but show a message that photo uploads are temporarily disabled

However, **we recommend setting up Cloudinary** as it's:
- Free
- Easy to set up (5 minutes)
- Provides better evidence for suggestions
- Helps admins understand issues better

## Summary

**Current Status:** ❌ Cloudinary NOT configured
**Photo Uploads:** ❌ Not working
**What You Need:** Cloudinary account and credentials

**To Fix:**
1. Sign up at https://cloudinary.com/users/register/free
2. Get your Cloud Name, API Key, and API Secret
3. Add them to `server/.env`
4. Restart the server
5. Test photo upload

**Time Required:** ~5 minutes

Once configured, photo uploads will work automatically and you'll see:
- 📷 icon on suggestions with photos
- "View Evidence" button in admin panel
- Full-size image modal
- Images stored securely in the cloud

## Need Help?

If you encounter issues:
1. Check server logs: `tail -f server/logs/combined.log`
2. Verify credentials in Cloudinary dashboard
3. Make sure server restarted after adding credentials
4. Test with a small image (< 1MB) first
