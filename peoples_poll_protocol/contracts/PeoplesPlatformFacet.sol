//SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
//import "hardhat/console.sol";


import {PeoplesPlatformStorage,StorageHandler} from "./PeoplesPlatformStorage.sol";
import {LibPeoplesPlatform} from "./LibPeoplesPlatform.sol";
import {UsingDiamondOwner} from "hardhat-deploy/solc_0.8/diamond/UsingDiamondOwner.sol";


/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 */
contract PeoplesPlatformFacet is StorageHandler, UsingDiamondOwner {
    using Address for address;
    using Strings for uint256;

    
    event Voted(string url,bool up,string title,address receiver,address sender,uint8 month, uint16 year);
    event Donated(uint64 donatedFinney, string name ,uint16 months,uint16 currentMonth,uint16 currentYear);
    event TransferedFairShare(uint256 amount,address to,uint16 month,uint16 year);
    event RemovedFromDonationBucket(uint32 shareFinney,uint32 transferDateId,uint16 transferFromDonationBucketPos, uint16 month, uint16 year);

    struct DonationBuckets{
        uint16 startMonth;
        uint16 startYear;
        uint32[48] donationBuckets;
    }


    function setDonatingActive() public onlyOwner {
        PeoplesPlatformStorage storage pp = pp();
        pp._isDonatingActive = true;
    }

    function setDonatingInactive() public onlyOwner {
        PeoplesPlatformStorage storage pp = pp();
        pp._isDonatingActive = false;
    }

    function donate(uint16 months, string memory name) public payable {
        LibPeoplesPlatform._DateTime memory date = LibPeoplesPlatform.parseTimestamp(block.timestamp);
        uint16 currentMonth0Based = date.month-1;
        require(months < 25, "Only upto 24 months is supported");
        require(msg.value % months == 0, "Payed amount must be devidable by the distributed months");
        require(msg.value % 1_000_000_000_000_000  == 0, "Less than 1 finney(1/1000 ETH) fractions are not supported");

        uint256 donatedValueInFinney = msg.value / 1_000_000_000_000_000;
        require(donatedValueInFinney  <= 1_000_000_000 , "Donations larger than 1_000_000_000 finney are not supported");
        uint32 perMonthValue = uint32(donatedValueInFinney / months);

        PeoplesPlatformStorage storage pp = pp();

        uint32 testSubMonths = pp._isTesting?5:0;

        uint32 donationRelativeDateId = (date.year*12+currentMonth0Based)-pp._startDateId - testSubMonths;

        //require(false,Strings.toString(donationRelativeDateId));
        for (uint32 i = donationRelativeDateId; i < donationRelativeDateId + months; i++) {
         
            uint32 donationBucketPos = i % 48;
            pp._donationBuckets[donationBucketPos]=pp._donationBuckets[donationBucketPos]+perMonthValue;

        }

        pp._fameHoldings[msg.sender] += uint64( donatedValueInFinney / 10);
        pp._totalFame += donatedValueInFinney / 10;

        emit Donated(uint64(donatedValueInFinney),name, months, date.month, date.year);

    }

    function vote(string memory url, bool up,address receiver,string memory title) public{
        LibPeoplesPlatform._DateTime memory date = LibPeoplesPlatform.parseTimestamp(block.timestamp);
        uint16 currentMonth0Based = date.month-1;
        uint160 uintAddress = uint160(receiver);
        PeoplesPlatformStorage storage pp = pp();
        if(uintAddress & uint160(0x1111000000000000000000000000000000000000) != uint160(0x1111000000000000000000000000000000000000))
        {
            

            uint32 testSubMonths = pp._isTesting?5:0;
            uint32 voteDateId = date.year * 12 + currentMonth0Based - testSubMonths;
            uint256 dateAddressId = (uint256(uintAddress) << 20) +voteDateId;
            
            if(!pp._dateAddressIdHasVotes[dateAddressId]){
                pp._dateAddressIdHasVotes[dateAddressId]=true;
                pp._dateAddressIdVoteValues[dateAddressId]=0;
                pp._dateIdAddresses[voteDateId].push(receiver);
            }

            if(up){
                pp._dateAddressIdVoteValues[dateAddressId]++;
            }else{
                pp._dateAddressIdVoteValues[dateAddressId]--;
            }
        }
        pp._fameHoldings[msg.sender] += 1;
        pp._totalFame += 1;

        emit Voted(url, up,title,receiver,msg.sender,date.month,date.year);
    }

    function transfer(address payable to, uint16 month, uint16 year) public {
        LibPeoplesPlatform._DateTime memory date = LibPeoplesPlatform.parseTimestamp(block.timestamp);
        uint16 currentMonth0Based = date.month-1;
        uint32 curDateId = date.year * 12 + currentMonth0Based;
        //require(false,Strings.toString( curDateId));
        uint32 transferDateId = year * 12 + month -1;
        PeoplesPlatformStorage storage pp = pp();
        require(transferDateId < curDateId,"Your can only transfer your share for month before the current one");
        require(transferDateId >= pp._startDateId,"Your can only transfer your share for months after donation started");
        require(curDateId - transferDateId < 24,"Your can't transfer shares more than 24 months ago.");
        uint256 monthSenderAddressId = (uint256(uint160(msg.sender)) << 20) +transferDateId;
        
        require(pp._monthAddressHasTransfered[monthSenderAddressId]==false,"Share already transfered");
        require(pp._dateAddressIdVoteValues[monthSenderAddressId]>0,"You have not enough upvotes to be eligible");
        
        uint64 voteSum = 0;
        for (uint i=0; i<pp._dateIdAddresses[transferDateId].length; i++) {
            uint256 monthAddressId=(uint256( uint160(pp._dateIdAddresses[transferDateId][i])) << 20) +transferDateId;
            if(pp._dateAddressIdVoteValues[monthAddressId]>0){
                voteSum = voteSum + uint32(pp._dateAddressIdVoteValues[monthAddressId]);
            }
            
        }
        
        uint16 transferFromDonationBucketPos = uint16(transferDateId - pp._startDateId) % 48;
     
        uint32 shareFinney =uint32( (pp._donationBuckets[transferFromDonationBucketPos] *  uint32(pp._dateAddressIdVoteValues[monthSenderAddressId])) / (voteSum ));
        
        require(pp._donationBuckets[transferFromDonationBucketPos] >= shareFinney,"Not enough donations for that months available.");
        pp._donationBuckets[transferFromDonationBucketPos] -= shareFinney;
        pp._monthAddressHasTransfered[monthSenderAddressId]=true;
        to.transfer(shareFinney*1_000_000_000_000_000);
        pp._fameHoldings[msg.sender] += shareFinney / 10;
        pp._totalFame += shareFinney / 10;
        emit TransferedFairShare(shareFinney*1_000_000_000_000_000, to,month, year);
        emit RemovedFromDonationBucket(shareFinney,transferDateId,transferFromDonationBucketPos, month, year);
    }

    function donationBuckets() public view returns(DonationBuckets memory) {
        PeoplesPlatformStorage storage pp = pp();
        return DonationBuckets(pp._startDateId % 12 + 1,pp._startDateId / 12,pp._donationBuckets);  
    }

    function totalFame() public view returns(uint256) {
        PeoplesPlatformStorage storage pp = pp();
        return pp._totalFame;  
    }

    function myFame() public view returns(uint64) {
        PeoplesPlatformStorage storage pp = pp();
        return pp._fameHoldings[msg.sender];  
    }
}
