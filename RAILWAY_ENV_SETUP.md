# 🚄 Railway Environment Setup

## Required Environment Variables for Production

Copy and paste these environment variables into your Railway project dashboard:

### Core Application Settings
```bash
NODE_ENV=production
PORT=3000
```

### MongoDB Atlas (Keep your existing URI)
```bash
MONGODB_URI=mongodb+srv://craigcarlos95:z0JGFZzGFWhHsqbR@zksalary.ghk4dmi.mongodb.net/zksalarystream?retryWrites=true&w=majority&appName=zksalary
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