const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const databaseName = "pumpfun";
const limit = 10; // Change this to the number of results you want to return
const startDate = new Date("2025-01-19").getTime(); // Start date of the range
const endDate = new Date("2025-01-22").getTime(); // End date of the range

(async () => {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(databaseName);
  const transactionCollection = db.collection("transactions");

  try {
    console.log("Date range:", startDate, endDate);

    const results = await transactionCollection.aggregate([
      {
        $match: {
          is_buy: false, // Filter for buy transactions
          created_timestamp: { $gte: startDate, $lte: endDate }, // Filter by date range
        },
      },
      {
        $group: {
          _id: "$mint", // Group all matching transactions together
          totalSells: { $sum: 1 }, // Count the number of documents in each group
          total_sol_amount: { $sum: "$sol_amount" }, // Sum of sol_amount
          total_token_amount: { $sum: "$token_amount" }, // Sum of token_amount
        },
      },
      {
        $sort: { totalBuys: -1 }, // Sort by totalReplies in descending order (most replies first)
      },
      {
        $limit: limit, // Limit the total number of results
      },
    ]).toArray();

    console.log("Aggregated Transactions:", results);
  } catch (error) {
    console.error("Error querying MongoDB:", error);
  } finally {
    await client.close();
  }
})();
