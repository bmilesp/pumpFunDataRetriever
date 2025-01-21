const { execSync } = require("child_process");
const containerName = "solscan-fetcher-test";
module.exports = async () => {
  console.log("Stopping "+containerName+"...");
  try {
    execSync("docker stop "+containerName+" && docker rm "+containerName, { stdio: "inherit" });
    console.log(containerName+" stopped and removed.");
  } catch (error) {
    console.error("Error stopping "+containerName+":", error.message);
  }
};