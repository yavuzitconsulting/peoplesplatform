import { expect } from "chai";
import { PeoplesPlatformFacet } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {ethers, deployments, getNamedAccounts} from 'hardhat';
const hre = require("hardhat");

describe("PeoplesPlatform contract", function() {
    let peoplesPlatformContract:PeoplesPlatformFacet;
    let contractAddress:string;
    let owner:SignerWithAddress;
  let address1:SignerWithAddress;
  let address2:SignerWithAddress;

    before(async () => {
 
        [owner,address1,address2] = await ethers.getSigners();
        console.log('owner',owner.address);
        console.log('address1',address1.address);
        console.log('address2',address2.address);
        console.log('owner','0x30d85c181175c7cb84695dc5ebcd7a87ddc04be397a3d6140cfd11a0412d0f7d' );
        console.log('address1','0x8d11cfcf6fec322ece61f1f007f838bf6ca70eee49cd8d4349d54b22b10b6b74' );
        console.log('address2','0xd5944d5ee009a90c109c509f2ab597816234c9c528565ee7d10eab3288bf7ffe' );
        const deployment = await deployments.fixture(["PeoplesPlatform"]);
        contractAddress=deployment.PeoplesPlatform_DiamondProxy.address;
        peoplesPlatformContract = await hre.ethers.getContractAt("PeoplesPlatformFacet",contractAddress);
    
      });

  it("Deployment should have empty balance, myFame and totalFame ", async function() {
    
    
    const balance = await ethers.provider.getBalance(contractAddress);
    const myFame = await peoplesPlatformContract.myFame();
    const totalFame = await peoplesPlatformContract.totalFame();

    expect(balance).to.equal(0n);
    expect(myFame).to.equal(0n);
    expect(totalFame).to.equal(0n);
  });

  it("should be able to donate some amount for this year", async function() {
    const startMonth = (new Date()).getMonth()+1;
    const startYear = (new Date()).getFullYear();
    
    const donate120Finney = 120000000000000000n;
    await peoplesPlatformContract.donate(12,"",{value:donate120Finney});
    const balance = await ethers.provider.getBalance(contractAddress);
    const myFame = await peoplesPlatformContract.myFame();
    const totalFame = await peoplesPlatformContract.totalFame();
    
    expect(balance).to.equal(donate120Finney);
    expect(myFame).to.equal(12n);
    expect(totalFame).to.equal(12n);

    const donationBuckets = await peoplesPlatformContract.donationBuckets();

    expect(donationBuckets.startMonth).to.equal(startMonth);
    expect(donationBuckets.startYear).to.equal(startYear-1);
    let sumDonated = 0n;
    for (let index = 0; index < 48; index++) {
      sumDonated += BigInt(donationBuckets.donationBuckets[index]);
    }
    expect(sumDonated).to.equal(donate120Finney  / 1000000000000000n);
  });

  it("should be able to vote on some content", async function() {
    const startMonth = (new Date()).getMonth()+1;
    const startYear = (new Date()).getFullYear();
    const {receiver} = await getNamedAccounts();
    
    await peoplesPlatformContract.vote('https://www.construction-physics.com/p/how-the-gas-turbine-conquered-the',true,address1.address,'Title');
  
    const myFame = await peoplesPlatformContract.myFame();
    const totalFame = await peoplesPlatformContract.totalFame();

    expect(myFame).to.equal(13n);
    expect(totalFame).to.equal(13n);
    
  });

  it("should be able to transfer share", async function() {
    const startMonth = (new Date()).getMonth()+1;
    const startYear = (new Date()).getFullYear();
    const {receiver} = await getNamedAccounts();
    
    const recBalanceBefore = BigInt(await ethers.provider.getBalance(receiver));
    console.log('recBalanceBefore:',recBalanceBefore);
    const recPP = peoplesPlatformContract.connect(address1);
    //const estimation = BigInt(await recPP.estimateGas.transfer(address1.address,startMonth,startYear,startMonth,startYear))*2n;
    const tx = await recPP.transfer(address1.address,startMonth-5,startYear);
    //await recPP.bla(receiver,1,2024,1,2023);
    const receipt = await tx.wait();

    const totalFee = BigInt(receipt.cumulativeGasUsed) * BigInt(receipt.effectiveGasPrice );
    
    const recBalanceAfter = BigInt(await ethers.provider.getBalance(receiver));
    
    const sare10Finney = 10000000000000000n;

    expect(recBalanceAfter).to.equal(recBalanceBefore - totalFee + sare10Finney);

    const myFame = await peoplesPlatformContract.myFame();
    const totalFame = await peoplesPlatformContract.totalFame();

    expect(myFame).to.equal(13n);
    expect(totalFame).to.equal(14n);

    const myFameA1 = await recPP.myFame();
    expect(myFameA1).to.equal(1n);
  });
});