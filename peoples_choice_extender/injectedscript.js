
const contractAddress = '0x...'; //tbd cg
const contractABI = [/* ... */]; //tbd cg


window.ethereum = window.ethereum || {};


console.log('Injected script executed.');

if (window.ethereum) {
    console.log('window.ethereum is available');
    window.postMessage({ type: "FROM_PAGE", text: "window.ethereum is available" }, "*");
} else {
    console.log('window.ethereum is not available');
    window.postMessage({ type: "FROM_PAGE", text: "window.ethereum is not available" }, "*");
}

function sendMessageToContentScript(message) {
    window.postMessage({ type: "FROM_PAGE", customMessage: message }, "*");
}


sendMessageToContentScript("Hello from injected script!");

window.addEventListener('message', async function(event) {
    try {
        
        if (event.source !== window) {
            throw new Error('Message source is not the same window.');
        }

        
        switch (event.data.type) {
            case "FROM_CONTENT":
                console.log("Message received from content script:", event.data);
                
                break;

            case "UPVOTE_CONTENT":
                console.log("Upvote message received:", event.data);

                
                if (!event.data.contentUrl || typeof event.data.contentUrl !== 'string') {
                    throw new Error('Invalid URL in the upvote message.');
                }

                const connected = await checkIfMetaMaskWalletIsConnected();
                if (!connected) {
                    await connectMetaMaskWallet();
                }
                if(!ethers){
                    console.log("ETHERS WAS NOT FOUND");
                }

                await callContractFunctionForVote(event.data.contentUrl, true);
                break;

            default:
                console.log("Unhandled message type:", event.data.type);
        }
    } catch (error) {
        console.error("Error in message event listener:", error.message);
        
    }
});






async function checkIfMetaMaskWalletIsConnected() {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
}

async function connectMetaMaskWallet() {
    try {
        await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
        console.error('User denied account access', error);
    }
}

async function callContractFunctionForVote(url, upvote) {
    if (!ethereum.isMetaMask) {
        console.error('MetaMask is not available');
        return;
    }


    //dies here
    const provider = provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
        const transaction = await contract.vote(url, upvote);
        console.log('Transaction sent:', transaction.hash);
        await transaction.wait();
        console.log('Transaction confirmed');
    } catch (error) {
        console.error('Transaction failed:', error);
    }
}