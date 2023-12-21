// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IDiamondLoupe} from "hardhat-deploy/solc_0.8/diamond/interfaces/IDiamondLoupe.sol";
import {UsingDiamondOwner, IDiamondCut} from "hardhat-deploy/solc_0.8/diamond/UsingDiamondOwner.sol";
import "hardhat-deploy/solc_0.8/diamond/libraries/LibDiamond.sol";
import {PeoplesPlatformStorage, StorageHandler} from "./PeoplesPlatformStorage.sol";

contract InitFacet is UsingDiamondOwner, StorageHandler {
  
  constructor(){
        LibDiamond.setContractOwner(msg.sender);
        
    }
    
    function init(uint16 currentMonth,uint16 currentYear,bool isTesting) external onlyOwner {

        PeoplesPlatformStorage storage pp = pp();

        uint16 currentMonth0Based = currentMonth -1;

        pp._startDateId = currentYear * 12 + currentMonth0Based;

        pp._isTesting = isTesting;

        if(pp._donationBuckets.length == 0) pp._donationBuckets = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        if (pp.isInitialized) return;

        pp._isDonatingActive=true;

        ds().supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds().supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        
        pp.isInitialized = true;
    }
}