import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { StreamsService } from './streams.service';

@Controller('api/streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Post()
  async createStream(@Body() createStreamDto: any) {
    return this.streamsService.createStreamSimple(createStreamDto);
  }

  @Get()
  async getAllStreams() {
    return this.streamsService.findAll();
  }

  @Get(':id')
  async getStream(@Param('id') id: string) {
    return this.streamsService.findOne(id);
  }

  @Put(':id/withdraw')
  async withdrawFromStream(@Param('id') id: string, @Body() withdrawDto?: any) {
    const amount = withdrawDto?.amount;
    return this.streamsService.withdraw(id, amount);
  }

  @Delete(':id')
  async cancelStream(@Param('id') id: string) {
    return this.streamsService.cancel(id);
  }

  @Get(':id/available')
  async getAvailableAmount(@Param('id') id: string) {
    return this.streamsService.getAvailableAmount(parseInt(id));
  }
} 