function injectScript(file, node) {
    const th = document.getElementsByTagName(node)[0];
    const s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

//the injected script acts out the actual command
window.onload = () => {
    console.log('generalScriptInjector injeting script');
    
    // Inject ethers.js library first
    injectScript(chrome.runtime.getURL('ethers.min-6.8.1.js'), 'body'); // Adjust the path as necessary

    injectScript(chrome.runtime.getURL('generalFunctionalityInjectedScript.js'), 'body'); 
};

//popup.html / popup.js cannot directly interact with the websites
//so they have to forward messages in the chrome runtime to the content script
//the content script then converts this to a message for the website itself
//since only the website can access metamask
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
  console.log('generalScriptInjector listener added');
    if (message.type === "PCE_DONATE_MESSAGE") {
      // Handle the donation amount
      let donationAmount = message.amount;
      let months = message.months;
      // Now, you can post this message to the webpage if needed
      window.postMessage({ type: "PCE_DONATE_MESSAGE", amount: donationAmount, months: months }, "*");
    }    
    
    
    if (message.type === "PCE_RECEIVE_MESSAGE") {
      let months = message.months;
        // Now, you can post this message to the webpage if needed
        window.postMessage({ type: "PCE_RECEIVE_MESSAGE", months: months }, "*");
      }

      
    if (message.type === "PCE_REQUEST_CHAIN") {
        // Now, you can post this message to the webpage if needed
        window.postMessage({ type: "PCE_REQUEST_CHAIN" }, "*");
      }

      
  });



  window.addEventListener('message', async function(event) {
    try {
        // Validate the source of the message
        if (event.source !== window) {
            throw new Error('Message source is not the same window.');
        }

        // Handling different message types
        switch (event.data.type) {
            case "PCE_RESPONSE_CHAIN":
                const currentChainInfo = event.data.currentChainInfo;
                chrome.runtime.sendMessage({type: "PCE_RESPONSE_CHAIN", currentChainInfo});

                break;

            default:
                break;
        }
    } catch (error) {
        console.error("Error in message event listener:", error.message);
        // Handle the error appropriately
    }
});

  
