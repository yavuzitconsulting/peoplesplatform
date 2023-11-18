window.ethereum = window.ethereum || {};



// Example of sending a custom message to the content script
function sendMessageToContentScript(message) {
    window.postMessage({ type: "FROM_PAGE", customMessage: message }, "*");
}

function sendRefreshMessageToContentScript() {
    window.postMessage({ type: "PCE_SITE_NAVIGATED" }, "*");
    window.postMessage({ type: "PCE_SITE_SCROLLED" }, "*");
}

// Example usage
sendMessageToContentScript("Hello from injected script!");



window.addEventListener('message', async function(event) {
    try {
        // Validate the source of the message
        if (event.source !== window) {
            throw new Error('Message source is not the same window.');
        }
        let contentUrl = "";
        let title = "";
        let connected = false;
        // Handling different message types
        switch (event.data.type) {
            case "PCE_UPVOTE_CONTENT":
                console.log("Upvote message received:", event.data);

                contentUrl = event.data.contentUrl;
                title = event.data.title;
                receiver = event.data.receiver;
                // Validate the data in the message
                if (!contentUrl || typeof contentUrl !== 'string') {
                    throw new Error('Invalid URL in the upvote message.');
                }
                if (!title || typeof title !== 'string') {
                    throw new Error('Invalid Title in the upvote message.');
                }
                if (!receiver || typeof receiver !== 'string') {
                    throw new Error('Invalid Receiver in the upvote message.');
                }
                connected = await checkIfMetaMaskWalletIsConnected();
                if (!connected) {
                    await connectMetaMaskWallet();
                }
                if(!ethers){
                    console.log("ETHERS WAS NOT FOUND");
                }

                await callContractFunctionForVote(receiver, contentUrl, true, title);
                break;
                
            case "PCE_DOWNVOTE_CONTENT":
                console.log("Downvote message received:", event.data);
                contentUrl = event.data.contentUrl;
                title = event.data.title;
                receiver = event.data.receiver;

                // Validate the data in the message
                if (!contentUrl || typeof contentUrl !== 'string') {
                    throw new Error('Invalid URL in the upvote message.');
                }
                if (!title || typeof title !== 'string') {
                    throw new Error('Invalid Title in the upvote message.');
                }
                if (!receiver || typeof receiver !== 'string') {
                    throw new Error('Invalid Receiver in the upvote message.');
                }

                connected = await checkIfMetaMaskWalletIsConnected();
                if (!connected) {
                    await connectMetaMaskWallet();
                }
                if(!ethers){
                    console.log("ETHERS WAS NOT FOUND");
                }

                await callContractFunctionForVote(receiver, contentUrl, false, title);
                break;

            default:
                break;
        }
    } catch (error) {
        // Handle the error appropriately
    }
});






//reaction or non-reaction to these listeners can be implemented
//on a per platform basis
window.navigation.addEventListener("navigate",(e)=> {
    console.log('navigate event');
    sendRefreshMessageToContentScript();
});

window.addEventListener("scroll", (e) => {
    console.log('scroll event');
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
