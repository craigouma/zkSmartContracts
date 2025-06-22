import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('payout')
export class PayoutProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log('Processing payout job:', job.data);
    
    // Mock payout processing
    const { streamId, employeeAddress, amount } = job.data;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Processed payout for stream ${streamId}: ${amount} to ${employeeAddress}`);
    
    return {
      status: 'completed',
      streamId,
      employeeAddress,
      amount,
      processedAt: new Date()
    };
  }
} 