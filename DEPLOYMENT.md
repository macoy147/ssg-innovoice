# Deployment Guide - Voice It, Shape It

## Overview
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js/Express)
- **Database**: MongoDB Atlas (already configured)

---

## Step 1: Push to GitHub

Make sure your code is pushed to a GitHub repository.

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `voiceit-shapeit-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = mongodb+srv://marcomontellano147_db_user:ssg20252026@ssg.kzd7kux.mongodb.net/voiceit-shapeit?retryWrites=true&w=majority
   ADMIN_PASSWORD = ssg2526admin
   CLIENT_URL = (add after deploying frontend)
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (takes 2-5 minutes)
8. Copy your backend URL (e.g., `https://voiceit-shapeit-api.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`

5. Add Environment Variable:
   ```
   VITE_API_URL = https://your-render-backend-url.onrender.com
   ```
   (Use the URL from Step 2)

6. Click **"Deploy"**
7. Wait for deployment (takes 1-2 minutes)
8. Copy your frontend URL (e.g., `https://voiceit-shapeit.vercel.app`)

---

## Step 4: Update Backend CORS

Go back to Render and update the `CLIENT_URL` environment variable:
```
CLIENT_URL = https://your-vercel-frontend-url.vercel.app
```

---

## Environment Variables Summary

### Backend (Render)
| Variable | Value |
|----------|-------|
| NODE_ENV | production |
| PORT | 10000 |
| MONGODB_URI | Your MongoDB connection string |
| ADMIN_PASSWORD | ssg2526admin |
| CLIENT_URL | Your Vercel frontend URL |

### Frontend (Vercel)
| Variable | Value |
|----------|-------|
| VITE_API_URL | Your Render backend URL |

---

## Testing After Deployment

1. Visit your Vercel URL
2. Submit a test suggestion
3. Track the suggestion using the tracking code
4. Test admin panel (password: ssg2526admin)

---

## Troubleshooting

### "Failed to submit suggestion"
- Check if backend is running on Render
- Verify VITE_API_URL is correct in Vercel
- Check browser console for CORS errors

### CORS Errors
- Ensure CLIENT_URL on Render matches your Vercel URL exactly
- Redeploy backend after updating CLIENT_URL

### Backend not starting
- Check Render logs for errors
- Verify MONGODB_URI is correct
- Ensure all environment variables are set

---

## Free Tier Limitations

### Render (Free)
- Server sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- 750 hours/month

### Vercel (Free)
- 100GB bandwidth/month
- Unlimited deployments
- No sleep/cold start issues

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Render
1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed

Remember to update CLIENT_URL if you use a custom domain!
