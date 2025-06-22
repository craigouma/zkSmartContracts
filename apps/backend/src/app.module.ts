import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { StreamsModule } from './streams/streams.module';
import { ZkModule } from './zk/zk.module';
import { MockKotaniModule } from './mock-kotani/mock-kotani.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.production', '.env'],
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://localhost:27017/zksalarystream',
      {
        retryAttempts: 5,
        retryDelay: 1000,
      }
    ),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: true,
    //   playground: true,
    //   introspection: true,
    // }),
    // Conditionally import BullModule only if Redis is available and configured
    ...(shouldEnableRedis() ? [
      BullModule.forRoot({
        connection: {
          host: process.env.REDIS_HOST || process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
          port: parseInt(process.env.REDIS_PORT || process.env.REDIS_URL?.split(':')[2] || '6379'),
          // Add connection timeout and retry settings
          connectTimeout: 10000,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        },
      })
    ] : []),
    StreamsModule,
    ZkModule,
    MockKotaniModule,
  ],
})
export class AppModule {}

// Helper function to determine if Redis should be enabled
function shouldEnableRedis(): boolean {
  // Enable Redis if explicitly configured or in development mode
  return !!(
    process.env.REDIS_HOST || 
    process.env.REDIS_URL || 
    process.env.NODE_ENV === 'development'
  );
} 