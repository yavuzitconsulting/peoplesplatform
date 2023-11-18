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
      {"contractAddress":"0x188C8d37fb966713CbDc7cCc1A6ed3da060FFac3", "chainId": 501984},
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
  const chainId = Number((await provider.getNetwork()).chainId);

  // Find the contract address corresponding to the current chain ID
  const mapping = contractAddressMapping.find(m => m.chainId === chainId);
  if (!mapping) {
    console.log('chainid not found in mapping: '+chainId);
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

              
            case "PCE_REQUEST_CHAIN":
              let currentChainInfo = await getCurrentChainNameAndId();
              window.postMessage({ type: "PCE_RESPONSE_CHAIN", currentChainInfo }, "*");
              break;


            default:
                break;
        }
    } catch (error) {
        console.error("Error in message event listener:", error.message);
        // Handle the error appropriately
    }
});

async function getCurrentChainNameAndId()
{ 
  await initiateContract();
  const network = await provider.getNetwork();
  const chainId =Number(network.chainId);
  const chainName = network.name;

  return { chainId, chainName };
}

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
    await await initiateContract();
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
    await await initiateContract();
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

  //some ui behavior
// Get all elements with the specified class within elements with the specified ID
var elements = document.querySelectorAll('#pce-ext-inject div.replaceable');

// Check if any elements are found
if (elements.length > 0) {
    // Iterate over all found elements
    elements.forEach(function(element) {
        // Hide the original content
        element.style.display = 'none';

        // Create the new HTML structure
        var newHtml = document.createElement('div');
        newHtml.className = 'typing';
        newHtml.innerHTML = "<span></span><span></span><span></span>";

        // Append the new HTML after the hidden element
        element.parentNode.insertBefore(newHtml, element.nextSibling);
    });
} else {
    console.log("No elements with class 'replaceable' inside elements with ID 'pce-ext-inject' found.");
}


  //
  if (!ethereum.isMetaMask) {
      console.error('MetaMask is not available');
      return;
  }


  //dies here
  await await initiateContract();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; 


  try {
      const transaction = await contract.vote(url, upvote, receiver, title, currentMonth, currentYear);
      console.log('Transaction sent:', transaction.hash);
      await transaction.wait();
      console.log('Transaction confirmed');


      //end the ui stuff
// Iterate over all elements to restore their original state
elements.forEach(function(element) {
  // Make the element visible again
  element.style.display = '';

  // Remove the appended 'typing' element
  if (element.nextSibling && element.nextSibling.className === 'typing') {
      element.parentNode.removeChild(element.nextSibling);
  }
});

      //
  } catch (error) {

    

      //end the ui stuff
// Iterate over all elements to restore their original state
elements.forEach(function(element) {
  // Make the element visible again
  element.style.display = '';

  // Remove the appended 'typing' element
  if (element.nextSibling && element.nextSibling.className === 'typing') {
      element.parentNode.removeChild(element.nextSibling);
  }
});


      //
      console.error('Transaction failed:', error);
  }
}


