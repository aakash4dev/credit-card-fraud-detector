const { spawn } = require("child_process");
const path = require("path");

// Start Hardhat node
console.log("Starting Hardhat node...");
const hardhatNode = spawn("npx", ["hardhat", "node"], {
  stdio: "inherit"
});

// Wait for node to start
setTimeout(() => {
  // Deploy contract
  console.log("Deploying contract...");
  const deploy = spawn("npx", ["hardhat", "run", "--network", "localhost", "scripts/deploy.js"], {
    stdio: "inherit"
  });

  deploy.on("close", (code) => {
    if (code !== 0) {
      console.error("Contract deployment failed");
      process.exit(1);
    }

    // Start API server
    console.log("Starting API server...");
    const server = spawn("node", ["api.js"], {
      stdio: "inherit"
    });

    server.on("close", (code) => {
      console.log("API server stopped");
      hardhatNode.kill();
    });
  });
}, 5000);

process.on("SIGINT", () => {
  console.log("Shutting down...");
  process.exit();
});