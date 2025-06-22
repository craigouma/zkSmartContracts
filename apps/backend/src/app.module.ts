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
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
        username: url.username || undefined,
      };
    } catch (error) {
      console.error('❌ Failed to parse REDIS_URL:', error.message);
      return null;
    }
  }

  if (process.env.REDIS_HOST) {
    return {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      username: process.env.REDIS_USER || undefined,
    };
  }

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
    ...(shouldEnableRedis() ? (() => {
      const redisConfig = getRedisConfig();
      if (redisConfig) {
        console.log('🔄 Redis config:', { 
          host: redisConfig.host, 
          port: redisConfig.port,
          hasPassword: !!redisConfig.password 
        });
        return [
          BullModule.forRoot({
            connection: {
              ...redisConfig,
              connectTimeout: 10000,
              retryDelayOnFailover: 100,
              maxRetriesPerRequest: 3,
            },
          })
        ];
      } else {
        console.log('⚠️ Redis configuration invalid, skipping Redis setup');
        return [];
      }
    })() : []),
    StreamsModule,
    ZkModule,
    MockKotaniModule,
  ],
})
export class AppModule {} 