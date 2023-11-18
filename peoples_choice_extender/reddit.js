function injectCustomDiv() {

   
    setTimeout(() => { // Move execution to the end of the event queue
        console.log('injected');
        let compatible = false;
        //there are multiple elements that look like this: <slot name="share-button">
        //append the button to these elements
        const shredditPosts = document.querySelectorAll('shreddit-post');
        //this is true when we are inside the actual post (not popup)
        if(!shredditPosts || shredditPosts.length == 0)
        {
            const postContainerElements = document.querySelectorAll('div[data-testid="post-container"]');
            postContainerElements.forEach((postContainerElement)=>{
                let elex =  postContainerElement.querySelector('#pce-ext-inject');

                if(elex)
                {
                  return;
                }
            const anchorTags = postContainerElement.querySelectorAll('a');
            let peoplesNetworkWalletSanitized = '';

            for (const anchorTag of anchorTags) {
                // Check if the text content of <a> tag is '#peoplesnetwork'
                if (anchorTag.textContent === '#peoplesnetwork') {
                    // Get the next sibling text node of the <a> tag
                    const siblingText = anchorTag.nextSibling.textContent;

                    // Extract the part after '#peoplesnetwork'
                    const parts = siblingText.split(':');
                    if (parts.length > 1) {
                        peoplesNetworkWalletSanitized = parts[1];
                        break; // Stop the loop once the match is found
                    }
                }
            }

            if (peoplesNetworkWalletSanitized) {
                console.log('extracted: ' + peoplesNetworkWalletSanitized); // Outputs the extracted text
            } else {
                console.log('No matching <a> tag found or no text after the tag');
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

            const customDiv = document.createElement('div');
            customDiv.id = 'pce-ext-inject';
            customDiv.style.background = 'white';
            customDiv.style.margin = "0 0.5rem 0 0.5rem";
            customDiv.style.position = "relative";
            customDiv.style.height = "0px";

            
            

           // Define the style tag as a string
           const buttonStyle = `
           <style>
             .pce-ext-button {
               background: none; 
               cursor: pointer; 
               outline: none; 
               padding: 0; 
               margin: 0; 
               width: 2rem; 
               user-select: none; 
               border: white solid 1px; 
               height: 2rem; 
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
           <button id="${buttonIdLike}" class="pce-ext-button">&#x1F44D;</button> 
           <button id="${buttonIdDislike}" class="pce-ext-button">&#x1F44E;</button>
         `;
       
             const elementForUi =  postContainerElement.querySelector('[data-test-id="comments-page-link-num-comments"]');
             if(elementForUi)
             {
               
                elementForUi.parentElement.appendChild(customDiv);
             }
             else
             {
                
                customDiv.style.left = "85%";
                customDiv.style.height = "0px";
            postContainerElement.appendChild(customDiv);
             }
            // Append customDiv as the last child of targetDiv
            let postTitle;
            let url;
            try
            {
                postTitle = postContainerElement.querySelector('[data-click-id="body"').textContent;
                
            }
            catch(error)
            {
                console.log(error);
            }
                try
                {
                    url = postContainerElement.querySelector('[data-click-id="body"').href;
                }
                
            catch(error)
            {
                url = window.location.href;
            }

            try
            {
                postTitle =  document.querySelector('div[data-adclicklocation="title"] div div h1').textContent;
            }
            catch(error)
            {

                postTitle = document.querySelector('div[data-adclicklocation="title"] div').textContent;
            }
            
            document.getElementById(buttonIdLike).addEventListener('click', () => {
                sendUpvoteMessageToInjectedScript(receiver, url,postTitle);
            });
            document.getElementById(buttonIdDislike).addEventListener('click', () => {
                sendDownvoteMessageToInjectedScript(receiver, url,postTitle);
            });

            return;
        });

        }

        //this is executed on a subreddit and on the reddit main page
        shredditPosts.forEach((post) => {
            if (post) {
                const extension =  post.querySelector('#pce-ext-inject');

                if(extension)
                {
                  return;
                }
                let compatible =false;
                const postBodyElement = document.querySelector('[data-click-id="body"] [data-click-id="text"] p');

                // Find all <a> tags within postBodyElement
                const anchorTags = postBodyElement.querySelectorAll('a');

                let peoplesNetworkWalletSanitized = '';

                for (const anchorTag of anchorTags) {
                    // Check if the text content of <a> tag is '#peoplesnetwork'
                    if (anchorTag.textContent === '#peoplesnetwork') {
                        // Get the next sibling text node of the <a> tag
                        const siblingText = anchorTag.nextSibling.textContent;

                        // Extract the part after '#peoplesnetwork'
                        const parts = siblingText.split(':');
                        if (parts.length > 1) {
                            peoplesNetworkWalletSanitized = parts[1];
                            break; // Stop the loop once the match is found
                        }
                    }
                }

                if (peoplesNetworkWalletSanitized) {
                    console.log('extracted: ' + peoplesNetworkWalletSanitized); // Outputs the extracted text
                } else {
                    console.log('No matching <a> tag found or no text after the tag');
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

                const customDiv = document.createElement('div');
                customDiv.id = 'pce-ext-inject';
                customDiv.style.background = 'white';
                customDiv.style.margin = "0 0.5rem 0 0.5rem";
                customDiv.style.left = "85%";
                customDiv.style.position = "relative";
                customDiv.style.left = "85%";
                customDiv.style.height = "0px";

                //on reddit.com (main page) there is no need to align from top
                if (window.location.pathname === '/' || window.location.pathname === '' || /^\/r\/[^\/]+\/?$/.test(window.location.pathname)) {
                    // This block will execute if it's the main Reddit page or any subreddit
                    customDiv.style.top = "0px";
                } else {
                    // This block will execute for any actual post or other pages
                    customDiv.style.top = "1rem";
                }
                

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
               <button id="${buttonIdLike}" class="pce-ext-button">&#x1F44D;</button> 
               <button id="${buttonIdDislike}" class="pce-ext-button">&#x1F44E;</button>
             `;
                // Append customDiv as the last child of targetDiv
                post.appendChild(customDiv);
                const permalinksub = post.getAttribute('permalink');
                const postTitle = post.getAttribute('post-title');
                const currentDomain = window.location.protocol + '//' + window.location.hostname;
                const url = currentDomain + permalinksub;

                
                document.getElementById(buttonIdLike).addEventListener('click', () => {
                    sendUpvoteMessageToInjectedScript(receiver, url,postTitle);
                });
                document.getElementById(buttonIdDislike).addEventListener('click', () => {
                    sendDownvoteMessageToInjectedScript(receiver, url,postTitle);
                });
            }
          });


    }, 3000);


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


// Example of sending a message to the injected script
function sendMessageToInjectedScript(message, title) {
    window.postMessage({ type: "FROM_CONTENT", customMessage: message }, "*");
}


// Listen for messages from the injected script
window.addEventListener('message', function(event) {
    if (event.source === window && event.data.type && event.data.type == "PCE_SITE_NAVIGATED") {
        console.log("Page was navigated");
        injectCustomDiv();
    }
});


function sendUpvoteMessageToInjectedScript(receiver, url, title) {
    window.postMessage({ type: "PCE_UPVOTE_CONTENT", receiver:receiver, contentUrl: url, title: title }, "*");
  }
  function sendDownvoteMessageToInjectedScript(receiver, url, title) {
    window.postMessage({ type: "PCE_DOWNVOTE_CONTENT",receiver:receiver, contentUrl: url, title: title  }, "*");
  }


setTimeout(()=>{
    injectCustomDiv();
  
    // Then inject your custom script
    injectScript(chrome.runtime.getURL('contentPageInjectedScript.js'), 'body');
  
    // Example usage
    sendMessageToInjectedScript("Hello from content script!");
  },3000);

  