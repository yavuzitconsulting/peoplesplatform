//SPDX-License-Identifier: MIT

pragma solidity 0.8.10;


import {PeoplesPlatformStorage,StorageHandler} from "./PeoplesPlatformStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat-deploy/solc_0.8/diamond/libraries/LibDiamond.sol";


library LibPeoplesPlatform{
    using Strings for uint256;

    // A simple absolute value function for int16
    function abs(int64 x) internal pure returns (uint64) {
        if (x < 0) {
            return uint64(-x);
        }
        return uint64(x);
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

}