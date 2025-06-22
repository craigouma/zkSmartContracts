# 🚀 Free Deployment Guide for zkSalaryStream

## Architecture Overview
```
Frontend (Vercel) → Backend (Railway) → Database (MongoDB Atlas) → Blockchain (Alchemy)
```

## Step 1: Frontend Deployment (Vercel)

### Setup
1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   cd apps/dashboard
   vercel
   ```

2. **Environment Variables in Vercel**:
   ```
   VITE_BACKEND_URL=https://your-backend.railway.app
   ```

3. **Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Custom Domain (Optional)
- Add your domain in Vercel dashboard
- Update DNS records as instructed

## Step 2: Backend Deployment (Railway)

### Setup
1. **Connect GitHub to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select your zkSalaryStream repo

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_atlas_connection_string
   REDIS_URL=redis://redis:6379
   ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
   ```

3. **Railway.json Configuration** (Already included in repo):
   ```json
   {
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "Dockerfile"
     },
     "deploy": {
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

### Redis Setup on Railway
1. Add Redis service in Railway dashboard
2. Use internal URL: `redis://redis:6379`

## Step 3: Database (Already Done!)
✅ You're already using MongoDB Atlas free tier

## Step 4: Blockchain Network (Alchemy)

### Setup Alchemy
1. **Create Account**: [alchemy.com](https://alchemy.com)
2. **Create App**: Select Ethereum → Mainnet/Sepolia
3. **Get API Key**: Copy the HTTPS URL
4. **Update Environment**:
   ```
   ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   ```

## Step 5: Contract Deployment

### Deploy to Sepolia Testnet (Free)
```bash
# Update hardhat.config.ts
npm run deploy --network=sepolia

# Or deploy to Polygon Mumbai (cheaper gas)
npm run deploy --network=mumbai
```

### Environment Variables
```bash
# Backend
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0x_deployed_contract_address

# Frontend  
VITE_ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_CONTRACT_ADDRESS=0x_deployed_contract_address
```

## 🆓 Complete Free Stack

| Component | Platform | Free Tier | Limits |
|-----------|----------|-----------|---------|
| **Frontend** | Vercel | Unlimited | 100GB bandwidth |
| **Backend** | Railway | $5 credit | ~$5/month usage |
| **Database** | MongoDB Atlas | Free | 512MB storage |
| **Blockchain** | Alchemy | Free | 300M requests/month |
| **Redis** | Railway Redis | Included | With backend service |

## 🔧 Deployment Commands

### Quick Deploy Script
```bash
#!/bin/bash

echo "🚀 Deploying zkSalaryStream to production..."

# 1. Deploy frontend to Vercel
echo "📱 Deploying frontend..."
cd apps/dashboard
vercel --prod

# 2. Backend deploys automatically via Railway GitHub integration

# 3. Update contract addresses in environment variables
echo "⛓️  Don't forget to update contract addresses!"

echo "✅ Deployment complete!"
echo "Frontend: https://your-app.vercel.app"
echo "Backend: https://your-backend.railway.app"
```

## 🔍 Monitoring & Logs

### Railway Monitoring
- View logs in Railway dashboard
- Set up alerts for errors
- Monitor resource usage

### Vercel Analytics
- Enable Web Analytics in Vercel dashboard
- Monitor performance and usage

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use platform-specific environment variable settings
- Rotate API keys regularly

### CORS Configuration
```typescript
// Update backend for production
app.enableCors({
  origin: ['https://your-app.vercel.app'],
  credentials: true,
});
```

## 💰 Cost Estimation

**Monthly Costs (Free Tier)**:
- Vercel: $0
- Railway: ~$5 (from free credit)
- MongoDB Atlas: $0
- Alchemy: $0
- **Total: $0-5/month**

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Update backend CORS configuration
2. **Environment Variables**: Double-check all required vars are set
3. **Build Failures**: Check Node.js version compatibility
4. **Database Connection**: Verify MongoDB Atlas IP whitelist

### Health Check Endpoints
```typescript
// Add to backend
@Get('health')
healthCheck() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

---

**🎉 Your zkSalaryStream platform will be live at:**
- **Dashboard**: `https://your-app.vercel.app`
- **API**: `https://your-backend.railway.app`
- **Health**: `https://your-backend.railway.app/health` 