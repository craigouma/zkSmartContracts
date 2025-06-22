# 🚄 Railway Environment Setup

## 🚨 CRITICAL: MongoDB Connection Issue

**Your Railway deployment is failing because it's not picking up the MongoDB Atlas URI.**

The error `connect ECONNREFUSED ::1:27017` means it's trying to connect to localhost instead of Atlas.

## 🔧 IMMEDIATE FIX REQUIRED

### 1. Set Environment Variables in Railway Dashboard

**Go to your Railway project → Variables tab and add EXACTLY these:**

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/zksalarystream?retryWrites=true&w=majority&appName=zksalary
REDIS_URL=redis://default:VVZFjOnafhfIzblGCNTYlKrISoMyQpMz@redis.railway.internal:6379
```

### 2. Alternative Database Variable Names

If `MONGODB_URI` doesn't work, Railway might expect different names. Try adding ALL of these:

```bash
MONGODB_URI=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/zksalarystream?retryWrites=true&w=majority&appName=zksalary
MONGO_URL=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/zksalarystream?retryWrites=true&w=majority&appName=zksalary
DATABASE_URL=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/zksalarystream?retryWrites=true&w=majority&appName=zksalary
```

### 3. Validate Environment Variables

Run this locally to test your environment:

```bash
node validate-env.js
```

Expected output:
```
🔍 Environment Variables Validation

📋 Required Variables:
  ✅ NODE_ENV: production
  ✅ PORT: 3000

🗄️  Database Variables (need at least one):
  ✅ MONGODB_URI: Atlas URI
  
🔄 Redis Variables (optional):
  ✅ REDIS_URL: SET

📊 Summary:
  Environment: production
  Database: Configured
  Redis: Enabled

🎉 All required environment variables are set!
```

## 🔍 Troubleshooting Steps

### Step 1: Check Railway Logs
1. Go to Railway Dashboard
2. Click on your service
3. Go to "Deployments" tab
4. Click on latest deployment
5. Check logs for this line:
   ```
   🔍 MongoDB URI source: { MONGODB_URI: true, usingUri: 'Atlas', NODE_ENV: 'production' }
   ```

### Step 2: If Still Getting `::1:27017` Error
This means Railway is NOT reading your environment variables. Try:

1. **Delete and recreate** the `MONGODB_URI` variable
2. **Copy-paste exactly** without extra spaces
3. **Save and redeploy**

### Step 3: Check MongoDB Atlas
Ensure your MongoDB Atlas allows Railway connections:
1. Go to MongoDB Atlas Dashboard
2. Network Access → IP Access List
3. Should have `0.0.0.0/0` (Allow access from anywhere)

## 📋 Complete Railway Variables List

```bash
# Core Application
NODE_ENV=production
PORT=3000

# Database (try all three)
MONGODB_URI=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/zksalarystream?retryWrites=true&w=majority&appName=zksalary
MONGO_URL=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/zksalarystream?retryWrites=true&w=majority&appName=zksalary
DATABASE_URL=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/zksalarystream?retryWrites=true&w=majority&appName=zksalary

# Redis
REDIS_URL=redis://default:VVZFjOnafhfIzblGCNTYlKrISoMyQpMz@redis.railway.internal:6379
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=VVZFjOnafhfIzblGCNTYlKrISoMyQpMz
REDISUSER=default
```

## 🎯 What Should Happen

After setting variables correctly:

1. **Railway redeploys automatically**
2. **Logs show**: `🔍 MongoDB URI source: { MONGODB_URI: true, usingUri: 'Atlas' }`
3. **Health check works**: `https://your-app.railway.app/health`
4. **Response shows**:
   ```json
   {
     "status": "ok",
     "mongodbConnected": true,
     "redisEnabled": true
   }
   ```

## 🆘 Still Not Working?

If you're still getting the `::1:27017` error:

1. **Share Railway deployment logs** with me
2. **Screenshot** of your Railway environment variables
3. **Test** the validation script: `node validate-env.js`

The issue is 100% that Railway is not reading your `MONGODB_URI` environment variable correctly.

## Required Environment Variables for Production

Copy and paste these environment variables into your Railway project dashboard:

### Core Application Settings
```bash
NODE_ENV=production
PORT=3000
```

### Redis Configuration (From Your Railway Redis Service)
```bash
# Primary Redis URL (use this one)
REDIS_URL=redis://default:VVZFjOnafhfIzblGCNTYlKrISoMyQpMz@redis.railway.internal:6379

# Alternative format (backup)
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=VVZFjOnafhfIzblGCNTYlKrISoMyQpMz
REDISUSER=default
```

### Blockchain Network (Optional - for production use)
```bash
# For testnet deployment
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# For mainnet deployment (careful!)
# ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

## 📋 Setup Steps

### 1. Set Environment Variables in Railway
1. Go to your Railway project dashboard
2. Navigate to the **Variables** tab
3. Add each environment variable listed above
4. Railway will automatically redeploy when you save

### 2. Connect Redis Service
✅ **Already Done!** Your Redis service is configured with:
- **Internal URL**: `redis.railway.internal:6379`
- **Public URL**: `interchange.proxy.rlwy.net:28333`
- **Password**: `VVZFjOnafhfIzblGCNTYlKrISoMyQpMz`

### 3. Verify Deployment
After setting the environment variables:
1. Railway will trigger automatic deployment
2. Check deployment logs for any errors
3. Test the health endpoint: `https://your-app.railway.app/health`

### 4. Expected Health Response
```json
{
    "status": "ok",
    "timestamp": "2025-06-22T22:00:00.000Z",
    "env": "production",
    "mongodbConnected": true,
    "redisEnabled": true
}
```

## 🔍 Troubleshooting

### If Redis Connection Fails
- ✅ Application will still work (graceful degradation)
- ✅ Payouts will process immediately instead of being queued
- ✅ Logs will show "Redis queue not available" warnings

### If MongoDB Connection Fails
- ❌ Application will retry connection 5 times
- ❌ Check MongoDB Atlas IP whitelist (should allow all: `0.0.0.0/0`)
- ❌ Verify connection string format

### Check Logs
```bash
# Railway CLI (if installed)
railway logs

# Or check in Railway dashboard under "Deployments" tab
```

## 🎉 What's New

Your application now supports:
- ✅ **Redis Optional**: Works with or without Redis
- ✅ **Health Monitoring**: `/health` endpoint for status checks
- ✅ **Production Ready**: Proper error handling and logging
- ✅ **Auto-Retry**: MongoDB connection retries
- ✅ **Graceful Degradation**: Continues working if services fail

## 🔗 Useful Links

- **Health Check**: `https://your-app.railway.app/health`
- **API Docs**: `https://your-app.railway.app/api`
- **Railway Dashboard**: Log in to check deployment status 