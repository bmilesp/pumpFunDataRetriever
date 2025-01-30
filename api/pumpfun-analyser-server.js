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

app.get("/topMintsByTotalCommentsAndDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { 
        _id: "$mint", 
        totalReplies: { $sum: 1 }, 
      }},
      { $sort: { totalReplies: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "tokens",        // Collection to join
          localField: "_id",     // Field from the grouped result ("mint" is now `_id`)
          foreignField: "mint",  // Field in the "tokens" collection (adjust based on your schema)
          pipeline: [ {$project: {name: 1, symbol:1, image_uri:1, usd_market_cap:1} } ],
          as: "tokenDetails"     // Output array field for joined documents
        }
      },
      { $unwind: "$tokenDetails" },
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
      { $group: { 
        _id: "$mint", 
        totalReplies: { $sum: 1 }, 
      }},
      { $sort: { totalReplies: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "tokens",        // Collection to join
          localField: "_id",     // Field from the grouped result ("mint" is now `_id`)
          foreignField: "mint",  // Field in the "tokens" collection (adjust based on your schema)
          pipeline: [ {$project: {name: 1, symbol:1, image_uri:1, usd_market_cap:1} } ],
          as: "tokenDetails"     // Output array field for joined documents
        }
      },
      { $unwind: "$tokenDetails" },
    ];
    const results = await fetchData("replies", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMintsByVolumeAndDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$mint", totalTxns: { $sum: 1 }, totalSolAmount: { $sum: "$signed_sol_amount" }, averageSolAmount: {$avg: "$signed_sol_amount"} } },
      { $sort: { totalTxns: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "tokens",        // Collection to join
          localField: "_id",     // Field from the grouped result ("mint" is now `_id`)
          foreignField: "mint",  // Field in the "tokens" collection (adjust based on your schema)
          pipeline: [ {$project: {name: 1, symbol:1, image_uri:1, usd_market_cap:1} } ],
          as: "tokenDetails"     // Output array field for joined documents
        }
      },
      { $unwind: "$tokenDetails" },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topPumpsByDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$mint", totalSolAmount: { $sum: "$signed_sol_amount" }, averageSolAmount: {$avg: "$signed_sol_amount"} } },
      { $sort: { totalSolAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "tokens",        // Collection to join
          localField: "_id",     // Field from the grouped result ("mint" is now `_id`)
          foreignField: "mint",  // Field in the "tokens" collection (adjust based on your schema)
          pipeline: [ {$project: {name: 1, symbol:1, image_uri:1, usd_market_cap:1} } ],
          as: "tokenDetails"     // Output array field for joined documents
        }
      },
      { $unwind: "$tokenDetails" },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topDumpsByDateRange", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$mint", totalSolAmount: { $sum: "$signed_sol_amount" }, averageSolAmount: {$avg: "$signed_sol_amount"} } },
      { $sort: { totalSolAmount: 1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "tokens",        // Collection to join
          localField: "_id",     // Field from the grouped result ("mint" is now `_id`)
          foreignField: "mint",  // Field in the "tokens" collection (adjust based on your schema)
          pipeline: [ {$project: {name: 1, symbol:1, image_uri:1, usd_market_cap:1} } ],
          as: "tokenDetails"     // Output array field for joined documents
        }
      },
      { $unwind: "$tokenDetails" },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMostTxnsByUser", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    console.log(Number(startTimestamp), Number(endTimestamp));
    const pipeline = [
      { $match: { created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$user", totalTxns: { $sum: 1 }, totalSolAmount: { $sum: "$signed_sol_amount" }, averageSolAmount: {$avg: "$signed_sol_amount"} } },
      { $sort: { totalTxns: -1 } },
      { $limit: 10 },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMostPumpByUser", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$user", totalSolAmount: { $sum: "$signed_sol_amount" }, averageSolAmount: {$avg: "$signed_sol_amount"} } },
      { $sort: { totalSolAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "tokens",        // Collection to join
          localField: "_id",     // Field from the grouped result ("mint" is now `_id`)
          foreignField: "mint",  // Field in the "tokens" collection (adjust based on your schema)
          pipeline: [ {$project: {name: 1, symbol:1, image_uri:1, usd_market_cap:1} } ],
          as: "tokenDetails"     // Output array field for joined documents
        }
      },
      { $unwind: "$tokenDetails" },
    ];
    const results = await fetchData("transactions", pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/topMostDumpByUser", async (req, res) => {
  try {
    const { startTimestamp, endTimestamp } = req.query;
    const pipeline = [
      { $match: { created_timestamp: { $gte: Number(startTimestamp), $lte: Number(endTimestamp) } } },
      { $group: { _id: "$user", totalSolAmount: { $sum: "$signed_sol_amount" }, averageSolAmount: {$avg: "$signed_sol_amount"} } },
      { $sort: { totalSolAmount: 1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "tokens",        // Collection to join
          localField: "_id",     // Field from the grouped result ("mint" is now `_id`)
          foreignField: "mint",  // Field in the "tokens" collection (adjust based on your schema)
          pipeline: [ {$project: {name: 1, symbol:1, image_uri:1, usd_market_cap:1} } ],
          as: "tokenDetails"     // Output array field for joined documents
        }
      },
      { $unwind: "$tokenDetails" },
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
