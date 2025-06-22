import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS for frontend
    app.enableCors({
      origin: [
        'http://localhost:3000', 
        'http://localhost:5173', 
        'https://zksmartcontracts-dashboard.vercel.app',
        'https://zksmartcontracts-dashboard-mhrn0aghd.vercel.app',
        /^https:\/\/zksmartcontracts-dashboard.*\.vercel\.app$/
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    // Global prefix for REST APIs
    app.setGlobalPrefix('api');
    
    // Add health check endpoint
    app.getHttpAdapter().get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        mongodbConnected: !!process.env.MONGODB_URI,
        redisEnabled: !!(process.env.REDIS_HOST || process.env.REDIS_URL)
      });
    });
    
    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    
    console.log(`🚀 Backend running on http://localhost:${port}`);
    console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
    console.log(`🔍 Health Check: http://localhost:${port}/health`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Local fallback'}`);
    console.log(`🔄 Redis: ${process.env.REDIS_HOST || process.env.REDIS_URL ? 'Enabled' : 'Disabled'}`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap(); 