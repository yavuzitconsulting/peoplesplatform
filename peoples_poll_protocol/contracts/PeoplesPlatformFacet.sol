//SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
//import "hardhat/console.sol";


import {PeoplesPlatformStorage,StorageHandler} from "./PeoplesPlatformStorage.sol";
import {UsingDiamondOwner} from "hardhat-deploy/solc_0.8/diamond/UsingDiamondOwner.sol";


/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 */
contract PeoplesPlatformFacet is StorageHandler, UsingDiamondOwner {
    using Address for address;
    using Strings for uint256;

    
    event Voted(string url,bool up,string title,address receiver,address sender);
    event Donated(uint64 donatedFinney, string name ,uint16 months,uint16 currentMonth,uint16 currentYear);
    event TransferedFairShare(uint256 amount,address to,uint16 month,uint16 year);
    event RemovedFromDonationBucket(uint32 shareFinney,uint32 transferDateId,uint16 transferFromDonationBucketPos, uint16 month, uint16 year);

    uint32[24] _donationBuckets = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; 
    mapping(uint32 => address[]) _dateIdAddresses;
    mapping(uint256 => int32) _dateAddressIdVoteValues;
    mapping(uint256 => bool) _dateAddressIdHasVotes;
    mapping(uint256 => bool) _monthAddressHasTransfered;


    function setDonatingActive() public onlyOwner {
        PeoplesPlatformStorage storage pp = pp();
        pp._isDonatingActive = true;
    }

    function setDonatingInactive() public onlyOwner {
        PeoplesPlatformStorage storage pp = pp();
        pp._isDonatingActive = false;
    }

    function donate(uint16 months, string memory name,uint16 currentMonth,uint16 currentYear) public payable {
        require(currentMonth > 0 && currentMonth<13, "Provide currentMonth as calendar month starting with 1 and last 12");
        uint16 _currentMonth = currentMonth-1;
        require(months < 25, "Only upto 24 months is supported");
        require(msg.value % months == 0, "Payed amount must be devidable by the distributed months");
        require(msg.value % 1_000_000_000_000_000  == 0, "Less than 1 finney(1/1000 ETH) fractions are not supported");

        uint256 donatedValueInFinney = msg.value / 1_000_000_000_000_000;
        require(donatedValueInFinney  <= 1_000_000_000 , "Donations larger than 1_000_000_000 finney are not supported");
        uint32 perMonthValue = uint32(donatedValueInFinney / months);

        PeoplesPlatformStorage storage pp = pp();

        uint32 donationRelativeDateId = (currentYear*12+_currentMonth)-pp._startDateId;

        //require(false,Strings.toString(donationRelativeDateId));
        for (uint32 i = donationRelativeDateId; i < donationRelativeDateId + months; i++) {
         
            uint32 donationBucketPos = i % 48;
            _donationBuckets[donationBucketPos]=_donationBuckets[donationBucketPos]+perMonthValue;

        }

        emit Donated(uint64(donatedValueInFinney),name, months, currentMonth, currentYear);

    }

    function vote(string memory url, bool up,address receiver,string memory title, uint16 currentMonth,uint16 currentYear ) public{
        uint160 uintAddress = uint160(receiver);
        if(uintAddress & uint160(0x1111000000000000000000000000000000000000) != uint160(0x1111000000000000000000000000000000000000))
        {
            uint32 voteDateId = currentYear * 12 + currentMonth;
            uint256 dateAddressId = (uint256(uintAddress) << 20) +voteDateId;
            if(!_dateAddressIdHasVotes[dateAddressId]){
                _dateAddressIdHasVotes[dateAddressId]=true;
                _dateAddressIdVoteValues[dateAddressId]=0;
                _dateIdAddresses[voteDateId].push(receiver);
            }

            if(up){
                _dateAddressIdVoteValues[dateAddressId]++;
            }else{
                _dateAddressIdVoteValues[dateAddressId]--;
            }
        }
        emit Voted(url, up,title,receiver,msg.sender);
    }

    function transfer(address payable to, uint16 month, uint16 year,uint16 currentMonth,uint16 currentYear) public {
       
        uint32 curDateId = currentYear * 12 + currentMonth;
        uint32 transferDateId = year * 12 + month;
        require(transferDateId < curDateId,"Your can only transfer your share for month before the current one");
        require(curDateId - transferDateId < 24,"Your can't transfer shares more than 24 months ago.");
        uint256 monthSenderAddressId = (uint256(uint160(msg.sender)) << 20) +transferDateId;
        require(_monthAddressHasTransfered[monthSenderAddressId]==false,"Share already transfered");
        require(_dateAddressIdVoteValues[monthSenderAddressId]>0,"You have not enough upvotes to be eligible");
        
        uint64 voteSum = 0;
        for (uint i=0; i<_dateIdAddresses[transferDateId].length; i++) {
            uint256 monthAddressId=(uint256( uint160(_dateIdAddresses[transferDateId][i])) << 20) +transferDateId;
            if(_dateAddressIdVoteValues[monthAddressId]>0){
                voteSum = voteSum + uint32(_dateAddressIdVoteValues[monthAddressId]);
            }
            
        }
        PeoplesPlatformStorage storage pp = pp();
        
        uint16 transferFromDonationBucketPos = uint16(transferDateId - pp._startDateId) % 48;
        uint32 shareFinney =uint32( (_donationBuckets[transferFromDonationBucketPos] *  uint32(_dateAddressIdVoteValues[monthSenderAddressId])) / (voteSum ));
        require(_donationBuckets[transferFromDonationBucketPos] >= shareFinney,"Not enough donations for that months available.");
        _donationBuckets[transferFromDonationBucketPos] -= shareFinney;
        _monthAddressHasTransfered[monthSenderAddressId]=true;
        to.transfer(shareFinney*1_000_000_000_000_000);
        emit TransferedFairShare(shareFinney*1_000_000_000_000_000, to,month, year);
        emit RemovedFromDonationBucket(shareFinney,transferDateId,transferFromDonationBucketPos, month, year);
    }
}
