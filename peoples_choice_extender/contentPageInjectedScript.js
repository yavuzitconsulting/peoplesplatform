window.ethereum = window.ethereum || {};



// Example of sending a custom message to the content script
function sendMessageToContentScript(message) {
    window.postMessage({ type: "FROM_PAGE", customMessage: message }, "*");
}
// Example of sending a custom message to the content script
function sendRefreshMessageToContentScript() {
    window.postMessage({ type: "PCE_SITE_NAVIGATED" }, "*");
}

// Example usage
sendMessageToContentScript("Hello from injected script!");



window.addEventListener('message', async function(event) {
    try {
        // Validate the source of the message
        if (event.source !== window) {
            throw new Error('Message source is not the same window.');
        }
        let connected = false;
        // Handling different message types
        switch (event.data.type) {
            case "PCE_UPVOTE_CONTENT":
                console.log("Upvote message received:", event.data);

                // Validate the URL in the message
                if (!event.data.contentUrl || typeof event.data.contentUrl !== 'string') {
                    throw new Error('Invalid URL in the upvote message.');
                }

                connected = await checkIfMetaMaskWalletIsConnected();
                if (!connected) {
                    await connectMetaMaskWallet();
                }
                if(!ethers){
                    console.log("ETHERS WAS NOT FOUND");
                }

                await callContractFunctionForVote(event.data.contentUrl, true);
                break;
                
            case "PCE_DOWNVOTE_CONTENT":
                console.log("Downvote message received:", event.data);

                // Validate the URL in the message
                if (!event.data.contentUrl || typeof event.data.contentUrl !== 'string') {
                    throw new Error('Invalid URL in the downvote message.');
                }

                connected = await checkIfMetaMaskWalletIsConnected();
                if (!connected) {
                    await connectMetaMaskWallet();
                }
                if(!ethers){
                    console.log("ETHERS WAS NOT FOUND");
                }

                await callContractFunctionForVote(event.data.contentUrl, false);
                break;

            default:
                break;
        }
    } catch (error) {
        console.error("Error in message event listener:", error.message);
        // Handle the error appropriately
    }
});







window.navigation.addEventListener("navigate",(e)=> {
    
    console.log('christian debugs like this for some reason');
    sendRefreshMessageToContentScript();
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