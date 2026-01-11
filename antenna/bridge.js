window.addEventListener('message', (event) => {
  // Security: Only accept messages from the same window
  if (event.source !== window) return;

  // Filter for your specific event type
  if (event.data?.type === 'ANTENNA_REQUEST') {
    const { id, action, payload } = event.data;

    // Forward to Background (Loader)
    chrome.runtime.sendMessage({ action, payload }, (response) => {
      // Send response back
      window.postMessage(
        { type: 'ANTENNA_RESPONSE', id, response },
        '*'
      );
    });
  }
});
