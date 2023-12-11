//injects like and dislike buttons for peoplesplatform
function injectCSS(file, node) {
  const th = document.getElementsByTagName(node)[0];
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', file);
  th.appendChild(link);
}


function injectUiElements() {
  setTimeout(() => { //move execution to the end of the event queue

    //only inject ui if it does not exist
    const extension = document.querySelector('#pce-ext-inject');
    if (extension) {
      return;
    }

    //detect if a wallet is in the post
    const microformatJsonRaw = document.querySelector('#microformat script[type="application/ld+json"]').text

    // Parse the JSON string into an object
    const microFormatJsonData = JSON.parse(microformatJsonRaw);

    // Extract the 'description' value
    const description = microFormatJsonData.description;

    const peoplesNetworkWalletRegex = /#peoplesnetwork:0x[a-fA-F0-9]+/;

    // Search for the pattern in the description
    const peoplesNetworkWalletRaw = description.match(peoplesNetworkWalletRegex);
    let peoplesNetworkWalletSanitized = "0x0000000000000000000000000000000000000000"; //TODO: CG, default value has to be checked in contract!
    if (peoplesNetworkWalletRaw) {
      // Remove '#peoplesnetwork:' from the matched string
      peoplesNetworkWalletSanitized = peoplesNetworkWalletRaw[0].replace("#peoplesnetwork:", "");
      console.debug(peoplesNetworkWalletSanitized); // Outputs the wallet address without '#peoplesnetwork:'
    } else {
      console.debug('peoplesNetworkWalletRaw Pattern not found');
    }


    let creatorHandle = document.querySelector('#container.style-scope.ytd-channel-name a').getAttribute('href');


    const receiver = peoplesNetworkWalletSanitized;

    const targetDiv = document.querySelector('ytd-app ytd-page-manager ytd-watch-flexy ytd-watch-metadata ytd-menu-renderer div#top-level-buttons-computed');

    if (targetDiv) {
      const customDiv = document.createElement('div');
      customDiv.id = 'pce-ext-inject';
      customDiv.style.display = "flex";
      customDiv.style.flexDirection = "row";
      customDiv.style.marginRight = "2rem";



      // Generate unique IDs for the buttons
      const buttonId = generateUniqueAlphanumericId();
      const buttonIdLike = buttonId + "L";
      const buttonIdDislike = buttonId + "D";

      // Combine the style tag and button HTML
      customDiv.innerHTML = `
              <div class="replaceable">
                <button id="${buttonIdLike}" class="pce-ext-button">&#x1F44D;</button> 
                <button id="${buttonIdDislike}" class="pce-ext-button">&#x1F44E;</button>
                </div>
              `;

      let videoUrl = window.location.href;

      const titleElement = document.querySelector("#title h1.style-scope.ytd-watch-metadata yt-formatted-string.style-scope.ytd-watch-metadata");

      let title = "unknown";
      if (titleElement) {
        title = titleElement.textContent.trim(); // This will retrieve the text content

      }




      targetDiv.prepend(customDiv);

      document.getElementById(buttonIdLike).addEventListener('click', () => {
        sendUpvoteToContentPageInteractions(receiver, videoUrl, title, creatorHandle);
      });
      document.getElementById(buttonIdDislike).addEventListener('click', () => {
        sendDownvoteToContentPageInteractions(receiver, videoUrl, title, creatorHandle);
      });
    }

  }, 3000);

}

function generateUniqueAlphanumericId() {
  const alphanumericCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) { // You can adjust the length of the ID as needed
    const randomIndex = Math.floor(Math.random() * alphanumericCharacters.length);
    id += alphanumericCharacters.charAt(randomIndex);
  }
  return id;
}

// This is your content script
function injectScript(file, node) {
  const th = document.getElementsByTagName(node)[0];
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th.appendChild(s);
}



// Listen for messages from the injected script
window.addEventListener('message', function (event) {
  // Ensure the message is from your injected script
  if (event.source === window && event.data.type && event.data.type == "FROM_PAGE") {
    console.debug("Message received from injected script:", event.data);
  }

  if (event.source === window && event.data.type && event.data.type == "PCE_SITE_NAVIGATED") {
    console.debug("Page was navigated");
    injectUiElements();
  }
});


function sendUpvoteToContentPageInteractions(receiver, url, title, handle) {
  window.postMessage({ type: "PCE_UPVOTE_CONTENT", receiver: receiver, contentUrl: url, title: title, handle: handle }, "*");
}
function sendDownvoteToContentPageInteractions(receiver, url, title, handle) {
  window.postMessage({ type: "PCE_DOWNVOTE_CONTENT", receiver: receiver, contentUrl: url, title: title, handle: handle }, "*");
}


setTimeout(() => {
  injectUiElements();
  
  
  // Ethers
  injectScript(chrome.runtime.getURL('lib/ethers.min-6.8.1.js'), 'body');
  // To interact with Metamask
  injectScript(chrome.runtime.getURL('lib/inject_metamaskInteraction.js'), 'body');
  // To interact with injected buttons
  injectScript(chrome.runtime.getURL('lib/inject_contentPageInteractions.js'), 'body');

}, 3000);