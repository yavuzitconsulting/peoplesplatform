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
    
    function init() external onlyOwner {

        PeoplesPlatformStorage storage pp = pp();

        if (pp.isInitialized) return;

        pp._isDonatingActive=true;

        ds().supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds().supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        
        pp.isInitialized = true;
    }
}