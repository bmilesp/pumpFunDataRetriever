const { execSync } = require("child_process");
const containerName = "solscan-fetcher";
const containerImage = "pump-fun-solscan-fetcher";
const port = 3004;
module.exports = async () => {
  console.log("Starting "+containerName+"...");
  const dockerCommand =  `sudo docker compose -f ../docker-compose.yml up ${containerName} --build -d`;
  console.log(dockerCommand);
  try {
    execSync(
      dockerCommand,
      { stdio: "inherit" }
    );
    console.log(containerName+" started.");
  } catch (error) {
    console.error("Error starting "+containerName+ ":", error.message);
    process.exit(1);
  }
};