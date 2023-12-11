const { ethers } = require("hardhat");

const fs = require('fs');

const provider = new ethers.providers.JsonRpcProvider('https://devnet.neonevm.org'); //neon
// const provider = new ethers.providers.JsonRpcProvider('https://sepolia-rpc.scroll.io/'); //scroll
// const provider = new ethers.providers.JsonRpcProvider('https://rpc.chiadochain.net'); //chiado
// const provider = new ethers.providers.JsonRpcProvider('https://testnet.cryptng.xyz:8545'); //testnet

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

const contractAddress = '0x68AF7F21e3D6D3F38de67a6E0535e9249170BD10';  // set to current contract address NEON
// const contractAddress = '0x314AA36352771307E942FaeD6d8dfB2398916E92';  // set to current contract address SCROLL
// const contractAddress = '0xffC39C76C68834FE1149554Ccc1a76C2F1281beD';  // set to current contract address CHIADO
// const contractAddress = '0x006cA8c68834EaD3292C503ac62c0d1eC9fa2DA7';  // set to current contract address TESTNET



//new ethers.Wallet( privateKey [ , provider ] )

const receivers=[
'0xf50391cBb6839B98aA2046d297A93CE721165c94',
'0xBD881c22F6B96622F9B255A7f610801EcFb6b607',
'0xa2699C99C1Ba68dc2D7Ac6218550F51811e4e6B3',
'0xd2c57DE20B5D3A62741e18E13D9A8BfF400FeDCE',
'0xe22438542995Ca4b92d9A73608ECB5110874d115',
'0x2933098948Ef75d1912b180D6F23dfbd5e1Ce436',
'0xAB85dd11Ff682be903cB3a93bdC74AaAbE6f75fa',
'0xcd3a86F4924c37f3CaCFAFE3BBa3e25B731152e5',
'0x609790d1cbE715Bc6F059d5d9B4A002F49a49753',
'0xB1d7E9A13B8760A504840B6871bc74e77678A3F4',
'0x1eBBa1CF4775536A585D6502F5C9bFb338091c93',
'0xBE789550EfA777cf0e88c01cC8c4F59680DbE18f',
'0x20D481944046EfC4766Dec9F6C82B68B0B5151D1',
'0xcFDa5F844a67a1CBaEF44dBc4489D1662588152c',
'0x894b69Fb39C355217a5fBc587d68bD8EAB673D17',
'0xD7f25fbbC13Ff9Cb85e674ced866A3bf019dE9CE',
'0xEE877c33eA5cDd43636ae5156b2584073E87568E',
'0x94614CE211187A617e59e869a174Eb1D422bc7E4',
'0x4dDBe194d0827e355837AF0D6E090C7610e2f3a1',
'0x90785D6446A45F4348B669087E5Ccc5fC26E6804',
'0x60cd69e1ef1387e63C090271c738dF778f5A9177',
'0xB2008251f2bF199329142Fa599F27fB9468D1aF4',
'0x7314697470f4a8C57C577447f9244728Fd4079b0',
'0xbBe02A0FAF6bc344317E9BE80C5dE5ae44AA0f23'
];


async function voteFromCsvFile() {
  const accounts = await ethers.getSigners();
  console.log(accounts[0]);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  const signerContract = contract.connect(accounts[0]);

    const allUrls = fs.readFileSync('data/toVoteUrls.csv', 'utf-8');
    const allUlrLines = allUrls.split('\n').slice(1); // remove the header

    const curYear = new Date().getFullYear();
    const curMonth = new Date().getMonth();
    const urls = [];
    
    for (let line of allUlrLines) {
      const upVote = Math.floor(Math.random() * 10) % 2 ===1;
      const receiver = receivers[ Math.floor(Math.random() * 1000) % 24] ;
        const [url, title] = line.split(',');
        if(url!==undefined)
            urls.push({
        url:url,
        up:upVote,
        title:title,
        receiver:receiver
        });
    }
    //console.log(urls);
    for (let url of urls) {
        const upVote = Math.floor(Math.random() * 10) % 2 ===1;
        try{
            const gasEstimated = ethers.utils.hexlify(await signerContract.estimateGas.vote(url.url,url.up,url.receiver,url.title,curMonth,curYear));
                        
            console.log('gp:'+gasEstimated);
        
            const tx = await signerContract.vote(url.url,url.up,url.receiver,url.title,curMonth,curYear);
                    
            console.log("tx: " + await tx.wait());

            
        }
        catch (e){
            console.log(url);
            console.log(e);
        }
        
    }

   
}

voteFromCsvFile() ;
