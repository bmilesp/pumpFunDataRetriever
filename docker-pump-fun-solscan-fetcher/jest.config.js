module.exports = {
    globalSetup: "./jest.setup.js",
    globalTeardown: "./jest.teardown.js",
    testEnvironment: "node",
    testMatch: ["<rootDir>/*test.js"]
  };