import { Controller, Post, Get, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { MockKotaniService, FXQuote, PayoutReceipt } from './mock-kotani.service';

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class GetQuoteDto {
  @IsString()
  @IsNotEmpty()
  fiat: string;

  @IsString()
  @IsNotEmpty()
  amount: string;
}

class CreatePayoutDto {
  @IsString()
  @IsNotEmpty()
  msisdn: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  quoteId?: string;
}

@Controller('kotani')
export class MockKotaniController {
  constructor(private readonly mockKotaniService: MockKotaniService) {}

  @Post('quote')
  async getQuote(@Body() getQuoteDto: GetQuoteDto): Promise<FXQuote> {
    try {
      return await this.mockKotaniService.getQuote(
        getQuoteDto.fiat,
        getQuoteDto.amount
      );
    } catch (error) {
      throw new HttpException(
        `Failed to get quote: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('payout')
  async createPayout(@Body() createPayoutDto: CreatePayoutDto): Promise<PayoutReceipt> {
    try {
      return await this.mockKotaniService.createPayout(
        createPayoutDto.msisdn,
        createPayoutDto.amount,
        createPayoutDto.currency,
        createPayoutDto.quoteId
      );
    } catch (error) {
      throw new HttpException(
        `Failed to create payout: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('payout/:reference/status')
  async getPayoutStatus(@Param('reference') reference: string): Promise<PayoutReceipt> {
    try {
      return await this.mockKotaniService.getPayoutStatus(reference);
    } catch (error) {
      throw new HttpException(
        `Failed to get payout status: ${error.message}`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get('currencies')
  getSupportedCurrencies(): string[] {
    return this.mockKotaniService.getSupportedCurrencies();
  }

  @Get('quote/:quoteId/validate')
  validateQuote(@Param('quoteId') quoteId: string): { valid: boolean } {
    return {
      valid: this.mockKotaniService.validateQuote(quoteId)
    };
  }
} 