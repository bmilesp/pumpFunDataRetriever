const { execSync } = require("child_process");
const containerName = "solscan-fetcher-test";
const containerImage = "pump-fun-solscan-fetcher";
const port = 3004;
module.exports = async () => {
  console.log("Starting "+containerName+"...");
  const dockerCommand =  `docker build -t ${containerImage} -f Dockerfile . && docker run -d --name ${containerName} -p ${port}:${port} ${containerImage}`
  console.log(dockerCommand);
  try {
    execSync(
      `docker build -t ${containerImage} -f Dockerfile . && docker run -d --name ${containerName} -p ${port}:${port} ${containerImage}`,
      { stdio: "inherit" }
    );
    console.log(containerName+" started.");
  } catch (error) {
    console.error("Error starting "+containerName+ ":", error.message);
    process.exit(1);
  }
};