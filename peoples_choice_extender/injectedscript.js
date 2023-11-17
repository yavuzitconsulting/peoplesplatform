
const contractAddress = '0x...'; //tbd cg
const contractABI = [/* ... */]; //tbd cg


window.ethereum = window.ethereum || {};

//this is visible when this works
console.log('Injected script executed.');

// Check for window.ethereum and log the status (metamask)
if (window.ethereum) {
    console.log('window.ethereum is available');
    window.postMessage({ type: "FROM_PAGE", text: "window.ethereum is available" }, "*");
} else {
    console.log('window.ethereum is not available');
    window.postMessage({ type: "FROM_PAGE", text: "window.ethereum is not available" }, "*");
}

//test
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
                /
                break;

            case "UPVOTE_CONTENT":
                console.log("Upvote message received:", event.data);

                break;

            default:
                console.log("Unhandled message type:", event.data.type);
        }
    } catch (error) {
        console.error("Error in message event listener:", error.message);

    }
});




