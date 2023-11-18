import { expect } from "chai";
import { parseUnits } from 'ethers';

import {ethers, deployments, getNamedAccounts} from 'hardhat';

describe("PeoplesPlatform contract", function() {
  it("Deployment should have empty balance", async function() {
    await deployments.fixture(["PeoplesPlatform"]);
    const {deployer} = await getNamedAccounts();
    const PeoplesPlatform = await ethers.getContract("PeoplesPlatform");
    const balance = await ethers.provider.getBalance(PeoplesPlatform.getAddress());

    expect(balance).to.equal(0n);
  });

  it("should be able to donate some amount for this year", async function() {
    await deployments.fixture(["PeoplesPlatform"]);
    const {deployer} = await getNamedAccounts();
    const PeoplesPlatform = await ethers.getContract("PeoplesPlatform");
    const donate120Finney = parseUnits('120',15);
    await PeoplesPlatform.donate(12,12,2022,{value:donate120Finney});
    const balance = await ethers.provider.getBalance(PeoplesPlatform.getAddress());
    
    expect(balance).to.equal(donate120Finney);
  });

  it("should be able to vote on some content", async function() {
    await deployments.fixture(["PeoplesPlatform"]);
    const {deployer} = await getNamedAccounts();
    const PeoplesPlatform = await ethers.getContract("PeoplesPlatform");
    await PeoplesPlatform.vote(true,deployer,'https://www.construction-physics.com/p/how-the-gas-turbine-conquered-the', 1,2023);
  
    
  });
});