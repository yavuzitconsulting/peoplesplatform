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
  "501984": {
    rpcurl: "https://testnet.cryptng.xyz:8545",
    contractAddress: "0x188C8d37fb966713CbDc7cCc1A6ed3da060FFac3",
    data: [],
    latestBlockNumber: 0,
    fromBlock: 4110,
    toBlock: 0,
    lastBlockNumber: undefined,
    
  },
  "10200": {
    rpcurl: "https://rpc.chiadochain.net",
    contractAddress: "0xffC39C76C68834FE1149554Ccc1a76C2F1281beD",
    data: [],
    latestBlockNumber: 0,
    fromBlock: 7032222,
    toBlock: 0,
    lastBlockNumber: undefined,
  },
  "534351": {
    rpcurl: "https://sepolia-rpc.scroll.io/",
    contractAddress: "0x314AA36352771307E942FaeD6d8dfB2398916E92",
    data: [],
    latestBlockNumber: 0,
    fromBlock: 2305820,
    toBlock: 0,
    lastBlockNumber: undefined,
  },
  "245022926": {
    rpcurl: "https://devnet.neonevm.org",
    contractAddress: "0x9A1554a110A593b5C137643529FAA258a710245C",
    data: [],
    latestBlockNumber: 0,
    fromBlock: 259098931,
    toBlock: 0,
    lastBlockNumber: undefined,
  }
};
//loop through chainData object keys and add provider, contract and interfaces
Object.keys(chainData).forEach(key => {
  let chain = chainData[key];
  chain.provider = new ethers.JsonRpcProvider(chain.rpcurl);
  chain.contract = new ethers.Contract(chain.contractAddress, contractABI, chain.provider);
  chain.interface = chain.contract.interface;
})

app.use(cors());

let data = [];
let refreshInterval = 5;
let intervalId = null;
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

        // Check if the chain data is already loaded
          await loadData(selectedChain);
          console.log(`Active chain changed to ${chainIdentifier}`);
        
  
      } else {
        return res.status(404).send('Chain identifier not found.');
      }
    

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Filter data
    let filteredData = selectedChain.data;

    if (filterKeyword) {
      filteredData = selectedChain.data.filter(item => {
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
}
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

async function loadData(chain) {
  try {
    const newData = await getVoteEvents(chain);
    chain.data = [...chain.data, ...newData];
    console.log('Data loaded.');
    console.log('Refresh speed:' + refreshInterval);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

async function getVoteEvents(chain) {
    let events = [];
    try {
        if (chain.lastBlockNumber === undefined) {
            chain.latestBlockNumber = await chain.provider.getBlockNumber();
            chain.toBlock = 'latest';

            const eventFilter = chain.contract.filters.Voted();
            eventFilter.fromBlock = chain.fromBlock;
            eventFilter.toBlock = chain.toBlock;
            //console.log(eventFilter);
            const logs = await chain.provider.getLogs(eventFilter);
            console.log('Loading Initial Data...');
            console.log('new fromBlock1:', chain.lastBlockNumber);
            for (const log of logs) {
             try {
              const data = chain.interface.decodeEventLog("Voted", log.data);

              if (data.title !== '') {
                events.push({url: data.url, upvote: data.up, title: data.title});
            } else {
                console.warn('Empty title found in decoded data:', data);
            }
            } catch (error) {
              console.error('Error fetching at initial Load', error);
             }
            }

            chain.lastBlockNumber = chain.latestBlockNumber;
        } else {
            // Subsequent fetch: get new events from the latest block onwards
            chain.latestBlockNumber = await chain.provider.getBlockNumber();
            if (chain.latestBlockNumber === chain.lastBlockNumber) {
                return events;
            }
            chain.fromBlock = chain.lastBlockNumber + 1;
            chain.toBlock = chain.latestBlockNumber;

            const eventFilter = chain.contract.filters.Voted();
            eventFilter.fromBlock = chain.fromBlock;
            eventFilter.toBlock = chain.toBlock;
            //console.log(eventFilter);


            const logs = await chain.provider.getLogs(eventFilter);
            console.log('Loading New Data...');
            console.log('new fromBlock2:', chain.lastBlockNumber);

            for (const log of logs) {
              try {
                //console.log(log.data);

                const data = chain.interface.decodeEventLog("Voted", log.data);
                events.push({url: data.url, upvote: data.up, title: data.title});
              } catch (error) {
                console.error('Error reinitial load' + error);
              }
            }  
            chain.lastBlockNumber = chain.latestBlockNumber;
        }
    } catch (error) {
        console.error('Error fetching vote events:', error);
    }
    console.log(chain.lastBlockNumber);
    return events;
}
