const express = require("express");
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

// MongoDB connection settings
const mongoUri = process.env.MONGO_URI || "mongodb://mongodb:27017";
const databaseName = "pumpfun";

(async () => {
  // Connect to MongoDB
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(databaseName);
  const replyCollection = db.collection("replies");
  const lastQueriedCollection = db.collection("replies_last_queried_at");

  console.log("Connected to MongoDB");

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Endpoint to handle incoming mint requests
  app.post("/", async (req, res) => {
    const { mint } = req.body;

    if (!mint) {
      return res.status(400).send({ error: "Mint value is required" });
    }

    console.log(`Fetching replies for mint: ${mint}`);

    const limit = 1000;
    let offset = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        // Record the current timestamp
        const timestamp = new Date();

        // Add or update the last queried timestamp for this mint
        await lastQueriedCollection.updateOne(
          { _id: mint },
          { $set: { timestamp } },
          { upsert: true }
        );
        console.log(`Updated last queried timestamp for mint: ${mint}`);

        const url = `https://frontend-api-v2.pump.fun/replies/${mint}?limit=${limit}&offset=${offset}`;
        console.log(`Fetching: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch data. Status: ${response.status}`);
          break;
        }

        const data = await response.json();

        // Check if data.replies exists and is not empty
        if (data.replies && Array.isArray(data.replies) && data.replies.length > 0) {
          const formattedData = data.replies.map((reply) => ({
            _id: reply.signature, // Use signature as the _id
            mint,
            ...reply,
          }));
          await replyCollection.insertMany(formattedData);
          console.log(`Inserted ${formattedData.length} replies into MongoDB for mint: ${mint}`);
        } else {
          console.log(`No replies found for mint: ${mint} at offset: ${offset}`);
        }

        // Check if there are more replies
        hasMore = data.replies && data.replies.length === limit;
        offset += limit;
      }

      console.log(`All replies fetched successfully for mint: ${mint}`);
      res.send({ status: "success", message: `Replies fetched for mint: ${mint}` });
    } catch (error) {
      console.error(`Error fetching replies for mint: ${mint}`, error);
      res.status(500).send({ error: `Failed to fetch replies for mint: ${mint}` });
    }
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`API fetcher listening on port ${PORT}`);
  });

  // Handle shutdown
  process.on("SIGINT", async () => {
    console.log("Closing MongoDB connection...");
    await client.close();
    process.exit();
  });
})();
