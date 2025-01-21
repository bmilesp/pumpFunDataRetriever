const request = require("supertest");

const BASE_URL = "http://solscan-fetcher:3004"; // The container is exposed on this port

describe("Solscan Fetcher Docker Container Tests", () => {
  test("POST /should return success", async () => {
    console.log(BASE_URL);
    const response = await request(BASE_URL)
      .post("/")
      .send({ tokenAddress: "8LoeqxjBMcwBL9Gp2MiasMtyWScrokHkwYJ2KbhFpump" })
      .set("Content-Type", "application/json");
    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: "success",
        message: "Token address received."
      })
    );
  });

  test("POST / with invalid data should return error", async () => {
    const response = await request(BASE_URL)
      .post("/")
      .send({ invalidField: "someValue" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: "error",
        message: expect.any(String)
      })
    );
  });
});