const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const databaseName = "pumpfun";

(async () => {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(databaseName);
  const transactionCollection = db.collection("transactions");

  try {
    const limit = 10; // Number of latest transactions to retrieve

    const results = await transactionCollection
      .find({})
      .sort({ created_timestamp: -1 }) // Sort by timestamp in descending order (latest first)
      .limit(limit) // Limit to the specified number of transactions
      .toArray();

    console.log("Latest Transactions:", results);
  } catch (error) {
    console.error("Error querying MongoDB:", error);
  } finally {
    await client.close();
  }
})();
