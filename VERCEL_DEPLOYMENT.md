# 🚀 Vercel Frontend Deployment Guide

## 📋 Prerequisites

✅ Railway backend is deployed and working  
✅ Vercel CLI is installed (`npm install -g vercel`)  
✅ Have your Railway backend URL ready

## 🔍 Step 1: Get Your Railway Backend URL

### Method 1: Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Click on your **backend service**
3. Go to **Settings** → **Domains**
4. Copy the URL: `https://your-app-name-production.up.railway.app`

### Method 2: Test Your Backend
Try this URL format in your browser:
```
https://your-service-name.railway.app/health
```

You should see:
```json
{
  "status": "ok",
  "mongodbConnected": true,
  "redisEnabled": true
}
```

## 🚀 Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy from dashboard directory:**
   ```bash
   cd apps/dashboard
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Choose your account
   - Link to existing project: `N`
   - Project name: `zksalarystream-dashboard` (or any name)
   - Directory: `./` (current directory)

4. **Set Environment Variables:**
   ```bash
   vercel env add VITE_BACKEND_URL
   ```
   Enter your Railway URL: `https://your-app-name.railway.app`

5. **Redeploy with environment:**
   ```bash
   vercel --prod
   ```

### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select **"apps/dashboard"** as root directory
5. Set environment variable:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://your-railway-url.railway.app`
6. Click **Deploy**

## 🔧 Step 3: Configure Environment Variables

In Vercel dashboard or CLI, set:

```bash
VITE_BACKEND_URL=https://your-railway-backend.railway.app
```

**⚠️ Important:** No trailing slash!

## 🎯 Step 4: Verify Deployment

### Test Your Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Check browser console for any errors
3. Test API connections

### Test Backend Connection
In browser console:
```javascript
fetch('https://your-railway-url.railway.app/health')
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "status": "ok",
  "mongodbConnected": true,
  "redisEnabled": true
}
```

## 🔧 Troubleshooting

### CORS Errors
If you see CORS errors, update your Railway backend's `main.ts`:
```typescript
app.enableCors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true,
});
```

### Build Errors
```bash
# Local build test
npm run build

# Check for TypeScript errors
npm run type-check
```

### Environment Variables Not Working
- Restart Vercel deployment after adding env vars
- Make sure variable name starts with `VITE_`
- Check Vercel dashboard environment variables

## 🎉 Success!

Your zkSalaryStream should now be live:
- **Frontend**: `https://your-app.vercel.app`  
- **Backend**: `https://your-backend.railway.app`
- **Health Check**: `https://your-backend.railway.app/health`

## 📱 Next Steps

1. **Custom Domain** (optional): Add in Vercel dashboard
2. **Testing**: Create some streams and test functionality
3. **Monitoring**: Check Vercel analytics and Railway logs

Your zkSalaryStream platform is now fully deployed! 🚀 