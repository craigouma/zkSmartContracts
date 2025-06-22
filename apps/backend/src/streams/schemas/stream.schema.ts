import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StreamDocument = Stream & Document;

@Schema({ timestamps: true })
export class Stream {
  @Prop({ required: true })
  streamId: number;

  @Prop({ required: true })
  employee: string;

  @Prop({ required: true })
  employer: string;

  @Prop({ required: true })
  amount: string; // ETH amount in wei

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  duration: number; // Duration in seconds

  @Prop({ default: '0' })
  withdrawn: string; // Amount withdrawn in wei

  @Prop({ default: true })
  active: boolean;

  @Prop({ required: true })
  zkProofHash: string;

  @Prop()
  contractAddress: string;

  @Prop()
  transactionHash: string;

  @Prop()
  blockNumber: number;

  // Payout related fields
  @Prop()
  msisdn: string; // Mobile number for payouts

  @Prop({ default: 'KES' })
  payoutCurrency: string;

  @Prop([String])
  payoutHistory: string[]; // Array of payout reference IDs

  @Prop({ default: 0 })
  totalPayouts: number; // Total number of payouts made

  @Prop()
  lastPayoutAt: Date;
}

export const StreamSchema = SchemaFactory.createForClass(Stream); 