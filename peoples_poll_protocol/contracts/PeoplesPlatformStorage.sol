//SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {LibDiamond} from "hardhat-deploy/solc_0.8/diamond/libraries/LibDiamond.sol";

bytes32 constant PEOPLESPLATFORM_STORAGE_POSITION = keccak256("peoplesplatform.contract.storage");
bytes32 constant LEAFWALLET_STORAGE_POSITION = keccak256("leafwallet.contract.storage");

struct OwnableStorage {

    address _owner;
}

struct PeoplesPlatformStorage {
    

    bool isInitialized;
    bool _isDonatingActive;
}

contract StorageHandler {
    function pp() internal pure returns (PeoplesPlatformStorage storage cs) {
        bytes32 position = PEOPLESPLATFORM_STORAGE_POSITION;
        assembly {
           cs.slot := position
        }
    }

    function os() internal pure returns (OwnableStorage storage cs) {
        bytes32 position = keccak256("ownable.contract.storage");
        assembly {
           cs.slot := position
        }
    }
    
    function ds() internal pure returns (LibDiamond.DiamondStorage storage) {
        return LibDiamond.diamondStorage();
    }
}