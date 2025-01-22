const path = require("path");
const { DockerComposeEnvironment } = require("testcontainers");

describe("Solscan Fetcher Tests", () => {
  let environment;

  beforeAll(async () => {
    const composeFilePath = path.resolve(__dirname, "../");
    // Start only the solscan-fetcher container
    environment = await new DockerComposeEnvironment(composeFilePath, "docker-compose.yml")
      .up(["solscan-fetcher"]);
  },20000);

  afterAll(async () => {
    // Tear down the environment
    await environment.down();
  },20000);

  test("should handle POST request", async () => {
    const fetch = require("node-fetch");

    // Get the solscan-fetcher container details
    const container = environment.getContainer("solscan-fetcher");
    const { output, exitCode } = await container.exec([`curl`, 
        `-H`, `Content-Type: application/json`, 
        `-d`, `{"tokenAddress": "2gtGRidmSksCpyy9hx37hLXfYfEtaeA3wapWt55gnpCN"}`, 
        `-X`, `POST`, 
        `http://solscan-fetcher:3004`]);
    console.log(output);
    (await container.logs())
  .on("data", line => console.log(line))
  .on("err", line => console.error(line))
  .on("end", () => console.log("Stream closed"));
/*    const url = `http://solscan-fetcher:3004`; // Replace "/endpoint" with your API endpoint

    // Perform a POST request to the solscan-fetcher service
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "tokenAddreess":"2gtGRidmSksCpyy9hx37hLXfYfEtaeA3wapWt55gnpCN"}), // Replace with your POST payload
    });
    console.log(response)
    const data = await response.json();
    console.log(data);

    expect(response.status).toBe(200); // Adjust based on expected status
    expect(data).toEqual({ expectedKey: "expectedValue" }); // Replace with expected response
    */
  }, 12000);
});
