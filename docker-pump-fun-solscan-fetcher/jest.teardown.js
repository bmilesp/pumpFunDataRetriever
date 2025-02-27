const { execSync } = require("child_process");
const containerName = "solscan-fetcher";
module.exports = async () => {
  console.log("Stopping "+containerName+"...");
  try {
    execSync(`sudo docker compose stop ${containerName}`, { stdio: "inherit" });
    console.log(containerName+" stopped and removed.");
  } catch (error) {
    console.error("Error stopping "+containerName+":", error.message);
  }
};