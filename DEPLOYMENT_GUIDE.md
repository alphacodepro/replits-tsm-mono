# 🚀 Tuition Management System - Deployment Guide

## 📦 Two Separate Deployment Repos

This project is split into two deployment-ready repositories:

### 1. **Backend** (`deployment-backend/`)
- Express.js API server
- PostgreSQL database (Neon)
- Session management
- Authentication & authorization
- **Deploy to**: Render.com
- **Files**: All in `deployment-backend/` folder

### 2. **Frontend** (`deployment-frontend/`)
- React + Vite application
- Material Design UI
- TanStack Query for state management
- **Deploy to**: Vercel
- **Files**: All in `deployment-frontend/` folder

---

## 🎯 Quick Start - Deploy Both

### Step 1: Backend Deployment (Deploy First!)

1. **Create GitHub repo**: `tuition-backend`
2. **Copy files**: Everything from `deployment-backend/` folder
3. **Push to GitHub**
4. **Deploy to Render**: 
   - Go to https://render.com
   - Create new Web Service
   - Connect to `tuition-backend` repo
   - Render auto-detects `render.yaml` and configures everything
5. **Note the URL**: `https://your-backend.onrender.com`

📖 **Detailed instructions**: See `deployment-backend/DEPLOYMENT.md`

---

### Step 2: Frontend Deployment (Deploy Second!)

1. **Create GitHub repo**: `tuition-frontend`
2. **Copy files**: Everything from `deployment-frontend/` folder  
3. **Push to GitHub**
4. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Import `tuition-frontend` repo
   - **IMPORTANT**: Set environment variable:
     - Name: `VITE_API_URL`
     - Value: `https://your-backend.onrender.com` (from Step 1)
5. **Note the URL**: `https://your-frontend.vercel.app`

📖 **Detailed instructions**: See `deployment-frontend/DEPLOYMENT.md`

---

### Step 3: Connect Frontend & Backend

1. **Update Backend CORS**:
   - Go to Render → Your backend service → Environment
   - Update `FRONTEND_URL` to: `https://your-frontend.vercel.app`
   - Redeploy backend

2. **Create Superadmin Account**:
   - See `deployment-backend/DEPLOYMENT.md` for exact command
   - Run in Render Shell

---

## ✅ You're Done!

Your app is now live:
- **Backend API**: `https://your-backend.onrender.com`
- **Frontend App**: `https://your-frontend.vercel.app`

Login with your superadmin credentials!

---

## 📂 Folder Structure

```
project-root/
├── deployment-backend/        ← Backend repo (Deploy to Render)
│   ├── server/               ← API routes, auth, storage
│   ├── shared/               ← Shared schemas
│   ├── package.json          ← Backend dependencies only
│   ├── render.yaml           ← Render config
│   └── DEPLOYMENT.md         ← Backend deployment guide
│
├── deployment-frontend/       ← Frontend repo (Deploy to Vercel)
│   ├── src/                  ← React components, pages
│   ├── shared/               ← Shared schemas
│   ├── package.json          ← Frontend dependencies only
│   ├── vite.config.ts        ← Vite config
│   └── DEPLOYMENT.md         ← Frontend deployment guide
│
└── DEPLOYMENT_GUIDE.md       ← This file
```

---

## 🐛 Common Issues

**CORS Errors**: Make sure `FRONTEND_URL` on backend exactly matches your Vercel URL

**Login Fails**: Check that `VITE_API_URL` environment variable is set in Vercel

**Environment Variable Undefined**: 
- Vercel: Settings → Environment Variables → Set for all environments → Redeploy
- Render: Environment tab → Update variables → Redeploy

---

## 🔄 Making Updates

**Backend Changes**:
1. Update code in `deployment-backend/` folder
2. Push to `tuition-backend` GitHub repo
3. Render auto-deploys

**Frontend Changes**:
1. Update code in `deployment-frontend/` folder
2. Push to `tuition-frontend` GitHub repo
3. Vercel auto-deploys

---

## 💡 Why Two Repos?

The original project was a monorepo designed for Replit. Splitting it into two repos:
- ✅ Makes deployment cleaner and simpler
- ✅ Works perfectly with Vercel and Render auto-detection
- ✅ Fixes environment variable issues
- ✅ Easier to maintain and update
- ✅ Independent scaling for frontend and backend
