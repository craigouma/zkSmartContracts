import * as snarkjs from "snarkjs";
import * as fs from "fs";
import * as path from "path";

export interface ProofInput {
  salary: string;
  salt: string;
  minSalary: string;
  maxSalary: string;
  commitment: string;
}

export interface ProofOutput {
  proof: any;
  publicSignals: string[];
}

export class ZKProofGenerator {
  private wasmPath: string;
  private zkeyPath: string;
  private vkeyPath: string;

  constructor(circuitName: string = "salaryRange") {
    this.wasmPath = path.join(__dirname, `${circuitName}.wasm`);
    this.zkeyPath = path.join(__dirname, `${circuitName}_0001.zkey`);
    this.vkeyPath = path.join(__dirname, "verification_key.json");
  }

  /**
   * Generate a zero-knowledge proof for salary range
   */
  async generateProof(input: ProofInput): Promise<ProofOutput> {
    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
          salary: input.salary,
          salt: input.salt,
          minSalary: input.minSalary,
          maxSalary: input.maxSalary,
          commitment: input.commitment,
        },
        this.wasmPath,
        this.zkeyPath
      );

      return { proof, publicSignals };
    } catch (error) {
      throw new Error(`Failed to generate proof: ${error.message}`);
    }
  }

  /**
   * Verify a zero-knowledge proof
   */
  async verifyProof(proof: any, publicSignals: string[]): Promise<boolean> {
    try {
      const vKey = JSON.parse(fs.readFileSync(this.vkeyPath, "utf8"));
      return await snarkjs.groth16.verify(vKey, publicSignals, proof);
    } catch (error) {
      throw new Error(`Failed to verify proof: ${error.message}`);
    }
  }

  /**
   * Generate commitment hash (simplified for demo)
   */
  generateCommitment(salary: string, salt: string): string {
    // In production, use proper Poseidon hash
    const salaryNum = BigInt(salary);
    const saltNum = BigInt(salt);
    const commitment = salaryNum + saltNum * BigInt(2);
    return commitment.toString();
  }

  /**
   * Generate random salt
   */
  generateSalt(): string {
    return Math.floor(Math.random() * 1000000).toString();
  }

  /**
   * Create proof input for salary range verification
   */
  createProofInput(
    salary: number,
    minSalary: number,
    maxSalary: number,
    salt?: string
  ): ProofInput {
    const saltValue = salt || this.generateSalt();
    const commitment = this.generateCommitment(salary.toString(), saltValue);

    return {
      salary: salary.toString(),
      salt: saltValue,
      minSalary: minSalary.toString(),
      maxSalary: maxSalary.toString(),
      commitment,
    };
  }
}

// Utility functions for testing and development
export async function generateSampleProof() {
  const generator = new ZKProofGenerator();
  
  // Example: Prove salary of 75000 is between 50000 and 100000
  const input = generator.createProofInput(75000, 50000, 100000);
  
  try {
    const { proof, publicSignals } = await generator.generateProof(input);
    const isValid = await generator.verifyProof(proof, publicSignals);
    
    console.log("Sample proof generated:", { proof, publicSignals, isValid });
    return { proof, publicSignals, isValid };
  } catch (error) {
    console.error("Failed to generate sample proof:", error.message);
    return null;
  }
}

// Export for use in other modules
export default ZKProofGenerator; 