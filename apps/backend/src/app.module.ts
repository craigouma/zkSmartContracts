import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { StreamsModule } from './streams/streams.module';
import { ZkModule } from './zk/zk.module';
import { MockKotaniModule } from './mock-kotani/mock-kotani.module';

// Helper function to determine if Redis should be enabled
function shouldEnableRedis(): boolean {
  // Enable Redis if explicitly configured or in development mode
  return !!(
    process.env.REDIS_HOST || 
    process.env.REDIS_URL || 
    process.env.NODE_ENV === 'development'
  );
}

// Helper function to parse Redis configuration
function getRedisConfig() {
  // In production, be more strict about Redis requirements
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL && !process.env.REDIS_PUBLIC_URL) {
    console.log('⚠️ Production mode but no REDIS_URL or REDIS_PUBLIC_URL set, disabling Redis');
    return null;
  }

  // Try REDIS_URL first, then fall back to REDIS_PUBLIC_URL
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_PUBLIC_URL;
  
  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
        username: url.username || undefined,
      };
      
      console.log('🔄 Redis config:', { 
        host: config.host, 
        port: config.port,
        hasPassword: !!config.password,
        source: process.env.REDIS_URL ? 'REDIS_URL' : 'REDIS_PUBLIC_URL',
        isInternal: config.host.includes('railway.internal')
      });
      
      // Warn if using internal URL that might fail
      if (config.host.includes('railway.internal')) {
        console.log('⚠️ Using internal Redis URL. If connection fails, try setting REDIS_URL to REDIS_PUBLIC_URL value');
      }
      
      return config;
    } catch (error) {
      console.error('❌ Failed to parse Redis URL:', error.message);
      console.error('❌ Redis URL value:', redisUrl);
      return null;
    }
  }

  if (process.env.REDIS_HOST) {
    const config = {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      username: process.env.REDIS_USER || undefined,
    };
    
    console.log('🔄 Redis config:', { 
      host: config.host, 
      port: config.port,
      hasPassword: !!config.password,
      source: 'REDIS_HOST/PORT' 
    });
    
    return config;
  }

  console.log('⚠️ No Redis configuration found, Redis will be disabled');
  return null;
}

// Helper function to get MongoDB URI
function getMongoDbUri(): string {
  // Try multiple environment variable names that Railway might use
  const mongoUri = process.env.MONGODB_URI || 
                   process.env.MONGO_URL || 
                   process.env.DATABASE_URL ||
                   'mongodb://localhost:27017/zksalarystream';
  
  console.log('🔍 MongoDB URI source:', {
    MONGODB_URI: !!process.env.MONGODB_URI,
    MONGO_URL: !!process.env.MONGO_URL,
    DATABASE_URL: !!process.env.DATABASE_URL,
    usingUri: mongoUri.includes('mongodb+srv') ? 'Atlas' : 'Local',
    NODE_ENV: process.env.NODE_ENV
  });
  
  return mongoUri;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.production', '.env'],
      expandVariables: true,
    }),
    MongooseModule.forRoot(getMongoDbUri(), {
      retryAttempts: 5,
      retryDelay: 1000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: true,
    //   playground: true,
    //   introspection: true,
    // }),
    // Conditionally import BullModule only if Redis is available and configured
    ...((() => {
      if (!shouldEnableRedis()) {
        console.log('🚫 Redis disabled by configuration');
        return [];
      }
      
      const redisConfig = getRedisConfig();
      if (!redisConfig) {
        console.log('🚫 Redis configuration invalid, skipping Redis setup');
        return [];
      }
      
      try {
        return [
          BullModule.forRoot({
            connection: {
              ...redisConfig,
              connectTimeout: 10000,
              retryDelayOnFailover: 100,
              lazyConnect: true, // Don't connect immediately
              maxRetriesPerRequest: null, // Allow unlimited retries
            },
          })
        ];
      } catch (error) {
        console.error('❌ Failed to configure Redis BullModule:', error.message);
        return [];
      }
    })()),
    StreamsModule,
    ZkModule,
    MockKotaniModule,
  ],
})
export class AppModule {} 