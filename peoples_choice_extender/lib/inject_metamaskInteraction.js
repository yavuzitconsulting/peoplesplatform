
// Global variables to store the contract ABI and address mapping
let contractAddress, provider, signer, contract;

// Initiates the contract by setting up the provider, signer, and contract instance
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

// Check for window.ethereum and log the status
if (window.ethereum) {
  console.log('window.ethereum is available');
  window.postMessage({ type: "FROM_PAGE", text: "window.ethereum is available" }, "*");
} else {
  console.log('window.ethereum is not available');
  window.postMessage({ type: "FROM_PAGE", text: "window.ethereum is not available" }, "*");
}


// Retrieve current chain name and ID
async function getCurrentChainNameAndId() { 
  await initiateContract();
  const network = await provider.getNetwork();
  return { chainId: network.chainId, chainName: network.name };
}

// Function to convert decimal values to BigInt, used for Ethereum transactions
function multiplyDecimalWithBigInt(decimal, bigInt) {
  const decimalPlaces = (decimal.toString().split('.')[1] || '').length;
  const scaleFactor = 10 ** decimalPlaces;
  const scaledDecimal = BigInt(Math.round(decimal * scaleFactor));
  return (scaledDecimal * bigInt) / BigInt(scaleFactor);
}

// Function to handle voting transactions
async function callContractFunctionForVote(receiver, url, upvote, title) {
  if (!ethereum.isMetaMask) {
      console.error('MetaMask is not available');
      return;
  }

  await initiateContract();
  const currentDate = new Date();
  try {
      const transaction = await contract.vote(url, upvote, receiver, title, currentDate.getMonth() + 1, currentDate.getFullYear());
      console.log('Vote transaction sent:', transaction.hash);
      await transaction.wait();
      console.log('Vote transaction confirmed');
  } catch (error) {
      console.error('Vote transaction failed:', error);
  }
}



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
    {"contractAddress":"0x314AA36352771307E942FaeD6d8dfB2398916E92", "chainId": 534351},
    {"contractAddress":"0x9A1554a110A593b5C137643529FAA258a710245C", "chainId": 245022926},
    {"contractAddress":"0xffC39C76C68834FE1149554Ccc1a76C2F1281beD", "chainId": 10200}
  ]
;

