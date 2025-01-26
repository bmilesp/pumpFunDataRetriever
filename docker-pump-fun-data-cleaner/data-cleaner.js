
const express = require("express");

const app = express();
const PORT = 3003;
let payload;

(async () => {
  app.use(express.json());

  // Endpoint to handle incoming mint requests
  app.post("/", async (req, res) => {
    const input = String(req.body.data);
    if (!input) {
      return res.status(400).send({ error: "websocket data is required" });
    }  
    if (input.includes("tradeCreated")) {
      // Parse tradeCreated payload and insert into MongoDB
      const jsonSplit = input.split("[", 2);
      try{
        payload = JSON.parse("[" + jsonSplit[1]);
      } catch (error) {
        console.error("Failed to parse tradeCreated payload:", error, input);
      }
      payload = payload[1]
      res.json(payload);
    } else if (input.includes("newCoinCreated")) {
      //console.log("newCoinCreated: ", input)
      const jsonSplit = input.split("{", 2);
      try{
        payload = JSON.parse("{" + jsonSplit[1]);
      } catch (error) {
        console.error("Failed to parse newCoinCreated payload:", error, input);
      }
      res.json(payload);
    } else {
      const errorMessage = "Invalid input. Expected a WebSocket payload of type tradeCreated or newCoinCreated."
      console.log(errorMessage)
      console.log(JSON.stringify(input))
      res.status(400).json({ error: errorMessage});
    }
  });

  app.listen(PORT, () => {
    console.log(`API Data Cleaner listening on port ${PORT}`);
  });

})();