import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';
// import { StreamsResolver } from './streams.resolver';
import { Stream, StreamSchema } from './schemas/stream.schema';
import { PayoutProcessor } from './processors/payout.processor';
import { MockKotaniModule } from '../mock-kotani/mock-kotani.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stream.name, schema: StreamSchema }]),
    BullModule.registerQueue({
      name: 'payouts',
    }),
    MockKotaniModule,
  ],
  providers: [StreamsService, /* StreamsResolver, */ PayoutProcessor],
  controllers: [StreamsController],
  exports: [StreamsService],
})
export class StreamsModule {} 