# Backend Deployment Guide

## 🚀 Deploy to Render

### Step 1: Create GitHub Repository
1. Create a new repository on GitHub named: `tuition-backend`
2. Copy all files from this folder to the repo
3. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial backend setup"
git remote add origin https://github.com/YOUR_USERNAME/tuition-backend.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select `tuition-backend` repository
5. Render will auto-detect `render.yaml` and configure everything automatically
6. Click **"Create Web Service"**

### Step 3: Update Environment Variables (if needed)
The render.yaml handles most config, but you may want to update:
- **FRONTEND_URL**: Set to your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
- **SESSION_SECRET**: Auto-generated, but you can customize if needed

### Step 4: Create Superadmin Account
After deployment, you need to manually create a superadmin:

1. Go to Render Dashboard → Your Service → Shell
2. Run this command:
```bash
node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const hashedPassword = await bcrypt.hash('YOUR_PASSWORD', 10);
  await pool.query(
    'INSERT INTO users (id, username, password, role, institute_name, is_active) VALUES (gen_random_uuid(), \$1, \$2, \$3, \$4, true)',
    ['admin', hashedPassword, 'superadmin', 'My Institute']
  );
  console.log('Superadmin created!');
  process.exit();
})();
"
```

Replace:
- `YOUR_PASSWORD` with your desired password
- `My Institute` with your institute name

### ✅ Deployment Complete!
Your backend will be live at: `https://your-app.onrender.com`

Test it by visiting: `https://your-app.onrender.com/api/auth/login`
You should see a connection error (expected, as it needs POST data).
