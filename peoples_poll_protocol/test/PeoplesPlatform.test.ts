import { expect } from "chai";

import {ethers, deployments, getNamedAccounts} from 'hardhat';

describe("PeoplesPlatform contract", function() {
  it("Deployment should have empty balance", async function() {
    await deployments.fixture(["PeoplesPlatform"]);
    const {deployer} = await getNamedAccounts();
    const PeoplesPlatform = await ethers.getContract("PeoplesPlatform");
    const balance = await ethers.provider.getBalance(PeoplesPlatform.getAddress());

    expect(balance).to.equal(0n);
  });
});