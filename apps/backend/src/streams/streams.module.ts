import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';
// import { StreamsResolver } from './streams.resolver';
import { Stream, StreamSchema } from './schemas/stream.schema';
import { PayoutProcessor } from './processors/payout.processor';
import { MockKotaniModule } from '../mock-kotani/mock-kotani.module';

// Helper function to determine if Redis should be enabled
function shouldEnableRedis(): boolean {
  return !!(
    process.env.REDIS_HOST || 
    process.env.REDIS_URL || 
    process.env.NODE_ENV === 'development'
  );
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stream.name, schema: StreamSchema }]),
    // Conditionally register BullModule queue only if Redis is available
    ...(shouldEnableRedis() ? [
      BullModule.registerQueue({
        name: 'payouts',
      })
    ] : []),
    MockKotaniModule,
  ],
  providers: [
    StreamsService, 
    /* StreamsResolver, */ 
    // Only provide PayoutProcessor if Redis is available
    ...(shouldEnableRedis() ? [PayoutProcessor] : [])
  ],
  controllers: [StreamsController],
  exports: [StreamsService],
})
export class StreamsModule {} 