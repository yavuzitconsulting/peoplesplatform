const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "url",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "up",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        }
      ],
      "name": "Voted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint16",
          "name": "months",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "currentMonth",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "currentYear",
          "type": "uint16"
        }
      ],
      "name": "donate",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "setDonatingActive",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint16",
          "name": "month",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "year",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "currentMonth",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "currentYear",
          "type": "uint16"
        }
      ],
      "name": "transfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "url",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "up",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint16",
          "name": "currentMonth",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "currentYear",
          "type": "uint16"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  let contractAddressMapping = 
  
    [
      {"contractAddress":"0x188C8d37fb966713CbDc7cCc1A6ed3da060FFac3", "chainId": 51984},
      {"contractAddress":"TBD", "chainId": 1},
      {"contractAddress":"TBD", "chainId": 2},
      {"contractAddress":"TBD", "chainId": 3},
      {"contractAddress":"TBD", "chainId": 4},
    ]
  ;
  let contractAddress;
  

  let provider ;
  let signer ;
  let contract ;

  async function initiateContract()
  {
    
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  
  // Get the current chain ID from MetaMask
  const chainId = (await provider.getNetwork()).chainId;

  // Find the contract address corresponding to the current chain ID
  const mapping = contractAddressMapping.find(m => m.chainId === chainId);
  if (!mapping) {
    throw new Error(`Contract address not found for chain ID ${chainId}`);
  }

  contractAddress = mapping.contractAddress;

  contract = new ethers.Contract(contractAddress, contractABI, signer);
  }

window.ethereum = window.ethereum || {};


// Check for window.ethereum and log the status
if (window.ethereum) {
    console.log('window.ethereum is available');
    window.postMessage({ type: "FROM_PAGE", text: "window.ethereum is available" }, "*");
} else {
    console.log('window.ethereum is not available');
    window.postMessage({ type: "FROM_PAGE", text: "window.ethereum is not available" }, "*");
}

console.log('this script has been injected by generalScriptInjector');

window.addEventListener('message', async function(event) {
    try {
        // Validate the source of the message
        if (event.source !== window) {
            throw new Error('Message source is not the same window.');
        }

        // Handling different message types
        switch (event.data.type) {
            case "PCE_DONATE_MESSAGE":
                let dmonths = event.data.months;
                let damount = event.data.amount;
                callContractFunctionForDonate(damount,dmonths);
                break;

            case "PCE_RECEIVE_MESSAGE":
              let tmonths = event.data.months;
              callContractFunctionForReceive(tmonths);
              break;
            default:
                break;
        }
    } catch (error) {
        console.error("Error in message event listener:", error.message);
        // Handle the error appropriately
    }
});



function multiplyDecimalWithBigInt(decimal, bigInt) {
    // Find the number of decimal places in the input
    const decimalPlaces = Math.max(0, (decimal.toString().split('.')[1] || '').length);
    const scaleFactor = 10 ** decimalPlaces;

    // Convert the decimal to an integer based on the scaleFactor
    const scaledDecimal = BigInt(Math.round(decimal * scaleFactor));

    // Multiply the scaled decimal with the BigInt and adjust for the scale factor
    return (scaledDecimal * bigInt) / BigInt(scaleFactor);
}

async function callContractFunctionForDonate(amount, months) {
    if (!ethereum.isMetaMask) {
        console.error('MetaMask is not available');
        return;
    }


    //dies here
    await initiateContract();
    const factor = BigInt(1000000000000000000);
    const weiAmount = multiplyDecimalWithBigInt(amount, factor,);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; 

    try {
        const transaction = await contract.donate(months, currentMonth, currentYear, {value:weiAmount});
        console.log('Transaction sent:', transaction.hash);
        await transaction.wait();
        console.log('Transaction confirmed');
    } catch (error) {
        console.error('Transaction failed:', error);
    }
}


async function callContractFunctionForReceive(months) {
  if (!ethereum.isMetaMask) {
      console.error('MetaMask is not available');
      return;
  }


  //dies here
    await initiateContract();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; 
  const receiver = await signer.getAddress();

  try {
      const transaction = await contract.transfer(receiver,currentMonth, currentYear,currentMonth, 2024);
      console.log('Transaction sent:', transaction.hash);
      await transaction.wait();
      console.log('Transaction confirmed');
  } catch (error) {
      console.error('Transaction failed:', error);
  }
}



async function callContractFunctionForVote(receiver, url, upvote, title) {
  if (!ethereum.isMetaMask) {
      console.error('MetaMask is not available');
      return;
  }


  //dies here
  await initiateContract();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; 


  try {
      const transaction = await contract.vote(url, upvote, receiver, title, currentMonth, currentYear);
      console.log('Transaction sent:', transaction.hash);
      await transaction.wait();
      console.log('Transaction confirmed');
  } catch (error) {
      console.error('Transaction failed:', error);
  }
}


