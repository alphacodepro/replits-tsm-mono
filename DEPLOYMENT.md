# Deployment Guide

This guide explains how to deploy your Tuition Management System with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon (already configured)

## Prerequisites

✅ Your Neon database is already connected and working
✅ All configuration files are ready

## Step 1: Deploy Backend to Render

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Name**: tuition-backend (or your choice)
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

3. **Add Environment Variables** in Render:
   - `DATABASE_URL`: Your Neon connection string (the one you added to Replit secrets)
   - `SESSION_SECRET`: Generate a random string (e.g., use a password generator)
   - `NODE_ENV`: production
   - `PORT`: 10000

4. **Deploy**: Click "Create Web Service"

5. **Copy Backend URL**: After deployment, copy your backend URL (e.g., `https://tuition-backend.onrender.com`)

## Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `cd client && npm install`

4. **Add Environment Variable**:
   - `VITE_API_URL`: Your Render backend URL (from Step 1)
     - Example: `https://tuition-backend.onrender.com`

5. **Deploy**: Click "Deploy"

6. **Copy Frontend URL**: After deployment, you'll get a URL like `https://your-app.vercel.app`

## Step 3: Update Backend CORS

1. Go back to **Render** dashboard
2. Add one more environment variable:
   - `FRONTEND_URL`: Your Vercel frontend URL
     - Example: `https://your-app.vercel.app`
3. Save and redeploy

## Step 4: Initialize Database (First Time Only)

The first time you deploy, you need to create the database tables:

1. Go to your Render dashboard
2. Click on your web service
3. Go to "Shell" tab
4. Run: `npm run db:push`
5. Create your first superadmin user (if not already created)

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try logging in with your superadmin credentials:
   - Username: `prasad`
   - Password: `1935`

## Important Notes

### Session Cookies
- Sessions work across domains because we've configured CORS with credentials
- The backend allows requests from your Vercel frontend domain

### Database Changes
- To update database schema: run `npm run db:push` in Render shell
- Your Neon database is shared between all environments

### Environment Variables Summary

**Render (Backend)**:
- `DATABASE_URL` - Your Neon connection string
- `SESSION_SECRET` - Random secret key
- `NODE_ENV` - production
- `PORT` - 10000
- `FRONTEND_URL` - Your Vercel URL

**Vercel (Frontend)**:
- `VITE_API_URL` - Your Render backend URL

## Troubleshooting

**CORS Errors**: Make sure `FRONTEND_URL` in Render matches your Vercel domain exactly

**Login Not Working**: Check that session cookies are enabled and CORS is properly configured

**Database Errors**: Verify `DATABASE_URL` is correct in Render environment variables

**Build Failures**: Check the build logs in Render/Vercel dashboard for specific errors
