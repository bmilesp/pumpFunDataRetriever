const { execSync } = require("child_process");
const containerName = "solscan-fetcher";
module.exports = async () => {
  console.log("Stopping "+containerName+"...");
  try {
    execSync("docker compose stop", { stdio: "inherit" });
    console.log(containerName+" stopped and removed.");
  } catch (error) {
    console.error("Error stopping "+containerName+":", error.message);
  }
};