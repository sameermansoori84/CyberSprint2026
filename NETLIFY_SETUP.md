# Netlify Setup Instructions

## Current Issue
Deploy successful but pages not loading. Follow these steps:

## Step 1: Verify Netlify Settings

Go to **Site settings → Build & deploy → Build settings**

Set these values:
- **Build command:** (leave empty)
- **Publish directory:** `public`
- **Functions directory:** `netlify/functions`

## Step 2: Check Environment Variables

Go to **Site settings → Environment variables**

Add:
- `MONGO_URI` = your_mongodb_connection_string
- `NODE_VERSION` = 18

## Step 3: Test URLs

After deploy, test these URLs:
- `https://your-site.netlify.app/` - Should show home page
- `https://your-site.netlify.app/test.html` - Should show test page
- `https://your-site.netlify.app/register.html` - Should show registration
- `https://your-site.netlify.app/teacher.html` - Should show teacher portal
- `https://your-site.netlify.app/admin.html` - Should show admin panel

## Step 4: Check Browser Console

1. Open your site in browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for any errors (red text)
5. Share those errors if pages still not loading

## Step 5: Check Network Tab

1. In Developer Tools, go to Network tab
2. Refresh the page
3. Look for failed requests (red status codes like 404)
4. Check what files are failing to load

## Common Issues

### Issue: 404 on all pages
**Solution:** Make sure publish directory is set to `public` (not `dist` or `dist/public`)

### Issue: Images not loading
**Solution:** Check that image paths start with `/images/` in HTML files

### Issue: API not working
**Solution:** 
1. Verify `MONGO_URI` environment variable is set
2. Check Functions tab in Netlify dashboard
3. Look at function logs for errors

## Manual Deploy (Alternative)

If automatic deploy not working:

1. In Netlify dashboard, go to **Deploys** tab
2. Drag and drop the `public` folder directly
3. Wait for deploy to complete
4. Test the site

## Files to Push

Make sure these files are in your repository:
- `netlify.toml` - Netlify configuration
- `public/_redirects` - URL routing
- `public/index.html` - Home page
- `public/register.html` - Registration page
- `public/teacher.html` - Teacher portal
- `public/admin.html` - Admin panel
- `public/images/*` - All images
- `public/js/*` - All JavaScript files
- `netlify/functions/server.js` - API handler

## Next Steps

1. Push all changes to GitHub
2. Netlify will auto-deploy
3. Test all URLs listed in Step 3
4. If still not working, share:
   - Your Netlify site URL
   - Browser console errors
   - Network tab errors
