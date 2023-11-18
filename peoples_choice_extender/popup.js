document.getElementById("donateButton").onclick = function() {
  document.getElementById("donationModal").style.display = "flex";
};
document.getElementById("receiveButton").onclick = function() {
  sendReceiveMessageToInjectedScript();
};
document.getElementById("modalback").onclick = function() {
  document.getElementById("donationModal").style.display = "none";
};
document.getElementById("donateNowButton").onclick = function() {
  document.getElementById("donationModal").style.display = "none";
  
  const totalDonation = document.getElementById('calculatedSumDonation').value;
  const months = document.getElementById('donationOptions').value;
  if(totalDonation > 0)
  {
    sendDonateMessageToInjectedScript(totalDonation, months);
  }
};

document.querySelector('.visitus').addEventListener('click', function() {
  
    sendChainRequestToInjectedScript();
  

});

//to generalScriptInjector
function sendDonateMessageToInjectedScript(donationAmount, months) {

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {  
  chrome.tabs.sendMessage(tabs[0].id, {type:"PCE_DONATE_MESSAGE", amount: donationAmount, months: months});
});
}



//to generalScriptInjector
function sendChainRequestToInjectedScript() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // Check if there's an error with the query
      if (chrome.runtime.lastError) {
          // Handle the error here, for example, by opening a default URL
          window.open(`https://www.caleidoscode.io/?chain=cryptng&p=1`, '_blank');
          return; // Exit the function
      }

      // No error, proceed to send message to the content script
      chrome.tabs.sendMessage(tabs[0].id, {type: "PCE_REQUEST_CHAIN"}, function(response) {
          // Check if there's an error with sendMessage
          if (chrome.runtime.lastError) {
              // Handle the error here, for example, by opening a default URL
              window.open(`https://www.caleidoscode.io/?chain=cryptng&p=1`, '_blank');
          }
      });
  });
}


//to generalScriptInjector
function sendReceiveMessageToInjectedScript() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      //hardcode 1 month for now
      chrome.tabs.sendMessage(tabs[0].id, {type: "PCE_RECEIVE_MESSAGE", months: 1});
  });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PCE_RESPONSE_CHAIN") {
    const currentChainInfo = message.currentChainInfo;
    let chainName = currentChainInfo.chainName;
    if(chainName == 'unknown' || chainName == '')
    {
      chainName = "cryptng";
    }
    window.open(`https://www.caleidoscode.io/?chain=${chainName}&p=1`, '_blank');
  }
});


// Function to calculate and display the total donation sum
function calculateAndDisplayDonationSum() {
  var months = document.getElementById('donationOptions').value;
  var monthlyAmount = document.getElementById('donateAmountPerMonth').value;

  // Calculate the total donation sum
  var totalDonation = months * monthlyAmount;

  // Display the result in the calculatedSumDonation field
  document.getElementById('calculatedSumDonation').value = totalDonation; // To fix to two decimal places
}


// Event listeners for the dropdown and the monthly amount input field
document.getElementById('donationOptions').addEventListener('change', calculateAndDisplayDonationSum);
document.getElementById('donateAmountPerMonth').addEventListener('input', calculateAndDisplayDonationSum);

// Initialize the calculation on page load
calculateAndDisplayDonationSum();
