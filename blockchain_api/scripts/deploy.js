const hre = require("hardhat");

async function main() {
  console.log("Deploying TransactionStore contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const TransactionStore = await hre.ethers.getContractFactory("TransactionStore");
  console.log("Deploying contract...");
  const transactionStore = await TransactionStore.deploy();

  console.log("Waiting for deployment transaction...");
  await transactionStore.deployTransaction.wait();

  console.log("TransactionStore deployed to:", transactionStore.address);

  // Save the contract address to a file for the API to use
  const fs = require("fs");
  fs.writeFileSync(
    "./contract-address.json",
    JSON.stringify({ TransactionStore: transactionStore.address }, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });