const express = require("express");
const { ethers } = require("ethers");
const crypto = require("crypto");
require("dotenv").config();
const cors = require("cors");

// Create hash function for card data (to avoid storing actual card numbers)
function hashCardData(cardNumber, cvv) {
  return crypto.createHash("sha256").update(cardNumber + cvv).digest("hex");
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Get contract ABI and address
const contractData = require("./artifacts/contracts/TransactionStore.sol/TransactionStore.json");
const contractAddress = require("./contract-address.json").TransactionStore;

// Setup connection to local blockchain
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
const contract = new ethers.Contract(contractAddress, contractData.abi, wallet);

app.post("/api/transactions", async (req, res) => {
  try {
    const {
      card_number,
      cvv,
      location,
      ip_address,
      merchant,
      amount,
      transaction_type,
      time_of_day
    } = req.body;

    // Validate inputs
    if (!card_number || !cvv || !location || !ip_address || !merchant ||
        amount === undefined || !transaction_type || time_of_day === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash the card data for security
    const cardHash = hashCardData(card_number, cvv);

    // Convert amount to wei (assuming amount is in ether)
    const amountInWei = ethers.utils.parseEther(amount.toString());

    // Record transaction on blockchain
    const tx = await contract.recordTransaction(
      cardHash,
      location,
      ip_address,
      merchant,
      amountInWei,
      transaction_type,
      time_of_day
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    // Extract transaction ID from the event
    const event = receipt.events.find(event => event.event === "TransactionRecorded");
    const transactionId = event.args.transactionId;

    res.status(201).json({
      success: true,
      transaction_id: transactionId,
      tx_hash: receipt.transactionHash
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to record transaction", details: error.message });
  }
});

app.get("/api/transactions/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    const transaction = await contract.getTransaction(transactionId);

    res.json({
      card_hash: transaction[0],
      location: transaction[1],
      ip_address: transaction[2],
      merchant: transaction[3],
      amount: ethers.utils.formatEther(transaction[4]),
      transaction_type: transaction[5],
      time_of_day: transaction[6].toNumber(),
      timestamp: new Date(transaction[7].toNumber() * 1000).toISOString()
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch transaction", details: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const count = await contract.getTransactionCount();
    const transactions = [];

    for (let i = 0; i < count; i++) {
      const id = await contract.getTransactionIdAtIndex(i);
      const transaction = await contract.getTransaction(id);

      transactions.push({
        id: id,
        card_hash: transaction[0],
        location: transaction[1],
        ip_address: transaction[2],
        merchant: transaction[3],
        amount: ethers.utils.formatEther(transaction[4]),
        transaction_type: transaction[5],
        time_of_day: transaction[6].toNumber(),
        timestamp: new Date(transaction[7].toNumber() * 1000).toISOString()
      });
    }

    res.json(transactions);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch transactions", details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 8001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});