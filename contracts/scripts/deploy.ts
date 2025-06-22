import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying SalaryStream contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const SalaryStream = await ethers.getContractFactory("SalaryStream");
  const salaryStream = await SalaryStream.deploy();

  await salaryStream.waitForDeployment();
  const contractAddress = await salaryStream.getAddress();

  console.log("SalaryStream deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: process.env.HARDHAT_NETWORK || "localhost",
    timestamp: new Date().toISOString(),
    abi: JSON.parse(JSON.stringify(SalaryStream.interface.formatJson())),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "SalaryStream.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments/SalaryStream.json");

  // Verify deployment
  const contractCode = await deployer.provider.getCode(contractAddress);
  if (contractCode === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }

  console.log("Contract verified successfully!");
  return { contractAddress, contract: salaryStream };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main; 