# Deployment Guide - CyberSprint 2026

## Netlify Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

### Step 2: Connect to Netlify
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository

### Step 3: Configure Build Settings
- **Build command:** `npm install && npm run build`
- **Publish directory:** `public`
- **Functions directory:** `netlify/functions`

### Step 4: Add Environment Variables
Go to Site settings → Environment variables and add:
- `MONGO_URI` = your MongoDB connection string
- `NODE_VERSION` = 18

### Step 5: Deploy
Click "Deploy site"

## Important Files for Netlify

- `netlify.toml` - Build and redirect configuration
- `public/_redirects` - URL routing rules
- `netlify/functions/server.js` - Serverless API handler

## Troubleshooting

### Images not loading
- Ensure images are in `public/images/` folder
- Check that paths start with `/images/` (absolute paths)

### Pages showing 404
- Check `_redirects` file in public folder
- Verify `netlify.toml` redirect rules

### API not working
- Check environment variables are set
- Verify MongoDB connection string
- Check function logs in Netlify dashboard

## Local Testing

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run locally
netlify dev

# Test functions
netlify functions:serve
```

## After Deployment

1. Test all pages:
   - `/` (home)
   - `/register.html`
   - `/teacher.html`
   - `/admin.html`

2. Test API endpoints:
   - `/api/students`
   - `/api/attendance`
   - `/api/auth`
   - `/api/admin`

3. Verify images load correctly

## Custom Domain (Optional)

1. Go to Domain settings in Netlify
2. Add your custom domain
3. Update DNS records as instructed
