const express = require("express");
const fs = require("fs");
const fetch = require("node-fetch");

// Get the API key from the environment variable
const API_KEY = process.env.API_KEY;

// Validate that the API key is provided
if (!API_KEY) {
  console.error("API_KEY is missing. Please provide it in the Docker Compose environment configuration.");
  process.exit(1);
}

// Solscan API URL for token transactions
const BASE_URL = "https://api.solscan.io/token/holders";

// Variable to store the token address
let tokenAddress = null;

// Express app and port configuration
const app = express();
const PORT = 3004;

// Middleware to parse JSON requests
app.use(express.json());

// Function to fetch transactions for a specific page
const fetchTransactions = async (tokenAddress, limit = 50, offset = 0) => {
  const url = `${BASE_URL}?tokenAddress=${tokenAddress}&limit=${limit}&offset=${offset}`;
  console.log(url)
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        token: API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching transactions at offset ${offset}: ${error.message}`);
    return null;
  }
};

// Function to handle paginated results
const getAllTransactions = async (tokenAddress) => {
  const allTransactions = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const data = await fetchTransactions(tokenAddress, limit, offset);
    if (!data || !data.data) {
      console.log("No more data or an error occurred.");
      break;
    }

    const transactions = data.data;
    allTransactions.push(...transactions);

    console.log(`Fetched ${transactions.length} transactions (offset: ${offset}).`);

    // Break if we get less than the limit, indicating no more results
    if (transactions.length < limit) {
      break;
    }

    // Increment the offset for the next page
    offset += limit;

    // Add a delay to avoid hitting rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return allTransactions;
};

// Endpoint to receive the token address
app.post("/", async (req, res) => {
  const { tokenAddress: receivedTokenAddress } = req.body;
  console.log(req.body)
  console.log(receivedTokenAddress)
  console.log(tokenAddress)
  if (!receivedTokenAddress) {
    console.error("Invalid token address format.");
    return res.status(400).json({ status: "error", message: "Token address is required.", body: req.body });
  }

  tokenAddress = receivedTokenAddress;
  console.log(`Token address received: ${tokenAddress}`);
  res.json({ status: "success", message: "Token address received." });

  // Start processing transactions
  try {
    console.log("Starting to fetch transactions...");
    const transactions = await getAllTransactions(tokenAddress);

    if (transactions.length > 0) {
      console.log(`Retrieved ${transactions.length} transactions in total.`);
      fs.writeFileSync("transactions.json", JSON.stringify(transactions, null, 2));
      console.log("Transactions saved to transactions.json");
    } else {
      console.log("No transactions found.");
    }
  } catch (error) {
    console.error(`Error during transaction processing: ${error.message}`);
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. Waiting for token address...`);
});
