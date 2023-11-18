function injectCustomDiv() {

   
    setTimeout(() => { // Move execution to the end of the event queue
        console.log('injected');

        //there are multiple elements that look like this: <slot name="share-button">
        //append the button to these elements
        const shredditPosts = document.querySelectorAll('shreddit-post');

        shredditPosts.forEach((post) => {
            if (post) {
                console.log('POSTTTTT');
                const customDiv = document.createElement('div');
                customDiv.className = 'custom-mine';
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
                
                const buttonId = generateUniqueAlphanumericId();
                const buttonIdLike = buttonId+"L";  
                const buttonIdDislike = buttonId+"D";  
                customDiv.innerHTML = `<button id="${buttonIdLike}" style='width:2rem;'>&#x1F44D;</button> <button id="${buttonIdDislike}" style='width:2rem;'>&#x1F44E;</button>`;

                // Append customDiv as the last child of targetDiv
                post.appendChild(customDiv);
                const permalinksub = post.getAttribute('permalink');
                const currentDomain = window.location.protocol + '//' + window.location.hostname;
                const url = currentDomain + permalinksub;
                document.getElementById(buttonIdLike).addEventListener('click', () => {
                    sendUpvoteMessageToInjectedScript(url);
                });
                document.getElementById(buttonIdDislike).addEventListener('click', () => {
                    sendDownvoteMessageToInjectedScript(url);
                });
            }
          });


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


// Example of sending a message to the injected script
function sendMessageToInjectedScript(message) {
    window.postMessage({ type: "FROM_CONTENT", customMessage: message }, "*");
}

function sendUpvoteMessageToInjectedScript(url) {
    window.postMessage({ type: "PCE_UPVOTE_CONTENT", contentUrl: url }, "*");
}
function sendDownvoteMessageToInjectedScript(url) {
    window.postMessage({ type: "PCE_DOWNVOTE_CONTENT", contentUrl: url }, "*");
}

// Listen for messages from the injected script
window.addEventListener('message', function(event) {
    if (event.source === window && event.data.type && event.data.type == "PCE_SITE_NAVIGATED") {
        console.log("Page was navigated");
        injectCustomDiv();
    }
});



setTimeout(()=>{
    injectCustomDiv();
  
    // Then inject your custom script
    injectScript(chrome.runtime.getURL('contentPageInjectedScript.js'), 'body');
  
    // Example usage
    sendMessageToInjectedScript("Hello from content script!");
  },3000);