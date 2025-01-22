const express = require("express");
const fs = require("fs");
const fetch = require("node-fetch");
const { Connection, PublicKey } = require("@solana/web3.js");

// list of public rpc endpoints:
//https://github.com/extrnode/rpc-solana-endpoints/blob/main/rpc_list.csv

const app = express();
const PORT = 3004;
// Replace with your RPC endpoint
const RPC_ENDPOINT = "https://199.254.199.38:8899";

(async () => {

  app.use(express.json());
  // Endpoint to receive the token address
  app.post("/", async (req, res) => {
    const { tokenAddress: receivedTokenAddress } = req.body;
    console.log(req.body)
    console.log(receivedTokenAddress)
    if (!receivedTokenAddress) {
      console.error("Invalid token address format.");
      return res.status(400).json({ status: "error", message: "Token address is required.", body: req.body });
    }

    console.log(`Token address received: ${receivedTokenAddress}`);
    res.json({ status: "success", message: "Token address received." });

    const connection = new Connection(RPC_ENDPOINT);

    // Replace with the address you want to query
    const address = new PublicKey(receivedTokenAddress);

    try {
      // Fetch signatures for the address
      const signatures = await connection.getSignaturesForAddress(address);

      // Loop through each signature and fetch the transaction details
      for (let sig of signatures) {
        const transaction = await connection.getTransaction(sig.signature);
        console.log("Transaction Details:", transaction);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    res.json(formattedData);

});

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Waiting for token address...`);
  });

})();