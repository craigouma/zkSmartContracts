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
MONGODB_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
REDIS_URL=<YOUR_RAILWAY_REDIS_URL>
```

### 2. Alternative Database Variable Names

If `MONGODB_URI` doesn't work, Railway might expect different names. Try adding ALL of these:

```bash
MONGODB_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
MONGO_URL=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
DATABASE_URL=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
```

### 3. Current Issues Analysis

Based on your error logs, there are TWO problems:

#### Problem 1: Redis Port Parsing Error
```
RangeError [ERR_SOCKET_BAD_PORT]: Port should be >= 0 and < 65536. Received type number (NaN).
```
This means the Redis URL parsing is failing.

#### Problem 2: MongoDB Atlas IP Whitelist
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster
```
This means Railway's IP is not allowed in your MongoDB Atlas.

## 🔧 FIXES NEEDED

### Fix 1: MongoDB Atlas IP Whitelist
1. Go to MongoDB Atlas Dashboard
2. Security → Network Access
3. Click "Add IP Address"
4. Add `0.0.0.0/0` (Allow access from anywhere)
5. Save changes

### Fix 2: Redis URL Format
In Railway, set ONLY this Redis variable:
```bash
REDIS_URL=redis://default:YOUR_REDIS_PASSWORD@redis.railway.internal:6379
```

Remove these variables if you have them:
- REDIS_HOST
- REDIS_PORT
- REDIS_PASSWORD
- REDISUSER

### Fix 3: MongoDB Connection String Format
Make sure your MongoDB URI is exactly:
```bash
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

## 🎯 What Should Happen

After these fixes:

1. **Railway redeploys automatically**
2. **Logs show**: `🔍 MongoDB URI source: { MONGODB_URI: true, usingUri: 'Atlas' }`
3. **No Redis port errors**
4. **Health check works**: `https://your-app.railway.app/health`

## 🆘 Still Not Working?

1. **Check Railway deployment logs** for the debug line: `🔍 MongoDB URI source:`
2. **Verify MongoDB Atlas** allows `0.0.0.0/0` access
3. **Test Redis connection** by temporarily disabling Redis (remove REDIS_URL)

The issue is Railway environment variable configuration combined with MongoDB Atlas network restrictions.

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

# Database (use your actual MongoDB Atlas URI)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Redis (use your actual Railway Redis credentials)
REDIS_URL=redis://default:password@redis.railway.internal:6379
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
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
2. **Screenshot** of your Railway environment variables (hide the values!)
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
# Primary Redis URL (use your actual Railway Redis URL)
REDIS_URL=redis://default:YOUR_REDIS_PASSWORD@redis.railway.internal:6379

# Alternative format (backup)
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
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
- **Password**: `[Use your actual Redis password from Railway dashboard]`

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