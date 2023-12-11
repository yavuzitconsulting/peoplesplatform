// Ensure Metamask object is available
window.ethereum = window.ethereum || {};

// Function to send refresh messages, indicating navigation or scroll events
function sendRefreshMessageToPageScript() {
    window.postMessage({ type: "PCE_SITE_NAVIGATED" }, "*");
    window.postMessage({ type: "PCE_SITE_SCROLLED" }, "*");
}

// Function to check if the MetaMask wallet is connected
async function checkIfMetaMaskWalletIsConnected() {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
}

// Function to request connection to MetaMask wallet, handling user denial
async function connectMetaMaskWallet() {
    try {
        await ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
        console.error('User denied account access', error);
    }
}

// Function to validate message data and ensure wallet connection
async function validateAndConnect(receiver, contentUrl, title) {
    // Validation of message data
    if (!contentUrl || typeof contentUrl !== 'string') {
        throw new Error('Invalid URL in the message.');
    }
    if (!title || typeof title !== 'string') {
        throw new Error('Invalid Title in the message.');
    }
    if (!receiver || typeof receiver !== 'string') {
        throw new Error('Invalid Receiver in the message.');
    }

    // Check for MetaMask wallet connection and attempt to connect if not connected
    const connected = await checkIfMetaMaskWalletIsConnected();
    if (!connected) {
        await connectMetaMaskWallet();
    }

    // Check for the presence of 'ethers' library and handle its absence
    if (typeof ethers === 'undefined') {
        console.debug("ETHERS WAS NOT FOUND");
        // Add handling or notification if ethers is not available
    }
}

// Unified event listener for handling both upvote and downvote messages
window.addEventListener('message', async function (event) {
    try {
        // Ensure messages are only handled if they originate from the same window
        if (event.source !== window) {
           return;
        }

        let { contentUrl, title, receiver, handle } = event.data;

        // Handle different types of messages
        switch (event.data.type) {
            case "PCE_UPVOTE_CONTENT":
            case "PCE_DOWNVOTE_CONTENT":
                console.debug(event.data.type + " message received:", event.data);
                // Validation and wallet connection
                await validateAndConnect(receiver, contentUrl, title);
                // TODO: Implement API for wallet validation and temporary wallet creation
                await callContractFunctionForVote(receiver, contentUrl, event.data.type === "PCE_UPVOTE_CONTENT", title, handle);
                break;
            default:
                console.debug("Unhandled message type:", event.data.type);
        }
    } catch (error) {
        console.error(error);
    }
});

// Event listeners for navigation and scroll events to send refresh messages
window.navigation.addEventListener("navigate", () => {
    console.debug('navigate event');
    sendRefreshMessageToPageScript();
});

window.addEventListener("scroll", () => {
    console.debug('scroll event');
    sendRefreshMessageToPageScript();
});
