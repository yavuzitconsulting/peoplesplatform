function injectCustomDiv() {
    setTimeout(()=>{ //move execution to the end of the event queue
        console.log('injected');

      const extension =  document.querySelector('#pce-ext-inject');

      if(extension)
      {
        return;
      }
      let compatible =false;
      //check if the content is compatible with the extension
      //detect if a wallet is in the post
      const microformatJsonRaw = document.querySelector('#microformat script[type="application/ld+json"]').text

      // Parse the JSON string into an object
      const microFormatJsonData = JSON.parse(microformatJsonRaw);

      // Extract the 'description' value
      const description = microFormatJsonData.description;

      const peoplesNetworkWalletRegex = /#peoplesnetwork:0x[a-fA-F0-9]+/;

      // Search for the pattern in the description
      const peoplesNetworkWalletRaw = description.match(peoplesNetworkWalletRegex);
      let peoplesNetworkWalletSanitized;
      if (peoplesNetworkWalletRaw) {
          // Remove '#peoplesnetwork:' from the matched string
          peoplesNetworkWalletSanitized = peoplesNetworkWalletRaw[0].replace("#peoplesnetwork:", "");
          console.log(peoplesNetworkWalletSanitized); // Outputs the wallet address without '#peoplesnetwork:'
      } else {
          console.log('peoplesNetworkWalletRaw Pattern not found');
      }


      if (isValidEthereumAddress(peoplesNetworkWalletSanitized)) {
         compatible = true;
      } else {
          console.log('Invalid Ethereum wallet address');
      }
      
      
      if(!compatible)
      {
        return;
      }
      const receiver = peoplesNetworkWalletSanitized;
        
        const targetDiv = document.querySelector('ytd-app ytd-page-manager ytd-watch-flexy ytd-watch-metadata ytd-menu-renderer div#top-level-buttons-computed');
        
        if (targetDiv) {
          const customDiv = document.createElement('div');
          customDiv.id = 'pce-ext-inject';
            customDiv.style.display="flex";
            customDiv.style.flexDirection="row";
            customDiv.style.marginRight="2rem";
                          
              // Define the style tag as a string
              const buttonStyle = `
                <style>
                  .pce-ext-button {
                    background: none; 
                    cursor: pointer; 
                    outline: none; 
                    padding: 0; 
                    margin: 0; 
                    width: 3rem; 
                    user-select: none; 
                    border: white solid 1px; 
                    height: 3rem; 
                    border-radius: 20%;
                    transition: background-color 0.3s, border-color 0.3s; /* Smooth transition */
                  }

                  .pce-ext-button:hover {
                    background-color: #f0f0f0; /* Hover background color */
                    border-color: #d0d0d0; /* Hover border color */
                  }
                </style>
              `;

              // Generate unique IDs for the buttons
              const buttonId = generateUniqueAlphanumericId();
              const buttonIdLike = buttonId + "L";  
              const buttonIdDislike = buttonId + "D";  

              // Combine the style tag and button HTML
              customDiv.innerHTML = buttonStyle + `
              <div class="replaceable">
                <button id="${buttonIdLike}" class="pce-ext-button">&#x1F44D;</button> 
                <button id="${buttonIdDislike}" class="pce-ext-button">&#x1F44E;</button>
                </div>
              `;

                  let videoUrl = window.location.href;

                  const titleElement = document.querySelector("#title h1.style-scope.ytd-watch-metadata yt-formatted-string.style-scope.ytd-watch-metadata");

                  let title ="unknown";
                  if (titleElement) {
                      title = titleElement.textContent.trim(); // This will retrieve the text content
                      
                  }


                

          targetDiv.prepend(customDiv);
      
          document.getElementById(buttonIdLike).addEventListener('click', () => {
            sendUpvoteMessageToInjectedScript(receiver, videoUrl, title);
            });
          document.getElementById(buttonIdDislike).addEventListener('click', () => {
              sendDownvoteMessageToInjectedScript(receiver, videoUrl, title);
          });
        }

    },3000);
    
  }


  function isValidEthereumAddress(address) {
    // Check if the address is a string and 42 characters long
    if (typeof address !== 'string' || address.length !== 42) {
        return false;
    }

    // Regular expression to check if it's a valid hexadecimal string with '0x' prefix
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(address);
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
window.addEventListener('message', function(event) {
    // Ensure the message is from your injected script
    if (event.source === window && event.data.type && event.data.type == "FROM_PAGE") {
        console.log("Message received from injected script:", event.data);
    }
    
    if (event.source === window && event.data.type && event.data.type == "PCE_SITE_NAVIGATED") {
        console.log("Page was navigated");
        injectCustomDiv();
    }
});


function sendUpvoteMessageToInjectedScript(receiver, url, title) {
  window.postMessage({ type: "PCE_UPVOTE_CONTENT",receiver:receiver, contentUrl: url, title: title }, "*");
}
function sendDownvoteMessageToInjectedScript(receiver, url, title) {
  window.postMessage({ type: "PCE_DOWNVOTE_CONTENT",receiver:receiver, contentUrl: url, title: title  }, "*");
}


setTimeout(()=>{
  injectCustomDiv();

  // Then inject your custom script
  injectScript(chrome.runtime.getURL('contentPageInjectedScript.js'), 'body');

},3000);