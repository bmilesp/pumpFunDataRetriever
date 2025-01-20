const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

(async () => {

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
    let formattedData = [];

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
          formattedData.push(data.replies.map((reply) => ({
            _id: reply.signature, // Use signature as the _id
            mint,
            ...reply,
          })));
          
        } else {
          const errorMessage = `No replies found for mint: ${mint} at offset: ${offset}`;
          res.send({error: errorMessage, data: formattedData});
          console.log(errorMessage);
        }

        // Check if there are more replies
        hasMore = data.replies && data.replies.length === limit;
        offset += limit;
      }
      res.send({ data: formattedData });
    } catch (error) {
      console.error(`Error fetching replies for mint: ${mint}`, error);
      res.status(500).send({ error: `Failed to fetch replies for mint: ${mint}` });
    }
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`API fetcher listening on port ${PORT}`);
  });

})();
