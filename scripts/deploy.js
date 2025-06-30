// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy HeartRateStorage contract
  const HeartRateStorage = await ethers.getContractFactory("HeartRateStorage");
  const heartRateStorage = await HeartRateStorage.deploy();
  console.log("HeartRateStorage deployed to:", heartRateStorage.target);

  // Deploy HeartRateAlert contract
  const HeartRateAlert = await ethers.getContractFactory("HeartRateAlert");
  const heartRateAlert = await HeartRateAlert.deploy();
  console.log("HeartRateAlert deployed to:", heartRateAlert.target);

  // Deploy HeartRateToken contract
  const HeartRateToken = await ethers.getContractFactory("HeartRateToken");
  const heartRateToken = await HeartRateToken.deploy();
  console.log("HeartRateToken deployed to:", heartRateToken.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
