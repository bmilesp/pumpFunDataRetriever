
const express = require("express");

const app = express();
const PORT = 3003;

function bufferToString(buffer) {
  const decoder = new TextDecoder(); // Assuming UTF-8 encoding
  return decoder.decode(buffer); 
}

(async () => {
  app.use(express.json());

  // Endpoint to handle incoming mint requests
  app.post("/", async (req, res) => {
    const input = req.body.data;
    if (!input) {
      return res.status(400).send({ error: "websocket data is required" });
    }  

    if (input.includes("tradeCreated")) {
      // Parse tradeCreated payload and insert into MongoDB
      const jsonSplit = input.split("[", 2);
      let payload = JSON.parse("[" + jsonSplit[1]);
      payload = payload[1]
      res.send(payload);
    } else if (input.includes("newCoinCreated")) {
      // Parse newCoinCreated payload and insert into MongoDB
      const jsonSplit = bufferToString(input).split("{", 2);
      const payload = JSON.parse("{" + jsonSplit[1]);
      res.send(payload);
      //console.log("Parsed newCoinCreated payload:", payload);
    } else {
      const errorMessage = "Invalid input. Expected a WebSocket payload of type tradeCreated or newCoinCreated."
      console.log(errorMessage)
      res.send({ error: errorMessage });
    }
      
  });

  app.listen(PORT, () => {
    console.log(`API Data Cleaner listening on port ${PORT}`);
  });

})();