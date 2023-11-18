// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract PeoplesPlatform {

    event Voted(string url,bool up);

    mapping(uint32 => uint32) _monthDonationBuckets; 
    mapping(uint32 => address[]) _monthIdAddresses;
    mapping(uint256 => int32) _monthAddresIdVoteValues;
    mapping(uint256 => bool) _monthAddressHasVotes;
    mapping(uint256 => bool) _monthAddressHasTransfered;

 
    function donate(uint16 months,uint16 currentMonth,uint16 currentYear) public payable {
        require(months < 25, "Only upto 24 months is supported");
        require(msg.value % months == 0, "Payed amount must be devidable by the distributed months");
        require(msg.value % 1_000_000_000_000_000  == 0, "Less than 1 finney(1/1000 ETH) fractions are not supported");

        uint256 donatedValue = msg.value / 1_000_000_000_000_000;
        uint32 perMonthValue = uint32(donatedValue / months);
        uint32 currentYearMonthBase = uint32(currentYear)*100; 
        uint16 startMonth = currentMonth + 1;

        for (uint16 i = startMonth; i < startMonth + months; i++) {
         
            uint16 yearsToAdd = uint16((i - 1) / 12 ) * 100;   
            uint16 monthsToAdd = ((i-1) % 12) + 1;
            uint32 monthId = currentYearMonthBase + yearsToAdd + monthsToAdd;
            _monthDonationBuckets[monthId]=_monthDonationBuckets[monthId]+perMonthValue;

        }

    }

    function vote(bool up,address receiver, string memory url,uint16 currentMonth,uint16 currentYear ) public{
        uint32 monthId = uint32(currentYear) * 100 + currentMonth;
        uint256 monthAddressId = (uint256(uint160(receiver)) << 20) +monthId;
        if(!_monthAddressHasVotes[monthAddressId]){
            _monthAddressHasVotes[monthAddressId]=true;
            _monthAddresIdVoteValues[monthAddressId]=0;
            _monthIdAddresses[monthId].push(receiver);
        }

        if(up){
            _monthAddresIdVoteValues[monthAddressId]++;
        }else{
            _monthAddresIdVoteValues[monthAddressId]--;
        }

        emit Voted(url, up);
    }

    function transfer(address payable to, uint16 month, uint16 year,uint16 currentMonth,uint16 currentYear) public {
        uint32 curMonthId = uint32(currentYear) * 100 + currentMonth;
        uint32 monthId = uint32(year) * 100 + month;
        require(monthId < curMonthId,"Your can only transfer your share for month before the current one");
        uint256 monthSenderAddressId = (uint256(uint160(msg.sender)) << 20) +monthId;
        require(_monthAddressHasTransfered[monthSenderAddressId]==false,"Share already transfered");
        require(_monthAddresIdVoteValues[monthSenderAddressId]>0,"You have not enough upvotes to be eligible");
        
        uint64 voteSum = 0;
        for (uint i=0; i<_monthIdAddresses[monthId].length; i++) {
            uint256 monthAddressId=(uint256(uint160(_monthIdAddresses[monthId][i])) << 20) +monthId;
            if(_monthAddresIdVoteValues[monthAddressId]>0){
                voteSum = voteSum + uint32(_monthAddresIdVoteValues[monthAddressId]);
            }
        }
        uint256 shareFinney = (_monthDonationBuckets[monthId] *  uint32(_monthAddresIdVoteValues[monthSenderAddressId])) / (voteSum );
        _monthAddressHasTransfered[monthSenderAddressId]=true;
        to.transfer(shareFinney*1_000_000_000_000_000);
    }
}