const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || "mongodb://host.docker.internal:27017";
const databaseName = "pumpfun";

const client = new MongoClient(mongoUri);
let cacheDb = null;

app.use(cors());

async function connectDB() {
  if (!cacheDb) {
    await client.connect();
    cacheDb = client.db(databaseName);
  }
  return cacheDb;
}

async function fetchData(collectionName, pipeline) {
  const db = await connectDB();
  const collection = db.collection(collectionName);
  return collection.aggregate(pipeline).toArray();
}

// Endpoints
app.get("/latestTransactions", async (req, res) => {
  try {
    const db = await connectDB();
    const transactionCollection = db.collection("transactions");
    const results = await transactionCollection
      .find({})
      .sort({ created_timestamp: -1 })
      .limit(10)
      .toArray();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMintsByTotalSellTxnsAndDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { is_buy: false, created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$mint", totalSells: { $sum: 1 }, total_sol_amount: { $sum: "$sol_amount" } } },
      { $sort: { totalSells: -1 } },
      { $limit: 10 },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMintsByTotalCommentsAndDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$mint", totalReplies: { $sum: 1 } } },
      { $sort: { totalReplies: -1 } },
      { $limit: 10 },
    ];
    const results = await fetchData("replies", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMintsByTotalComments", async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$mint", totalReplies: { $sum: 1 } } },
      { $sort: { totalReplies: -1 } },
      { $limit: 10 },
    ];
    const results = await fetchData("replies", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMintsByTotalBuyTxnsAndDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { is_buy: true, created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$mint", totalBuys: { $sum: 1 }, total_sol_amount: { $sum: "$sol_amount" } } },
      { $sort: { totalBuys: -1 } },
      { $limit: 10 },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMintsByTotalAllTxnsAndDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$mint", totalTransactions: { $sum: 1 }, total_sol_amount: { $sum: "$sol_amount" } } },
      { $sort: { totalTransactions: -1 } },
      { $limit: 10 },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMintsByBiggestDumpTxnsAndDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { is_buy: false, created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$mint", totalSells: { $sum: 1 }, total_sol_amount: { $sum: "$sol_amount" } } },
      { $sort: { totalSells: -1 } },
      { $limit: 10 },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
