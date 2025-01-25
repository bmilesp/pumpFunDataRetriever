const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const databaseName = "pumpfun";

(async () => {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(databaseName);
  const replyCollection = db.collection("replies");

  try {
    const limit = 10; // Change this to the number of results you want to return

    const results = await replyCollection.aggregate([
      {
        $group: {
          _id: "$mint", // Group by mint
          totalReplies: { $sum: 1 }, // Count the number of documents in each group
        },
      },
      {
        $sort: { totalReplies: -1 }, // Sort by totalReplies in descending order (most replies first)
      },
      {
        $limit: limit, // Limit the total number of results
      },
    ]).toArray();

    console.log(`Top ${limit} mints by replies:`, results);
  } catch (error) {
    console.error("Error querying MongoDB:", error);
  } finally {
    await client.close();
  }
})();
