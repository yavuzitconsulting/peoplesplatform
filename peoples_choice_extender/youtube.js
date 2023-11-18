function injectCustomDiv() {
    setTimeout(()=>{ //move execution to the end of the event queue
        console.log('injected');

        const targetDiv = document.querySelector('ytd-app ytd-page-manager ytd-watch-flexy ytd-watch-metadata ytd-menu-renderer div#top-level-buttons-computed');
        if (targetDiv) {
          const customDiv = document.createElement('div');
          customDiv.className = 'custom-mine';
            customDiv.style.display="flex";
            customDiv.style.flexDirection="row";
            customDiv.style.marginRight="2rem";
            
          const buttonId = generateUniqueAlphanumericId();
          const buttonIdLike = buttonId+"L";  
          const buttonIdDislike = buttonId+"D";  
          customDiv.innerHTML = `<button id="${buttonIdLike}" style="background: none; cursor: pointer; outline: none; padding: 0; margin: 0; width: 3rem; user-select: none; border: white solid 1px; height: 3rem; border-radius: 20%;">&#x1F44D;</button> <button id="${buttonIdDislike}" style="background: none; cursor: pointer; outline: none; padding: 0; margin: 0; width: 3rem; user-select: none; border: white solid 1px; height: 3rem; border-radius: 20%;">&#x1F44E;</button>`;


          targetDiv.prepend(customDiv);
      
          document.getElementById(buttonIdLike).addEventListener('click', () => {
            sendUpvoteMessageToInjectedScript(window.location.href);
            });
          document.getElementById(buttonIdDislike).addEventListener('click', () => {
              sendDownvoteMessageToInjectedScript(window.location.href);
          });
        }

    },3000);
    
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
function sendMessageToInjectedScript(message) {
    window.postMessage({ type: "FROM_CONTENT", customMessage: message }, "*");
}

function sendUpvoteMessageToInjectedScript(url) {
    window.postMessage({ type: "PCE_UPVOTE_CONTENT", contentUrl: url }, "*");
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



window.onload = () => {
    injectCustomDiv();

    // Then inject your custom script
    injectScript(chrome.runtime.getURL('contentPageInjectedScript.js'), 'body');

    // Example usage
    sendMessageToInjectedScript("Hello from content script!");
};