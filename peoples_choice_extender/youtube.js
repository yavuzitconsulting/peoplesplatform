function injectCustomDiv() {
    setTimeout(()=>{ //move execution to the end of the event queue
        console.log('injected');

        const targetDiv = document.querySelector('ytd-app ytd-page-manager ytd-watch-flexy ytd-watch-metadata ytd-menu-renderer div#top-level-buttons-computed');
        if (targetDiv) {
          const customDiv = document.createElement('div');
          customDiv.className = 'custom-mine';
          customDiv.style.background = 'white';
          customDiv.innerHTML = '<button id="myButton">Click me</button>';
      
          targetDiv.prepend(customDiv);
      
          document.getElementById('myButton').addEventListener('click', () => {
            //here we want to check if the wallet is connected etc, we do that with the injectorScript
            sendUpvoteMessageToInjectedScript(window.location.href)
          });
        }

    },3000);
    
  }


  // this will inject a script into the website we are on
function injectScript(file, node) {
    const th = document.getElementsByTagName(node)[0];
    const s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}


// how to send message to the injected script
function sendMessageToInjectedScript(message) {
    window.postMessage({ type: "FROM_CONTENT", customMessage: message }, "*");
}

function sendUpvoteMessageToInjectedScript(url) {
    window.postMessage({ type: "UPVOTE_CONTENT", contentUrl: url }, "*");
}

// listener for messages from the injected script
window.addEventListener('message', function(event) {
    
    if (event.source === window && event.data.type && event.data.type == "FROM_PAGE") {
        console.log("Message received from injected script:", event.data);
    }
});



window.onload = () => {
    injectCustomDiv();

    // Inject ethers.js library first (important)
    injectScript(chrome.runtime.getURL('ethers.min-6.8.1.js'), 'body'); // Adjust the path as necessary

    injectScript(chrome.runtime.getURL('injectedscript.js'), 'body');

    //test
    sendMessageToInjectedScript("Hello from content script!");
};