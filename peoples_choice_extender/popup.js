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

//to generalScriptInjector
function sendDonateMessageToInjectedScript(donationAmount, months) {

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {  
  chrome.tabs.sendMessage(tabs[0].id, {type:"PCE_DONATE_MESSAGE", amount: donationAmount, months: months});
});
}


//to generalScriptInjector
function sendReceiveMessageToInjectedScript() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "PCE_RECEIVE_MESSAGE"});
  });
}



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
