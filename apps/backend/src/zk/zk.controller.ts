import { Controller, Post, Body } from '@nestjs/common';
import { ZkService } from './zk.service';

@Controller('api/zk')
export class ZkController {
  constructor(private readonly zkService: ZkService) {}

  @Post('verify')
  async verifyProof(@Body() verifyDto: any) {
    const { proof, publicSignals } = verifyDto;
    const isValid = await this.zkService.validateProof({ proof, publicSignals });
    const hash = this.zkService.generateProofHash({ proof, publicSignals });
    return { isValid, hash };
  }

  @Post('validate-format')
  async validateFormat(@Body() validateDto: any) {
    const { proof, publicSignals } = validateDto;
    const proofValid = this.zkService.validateProofFormat(proof);
    const signalsValid = this.zkService.validatePublicSignals(publicSignals);
    return { proofValid, signalsValid };
  }
} 