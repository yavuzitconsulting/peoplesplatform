import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {ethers} from 'hardhat';

var date = new Date();

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
console.log("what");
const deployPeoplesPlatform: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  //const { deployer } = await hre.getNamedAccounts();
  const [owner,address1,address2] = await ethers.getSigners();
  const { diamond } = hre.deployments;

  await diamond.deploy("PeoplesPlatform", {
    from: owner.address,
    autoMine: true,
    log: true,
    waitConfirmations: 1,
    facets: [{
      deterministic:false,
      name:"InitFacet"
    },
    {
      deterministic:false,
      name:"PeoplesPlatformFacet"},
      
        
    ],
    // facets: [
    //   "InitFacet",
    //   "PeoplesPlatformFacet",
    //   "ManagePeoplesPlatformFacet",
    //   "PeoplesPlatformLeafWalletTrialFacet",
    // ],
    execute: {
      contract: 'InitFacet',
      methodName: 'init',
      args: [date.getMonth(),date.getYear()]
    },
  })
};

export default deployPeoplesPlatform;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployPeoplesPlatform.tags = ["PeoplesPlatform"];
