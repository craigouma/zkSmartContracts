import { Module } from '@nestjs/common';
import { MockKotaniService } from './mock-kotani.service';
import { MockKotaniController } from './mock-kotani.controller';

@Module({
  providers: [MockKotaniService],
  controllers: [MockKotaniController],
  exports: [MockKotaniService],
})
export class MockKotaniModule {} 