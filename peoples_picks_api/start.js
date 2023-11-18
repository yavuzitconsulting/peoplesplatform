const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const ethers = require('ethers');

const app = express();
const port = 3000;
const host = '0.0.0.0';

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

const chainData = {
  cryptng: {
    rpcurl: "https://testnet.cryptng.xyz:8545",
    contractAddress: "0x188C8d37fb966713CbDc7cCc1A6ed3da060FFac3",
    data: [],
    latestBlockNumber: 0,
    fromBlock: 0,
    toBlock: 0,
    lastBlockNumber: undefined,
  },
  chiado: {
    rpcurl: "https://rpc.chiadochain.net",
    contractAddress: "0xffC39C76C68834FE1149554Ccc1a76C2F1281beD",
    data: [],
    latestBlockNumber: 0,
    fromBlock: 0,
    toBlock: 0,
    lastBlockNumber: undefined,
  },
  sepolia: {
    rpcurl: "https://sepolia-rpc.scroll.io/",
    contractAddress: "0x314AA36352771307E942FaeD6d8dfB2398916E92",
    data: [],
    latestBlockNumber: 0,
    fromBlock: 0,
    toBlock: 0,
    lastBlockNumber: undefined,
  },
  neonlabs: {
    rpcurl: "https://devnet.neonevm.org",
    contractAddress: "0x9A1554a110A593b5C137643529FAA258a710245C",
    data: [],
    latestBlockNumber: 0,
    fromBlock: 0,
    toBlock: 0,
    lastBlockNumber: undefined,
  }
};

let activeChain = chainData.cryptng; // Set the initial active chain

let _provider = new ethers.JsonRpcProvider(activeChain.rpcurl);
let _directNetworkContract = new ethers.Contract(activeChain.contractAddress, contractABI, _provider);
const _interface = _directNetworkContract.interface;


app.use(cors());

let data = [];
let refreshInterval = 5;

let intervalId = setInterval(loadData, refreshInterval * 1000); 

const itemsPerPage = 30;

app.get('/aggregate', async (req, res) => {
  try {
    const filterKeyword = req.query.filter;
    const page = req.query.p ? parseInt(req.query.p) : 1;
    const chainIdentifier = req.query.chain;
    
    if (chainIdentifier) {
      const selectedChain = chainData[chainIdentifier];
      console.log('aggregate started:');
      console.log('selectedChain', selectedChain);
      console.log('page', page);


      if (selectedChain) {
        // Change the active chain
        activeChain = selectedChain;
        console.log(`current chain ${activeChain} with length: ${activeChain.data.length}`);
        _provider = new ethers.JsonRpcProvider(activeChain.rpcurl);
        _directNetworkContract = new ethers.Contract(activeChain.contractAddress, contractABI, _provider);
  
        // Check if the chain data is already loaded
        if (activeChain.data.length === 0) {
          await loadData();
          console.log(`Active chain changed to ${chainIdentifier}`);
        }
  
      } else {
        return res.status(404).send('Chain identifier not found.');
      }
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Filter data
    let filteredData = activeChain.data;

    if (filterKeyword) {
      filteredData = activeChain.data.filter(item => {
        const hostMatch = getHost(item.url).toLowerCase().includes(filterKeyword.toLowerCase());
        return hostMatch;
      });
      console.log('Filtered Data length:', filteredData.length);
    }

    // Calculate up and downvotes, totalVotes, and trend
    const urlVotesMap = new Map();
    let totalUpvotes = 0;
    let totalDownvotes = 0;

    filteredData.forEach(item => {
      const voteValue = item.upvote ? 1 : -1;

      if (!urlVotesMap.has(item.url)) {
        urlVotesMap.set(item.url, {
          url: item.url,
          upvotes: 0,
          downvotes: 0,
          totalVotes: 0,
          trend: null,
          title: item.title,
          host: getHost(item.url),
        });
      }

      const currentData = urlVotesMap.get(item.url);
      currentData.upvotes += item.upvote ? 1 : 0;
      currentData.downvotes += item.upvote ? 0 : 1;
      currentData.totalVotes += voteValue;
      urlVotesMap.set(item.url, currentData);

      totalUpvotes += item.upvote ? 1 : 0;
      totalDownvotes += item.upvote ? 0 : 1;
    });

    // Calculate trend
    urlVotesMap.forEach((value, key) => {
      value.trend = value.upvotes + value.downvotes;
      urlVotesMap.set(key, value);
    });

    const aggregatedData = Array.from(urlVotesMap.values());

    // Paginate data
    const paginatedData = aggregatedData.slice(startIndex, endIndex);
    console.log('Paginated data length:', paginatedData.length);

    res.json(paginatedData);
  } catch (error) {
    console.error('Error processing aggregate request:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Refreshing stuff
app.get('/pp-load', (req, res) => {
  const interval = parseInt(req.query.interval);

  if (interval === -1) {
    // Stop refresh
    clearInterval(intervalId);
    refreshInterval = 0;
    res.send('Data refreshing stopped.');
  } else if (interval >= 0) {
    // set interval
    refreshInterval = interval;
    clearInterval(intervalId);
    intervalId = setInterval(loadData, refreshInterval * 1000);

    // Check if the chain data is already loaded
    if (activeChain.data.length === 0) {
      loadData();
    }

    res.send(`Data refreshing set to every ${interval} seconds.`);
  } else {
    res.status(400).send('Invalid interval parameter.');
  }
});

app.listen(port, host, () => {
    console.log(`Server running on http://localhost:${port}`);
});

function getHost(url) {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\?]+)/i);
    return match && match[1];
}

async function loadData() {
  try {
    const newData = await getVoteEvents();
    activeChain.data = [...activeChain.data, ...newData];
    console.log('Data loaded.');
    console.log('Refresh speed:' + refreshInterval);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

async function getVoteEvents() {
    let events = [];

    try {
        if (activeChain.lastBlockNumber === undefined) {
            // Initial fetch: get events from the latest 500 blocks
            activeChain.latestBlockNumber = await _provider.getBlockNumber();
            activeChain.fromBlock = Math.max(0, activeChain.latestBlockNumber - 1000);
            activeChain.toBlock = 'latest';

            const eventFilter = _directNetworkContract.filters.Voted();
            eventFilter.fromBlock = activeChain.fromBlock;
            eventFilter.toBlock = activeChain.toBlock;
            //console.log(eventFilter);
            const logs = await _provider.getLogs(eventFilter);
            console.log('Loading Initial Data...');
            for (const log of logs) {
             try {
              //console.log(log.data);
              const data = _interface.decodeEventLog("Voted", log.data);
              events.push({url: data.url, upvote: data.up, title: data.title});
             } catch (error) {
              console.error('Error fetching at initial Load', error);
             }
            }

            activeChain.lastBlockNumber = activeChain.latestBlockNumber;
        } else {
            // Subsequent fetch: get new events from the latest block onwards
            activeChain.latestBlockNumber = await _provider.getBlockNumber();
            if (activeChain.latestBlockNumber === activeChain.lastBlockNumber) {
                return events;
            }
            activeChain.fromBlock = activeChain.lastBlockNumber + 1;
            activeChain.toBlock = activeChain.latestBlockNumber;

            const eventFilter = _directNetworkContract.filters.Voted();
            eventFilter.fromBlock = activeChain.fromBlock;
            eventFilter.toBlock = activeChain.toBlock;
            //console.log(eventFilter);


            const logs = await _provider.getLogs(eventFilter);
            console.log('Loading New Data...');
            for (const log of logs) {
              try {
                //console.log(log.data);

                const data = _interface.decodeEventLog("Voted", log.data);
                events.push({url: data.url, upvote: data.up, title: data.title});
              } catch (error) {
                console.error('Error reinitial load' + error);
              }
            }  
            activeChain.lastBlockNumber = activeChain.latestBlockNumber;
        }
    } catch (error) {
        console.error('Error fetching vote events:', error);
    }

    return events;
}
