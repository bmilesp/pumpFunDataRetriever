const fs = require("fs");
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

// Ensure the output directory exists
const outputDirectory = "/usr/src/app/output";
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to handle incoming mint requests
app.post("/fetch-replies", async (req, res) => {
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
      const url = `https://frontend-api-v2.pump.fun/replies/${mint}?limit=${limit}&offset=${offset}`;
      console.log(`Fetching: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch data. Status: ${response.status}`);
        break;
      }

      const data = await response.json();

      // Save the fetched data to a file
      const fileName = `${outputDirectory}/${mint}_replies_offset_${offset}.json`;
      fs.writeFileSync(fileName, JSON.stringify(data, null, 2), "utf8");
      console.log(`Data saved to ${fileName}`);

      // Check if there are more replies
      hasMore = data.length === limit;
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