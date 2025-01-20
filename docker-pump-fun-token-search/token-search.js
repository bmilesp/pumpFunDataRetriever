const express = require("express");
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3001;
const mongoUri = process.env.MONGO_URI || "mongodb://mongodb:27017";
const databaseName = "pumpfun";
const tokenCollectionName = "tokens";

(async () => {
  // MongoDB setup
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(databaseName);
  const tokenCollection = db.collection(tokenCollectionName);

  app.use(express.json());

  app.post("/", async (req, res) => {
    const { mint } = req.body;

    if (!mint) {
      return res.status(400).send({ error: "Mint value is required" });
    }

    try {
      const url = `https://frontend-api-v2.pump.fun/coins/search?offset=0&limit=50&sort=market_cap&includeNsfw=false&order=DESC&searchTerm=${encodeURIComponent(mint)}&type=exact`;
      console.log(`Searching tokens with mint: ${mint}`);

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Search Results:", data);

      // Save each result to MongoDB
      for (const token of data.results || []) {
        await tokenCollection.updateOne(
          { mint: token.mint },
          { $set: token },
          { upsert: true }
        );
      }

      console.log(`Search results for mint '${mint}' saved to MongoDB.`);
      res.send({ status: "success", message: `Search results for mint '${mint}' saved to MongoDB.` });
    } catch (error) {
      console.error("Error during token search:", error);
      res.status(500).send({ error: "Failed to search tokens." });
    }
  });

  app.listen(PORT, () => {
    console.log(`Token search service running on port ${PORT}`);
  });
})();