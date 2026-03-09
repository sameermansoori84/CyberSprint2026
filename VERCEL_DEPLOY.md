# Vercel Deployment Guide

Netlify se zyada simple hai Vercel. Follow these steps:

## Step 1: Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

## Step 2: Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Select `cybersprint-2026` folder as root directory

## Step 3: Configure Project
**Framework Preset:** Other
**Root Directory:** `cybersprint-2026`
**Build Command:** (leave empty)
**Output Directory:** (leave empty)

## Step 4: Environment Variables
Add these in Vercel dashboard:

```
MONGO_URI=mongodb+srv://cybersprint2026_db_user:Sameer%402604@cybersprint2026.kzfujbi.mongodb.net/CyberSprint2026?retryWrites=true&w=majority&appName=CyberSprint2026

ADMIN_PASSWORD=CyberSprintAdmin2026

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sameer.mansoori@bmusurat.ac.in
EMAIL_PASS=bgfqziyodzqsnjmz
EMAIL_FROM=CyberSprint 2026 <sameer.mansoori@bmusurat.ac.in>
```

## Step 5: Deploy
Click "Deploy"

## That's it!
Vercel will automatically:
- Install dependencies
- Deploy your app
- Give you a live URL

## Test URLs:
- `https://your-app.vercel.app/` - Home page
- `https://your-app.vercel.app/register.html` - Registration
- `https://your-app.vercel.app/admin.html` - Admin login
- `https://your-app.vercel.app/api/health` - API health (add this endpoint if needed)

## Why Vercel is Better:
- ✅ Automatic serverless functions
- ✅ No complex configuration
- ✅ Works out of the box
- ✅ Better error messages
- ✅ Faster deployment
