import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stream, StreamDocument } from './schemas/stream.schema';
import { ethers } from 'ethers';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export interface CreateStreamDto {
  employee: string;
  amount: string;
  duration: number;
  zkProofHash: string;
  msisdn?: string;
  payoutCurrency?: string;
}

@Injectable()
export class StreamsService {
  private readonly logger = new Logger(StreamsService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(
    @InjectModel(Stream.name) private streamModel: Model<StreamDocument>,
    @Optional() @InjectQueue('payouts') private payoutQueue?: Queue,
  ) {
    this.initializeEthers();
  }

  private async initializeEthers() {
    try {
      // Connect to local Hardhat network
      this.provider = new ethers.JsonRpcProvider(
        process.env.ETHEREUM_RPC_URL || 'http://localhost:8545'
      );

      // Load contract details from deployment
      const deploymentPath = '../../../contracts/deployments/SalaryStream.json';
      try {
        const deployment = require(deploymentPath);
        this.contract = new ethers.Contract(
          deployment.contractAddress,
          deployment.abi,
          this.provider
        );
        this.logger.log(`Connected to SalaryStream contract at ${deployment.contractAddress}`);
      } catch (error) {
        this.logger.warn('Contract deployment not found. Deploy contracts first.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Ethers:', error.message);
    }
  }

  async createStream(createStreamDto: CreateStreamDto, employerAddress: string): Promise<Stream> {
    this.logger.log(`Creating stream for employee: ${createStreamDto.employee}`);

    try {
      // In a real app, you would interact with the smart contract here
      // For now, we'll simulate it and store in the database
      const streamId = await this.getNextStreamId();

      const stream = new this.streamModel({
        streamId,
        employee: createStreamDto.employee,
        employer: employerAddress,
        amount: createStreamDto.amount,
        startTime: new Date(),
        duration: createStreamDto.duration,
        zkProofHash: createStreamDto.zkProofHash,
        msisdn: createStreamDto.msisdn,
        payoutCurrency: createStreamDto.payoutCurrency || 'KES',
      });

      await stream.save();

      // Schedule automatic payouts if MSISDN is provided and Redis is available
      if (createStreamDto.msisdn && this.payoutQueue) {
        await this.scheduleAutomaticPayouts(stream);
      } else if (createStreamDto.msisdn && !this.payoutQueue) {
        this.logger.warn('MSISDN provided but Redis queue not available. Automatic payouts disabled.');
      }

      this.logger.log(`Stream created with ID: ${streamId}`);
      return stream;
    } catch (error) {
      this.logger.error('Failed to create stream:', error.message);
      throw error;
    }
  }

  async getStreamsByEmployee(employee: string): Promise<Stream[]> {
    return this.streamModel.find({ employee, active: true }).exec();
  }

  async getStreamsByEmployer(employer: string): Promise<Stream[]> {
    return this.streamModel.find({ employer, active: true }).exec();
  }

  async getStreamById(streamId: number): Promise<Stream> {
    return this.streamModel.findOne({ streamId }).exec();
  }

  async getAllStreams(): Promise<Stream[]> {
    return this.streamModel.find().exec();
  }

  async getAvailableAmount(streamId: number): Promise<string> {
    const stream = await this.getStreamById(streamId);
    if (!stream || !stream.active) {
      return '0';
    }

    const now = Date.now();
    const startTime = stream.startTime.getTime();
    const duration = stream.duration * 1000; // Convert to milliseconds

    if (now < startTime) {
      return '0';
    }

    const elapsed = now - startTime;
    if (elapsed >= duration) {
      return (BigInt(stream.amount) - BigInt(stream.withdrawn)).toString();
    }

    const totalAvailable = (BigInt(stream.amount) * BigInt(elapsed)) / BigInt(duration);
    return (totalAvailable - BigInt(stream.withdrawn)).toString();
  }

  async requestPayout(streamId: number, amount: string, msisdn: string, currency: string = 'KES'): Promise<any> {
    this.logger.log(`Requesting payout for stream ${streamId}`);

    const stream = await this.getStreamById(streamId);
    if (!stream || !stream.active) {
      throw new Error('Stream not found or inactive');
    }

    const availableAmount = await this.getAvailableAmount(streamId);
    if (BigInt(amount) > BigInt(availableAmount)) {
      throw new Error('Insufficient available amount');
    }

    if (!this.payoutQueue) {
      this.logger.warn('Redis queue not available. Processing payout immediately...');
      // Simulate immediate payout when Redis is not available
      const payoutReference = `immediate-${Date.now()}`;
      await this.updateStreamPayout(streamId, payoutReference, amount);
      return { payoutReference, status: 'completed', amount };
    }

    // Add payout job to queue
    const job = await this.payoutQueue.add('processPayout', {
      streamId,
      amount,
      msisdn,
      currency,
    });

    this.logger.log(`Payout job ${job.id} queued for stream ${streamId}`);
    return { jobId: job.id, status: 'queued' };
  }

  async updateStreamPayout(streamId: number, payoutReference: string, amount: string) {
    const stream = await this.streamModel.findOne({ streamId });
    if (stream) {
      stream.withdrawn = (BigInt(stream.withdrawn) + BigInt(amount)).toString();
      stream.payoutHistory.push(payoutReference);
      stream.totalPayouts += 1;
      stream.lastPayoutAt = new Date();
      await stream.save();
    }
  }

  private async getNextStreamId(): Promise<number> {
    const lastStream = await this.streamModel
      .findOne()
      .sort({ streamId: -1 })
      .exec();
    return lastStream ? lastStream.streamId + 1 : 1;
  }

  private async scheduleAutomaticPayouts(stream: Stream) {
    if (!this.payoutQueue) {
      this.logger.warn('Cannot schedule automatic payouts: Redis queue not available');
      return;
    }

    // Schedule daily payouts for the stream duration
    const dailyPayouts = Math.ceil(stream.duration / (24 * 60 * 60)); // Daily for stream duration
    
    for (let day = 1; day <= dailyPayouts; day++) {
      const delay = day * 24 * 60 * 60 * 1000; // Delay in milliseconds
      
      await this.payoutQueue.add(
        'automaticPayout',
        {
          streamId: stream.streamId,
          day,
        },
        {
          delay,
          jobId: `auto-payout-${stream.streamId}-${day}`,
        }
      );
    }

    this.logger.log(`Scheduled ${dailyPayouts} automatic payouts for stream ${stream.streamId}`);
  }

  // Additional methods for REST API compatibility
  async findAll(): Promise<Stream[]> {
    return this.getAllStreams();
  }

  async findOne(id: string): Promise<Stream> {
    return this.getStreamById(parseInt(id));
  }

  async createStreamSimple(createStreamDto: any): Promise<Stream> {
    return this.createStream(createStreamDto, createStreamDto.employer || '0x0');
  }

  async withdraw(id: string, amount?: string): Promise<any> {
    const streamId = parseInt(id);
    
    // If no amount specified, withdraw all available amount
    if (!amount) {
      const availableAmount = await this.getAvailableAmount(streamId);
      amount = availableAmount;
    }
    
    return this.requestPayout(streamId, amount, '+254700000000', 'KES');
  }

  async cancel(id: string): Promise<any> {
    const streamId = parseInt(id);
    const stream = await this.streamModel.findOne({ streamId });
    if (stream) {
      stream.active = false;
      await stream.save();
    }
    return { streamId, status: 'cancelled', timestamp: Date.now() };
  }
} 