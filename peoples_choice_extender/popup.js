
document.getElementById('connectButton').addEventListener('click', async () => {
    console.log('extension popup');
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected', accounts[0]);
      } catch (error) {
        console.error(error);
      }
    } else {
        console.log('popup else');
      alert('MetaMask is not installed!');
    }
  });
  