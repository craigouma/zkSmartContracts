import { Module } from '@nestjs/common';
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
      envFilePath: '.env.local',
    }),
        MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://localhost:27017/zksalarystream'
    ),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: true,
    //   playground: true,
    //   introspection: true,
    // }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    StreamsModule,
    ZkModule,
    MockKotaniModule,
  ],
})
export class AppModule {} 