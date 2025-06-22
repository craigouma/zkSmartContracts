import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { SalaryStream } from "../typechain-types";

describe("SalaryStream", function () {
  async function deployContractFixture() {
    const [owner, employer, employee, otherUser] = await ethers.getSigners();
    
    const SalaryStream = await ethers.getContractFactory("SalaryStream");
    const contract = await SalaryStream.deploy();
    
    return { contract, owner, employer, employee, otherUser };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.nextStreamId()).to.equal(1);
    });
  });

  describe("Stream Creation", function () {
    it("Should create a stream with valid parameters", async function () {
      const { contract, employer, employee } = await loadFixture(deployContractFixture);
      
      const duration = 30 * 24 * 60 * 60; // 30 days
      const amount = ethers.parseEther("1.0");
      const zkProofHash = "0x1234567890abcdef";

      const tx = await contract.connect(employer).createStream(
        employee.address,
        duration,
        zkProofHash,
        { value: amount }
      );

      await expect(tx)
        .to.emit(contract, "StreamCreated")
        .withArgs(1, employee.address, employer.address, amount, duration, zkProofHash);

      const stream = await contract.getStreamDetails(1);
      expect(stream.employee).to.equal(employee.address);
      expect(stream.employer).to.equal(employer.address);
      expect(stream.amount).to.equal(amount);
      expect(stream.duration).to.equal(duration);
      expect(stream.active).to.be.true;
      expect(stream.zkProofHash).to.equal(zkProofHash);
    });

    it("Should revert with invalid employee address", async function () {
      const { contract, employer } = await loadFixture(deployContractFixture);
      
      const duration = 30 * 24 * 60 * 60;
      const amount = ethers.parseEther("1.0");
      const zkProofHash = "0x1234567890abcdef";

      await expect(
        contract.connect(employer).createStream(
          ethers.ZeroAddress,
          duration,
          zkProofHash,
          { value: amount }
        )
      ).to.be.revertedWith("Invalid employee address");
    });

    it("Should revert when streaming to yourself", async function () {
      const { contract, employer } = await loadFixture(deployContractFixture);
      
      const duration = 30 * 24 * 60 * 60;
      const amount = ethers.parseEther("1.0");
      const zkProofHash = "0x1234567890abcdef";

      await expect(
        contract.connect(employer).createStream(
          employer.address,
          duration,
          zkProofHash,
          { value: amount }
        )
      ).to.be.revertedWith("Cannot stream to yourself");
    });

    it("Should revert with zero amount", async function () {
      const { contract, employer, employee } = await loadFixture(deployContractFixture);
      
      const duration = 30 * 24 * 60 * 60;
      const zkProofHash = "0x1234567890abcdef";

      await expect(
        contract.connect(employer).createStream(
          employee.address,
          duration,
          zkProofHash,
          { value: 0 }
        )
      ).to.be.revertedWith("Stream amount must be greater than 0");
    });

    it("Should revert with invalid duration", async function () {
      const { contract, employer, employee } = await loadFixture(deployContractFixture);
      
      const shortDuration = 23 * 60 * 60; // 23 hours (less than 1 day)
      const amount = ethers.parseEther("1.0");
      const zkProofHash = "0x1234567890abcdef";

      await expect(
        contract.connect(employer).createStream(
          employee.address,
          shortDuration,
          zkProofHash,
          { value: amount }
        )
      ).to.be.revertedWith("Duration too short");

      const longDuration = 366 * 24 * 60 * 60; // 366 days
      await expect(
        contract.connect(employer).createStream(
          employee.address,
          longDuration,
          zkProofHash,
          { value: amount }
        )
      ).to.be.revertedWith("Duration too long");
    });
  });

  describe("Withdrawals", function () {
    async function createStreamFixture() {
      const { contract, employer, employee, otherUser } = await loadFixture(deployContractFixture);
      
      const duration = 30 * 24 * 60 * 60; // 30 days
      const amount = ethers.parseEther("30.0"); // 1 ETH per day
      const zkProofHash = "0x1234567890abcdef";

      await contract.connect(employer).createStream(
        employee.address,
        duration,
        zkProofHash,
        { value: amount }
      );

      return { contract, employer, employee, otherUser, streamId: 1, duration, amount };
    }

    it("Should calculate available amount correctly", async function () {
      const { contract, streamId, duration, amount } = await loadFixture(createStreamFixture);
      
      // No time passed
      expect(await contract.getAvailableAmount(streamId)).to.equal(0);
      
      // Half duration passed
      await time.increase(duration / 2);
      const halfAmount = amount / BigInt(2);
      expect(await contract.getAvailableAmount(streamId)).to.equal(halfAmount);
      
      // Full duration passed
      await time.increase(duration / 2);
      expect(await contract.getAvailableAmount(streamId)).to.equal(amount);
    });

    it("Should allow employee to withdraw available amount", async function () {
      const { contract, employee, streamId, duration } = await loadFixture(createStreamFixture);
      
      await time.increase(duration / 4); // 25% of duration
      const availableAmount = await contract.getAvailableAmount(streamId);
      
      const initialBalance = await ethers.provider.getBalance(employee.address);
      
      const tx = await contract.connect(employee).withdraw(streamId, availableAmount);
      await expect(tx)
        .to.emit(contract, "Withdrawal")
        .withArgs(streamId, employee.address, availableAmount, await time.latest());
      
      const finalBalance = await ethers.provider.getBalance(employee.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should allow withdrawAll function", async function () {
      const { contract, employee, streamId, duration } = await loadFixture(createStreamFixture);
      
      await time.increase(duration / 2); // 50% of duration
      const availableAmount = await contract.getAvailableAmount(streamId);
      
      await contract.connect(employee).withdrawAll(streamId);
      
      const stream = await contract.getStreamDetails(streamId);
      expect(stream.withdrawn).to.equal(availableAmount);
    });

    it("Should revert when non-employee tries to withdraw", async function () {
      const { contract, otherUser, streamId } = await loadFixture(createStreamFixture);
      
      await expect(
        contract.connect(otherUser).withdraw(streamId, ethers.parseEther("1.0"))
      ).to.be.revertedWith("Only employee can withdraw");
    });

    it("Should revert when withdrawing more than available", async function () {
      const { contract, employee, streamId, amount } = await loadFixture(createStreamFixture);
      
      await expect(
        contract.connect(employee).withdraw(streamId, amount)
      ).to.be.revertedWith("Insufficient available amount");
    });
  });

  describe("Stream Cancellation", function () {
    async function createStreamFixture() {
      const { contract, employer, employee, otherUser } = await loadFixture(deployContractFixture);
      
      const duration = 30 * 24 * 60 * 60; // 30 days
      const amount = ethers.parseEther("30.0");
      const zkProofHash = "0x1234567890abcdef";

      await contract.connect(employer).createStream(
        employee.address,
        duration,
        zkProofHash,
        { value: amount }
      );

      return { contract, employer, employee, otherUser, streamId: 1, duration, amount };
    }

    it("Should allow employer to cancel stream", async function () {
      const { contract, employer, streamId, duration } = await loadFixture(createStreamFixture);
      
      await time.increase(duration / 4); // 25% of duration
      
      const tx = await contract.connect(employer).cancelStream(streamId);
      await expect(tx).to.emit(contract, "StreamCancelled").withArgs(streamId);
      
      const stream = await contract.getStreamDetails(streamId);
      expect(stream.active).to.be.false;
    });

    it("Should revert when non-employer tries to cancel", async function () {
      const { contract, employee, streamId } = await loadFixture(createStreamFixture);
      
      await expect(
        contract.connect(employee).cancelStream(streamId)
      ).to.be.revertedWith("Only employer can cancel");
    });
  });

  describe("Query Functions", function () {
    it("Should return streams by employee", async function () {
      const { contract, employer, employee } = await loadFixture(deployContractFixture);
      
      const duration = 30 * 24 * 60 * 60;
      const amount = ethers.parseEther("1.0");
      const zkProofHash = "0x1234567890abcdef";

      await contract.connect(employer).createStream(
        employee.address,
        duration,
        zkProofHash,
        { value: amount }
      );

      const streams = await contract.getStreamsByEmployee(employee.address);
      expect(streams.length).to.equal(1);
      expect(streams[0]).to.equal(1);
    });

    it("Should return streams by employer", async function () {
      const { contract, employer, employee } = await loadFixture(deployContractFixture);
      
      const duration = 30 * 24 * 60 * 60;
      const amount = ethers.parseEther("1.0");
      const zkProofHash = "0x1234567890abcdef";

      await contract.connect(employer).createStream(
        employee.address,
        duration,
        zkProofHash,
        { value: amount }
      );

      const streams = await contract.getStreamsByEmployer(employer.address);
      expect(streams.length).to.equal(1);
      expect(streams[0]).to.equal(1);
    });
  });
}); 