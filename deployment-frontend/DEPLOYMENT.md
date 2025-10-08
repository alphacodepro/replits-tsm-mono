# Frontend Deployment Guide

## 🚀 Deploy to Vercel

### Step 1: Create GitHub Repository
1. Create a new repository on GitHub named: `tuition-frontend`
2. Copy all files from this folder to the repo
3. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial frontend setup"
git remote add origin https://github.com/YOUR_USERNAME/tuition-frontend.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import your `tuition-frontend` repository
4. Vercel will auto-detect it's a Vite project
5. **IMPORTANT**: Before deploying, add environment variable:
   - Click **"Environment Variables"**
   - Name: `VITE_API_URL`
   - Value: `https://your-backend.onrender.com` (your Render backend URL)
   - Check all environments: Production, Preview, Development
6. Click **"Deploy"**

### Step 3: Update Backend CORS (Important!)
After deployment, update your backend's FRONTEND_URL:
1. Go to Render Dashboard → Your Backend Service → Environment
2. Update `FRONTEND_URL` to your Vercel URL: `https://your-app.vercel.app`
3. Redeploy the backend

### ✅ Deployment Complete!
Your frontend will be live at: `https://your-app.vercel.app`

Login with the superadmin credentials you created on the backend!

## 🔧 Local Development

To run locally:
1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` to your backend URL
3. Run:
```bash
npm install
npm run dev
```

## 🐛 Troubleshooting

**Issue**: Login doesn't work, CORS errors
**Solution**: Make sure FRONTEND_URL on backend matches your Vercel URL exactly

**Issue**: Environment variable undefined
**Solution**: In Vercel, go to Settings → Environment Variables and ensure VITE_API_URL is set for all environments, then redeploy
