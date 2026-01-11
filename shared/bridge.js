export function sendToAntenna(action, payload) {
  return new Promise((resolve, reject) => {
    // Generate a unique ID for this request
    const id = Math.random().toString(36).substr(2, 9);

    const handler = (event) => {
      // 1. Security Check: Must be same window
      // 2. Protocol Check: Must be an ANTENNA_RESPONSE
      // 3. ID Check: Must match our request ID
      if (
        event.source !== window ||
        event.data?.type !== 'ANTENNA_RESPONSE' ||
        event.data?.id !== id
      ) {
        return;
      }

      // Cleanup listener
      window.removeEventListener('message', handler);

      if (event.data.response.success) {
        resolve(event.data.response.data);
      } else {
        reject(new Error(event.data.response.error));
      }
    };

    window.addEventListener('message', handler);

    // Send the request
    window.postMessage(
      {
        type: 'ANTENNA_REQUEST',
        id,
        action,
        payload,
      },
      '*'
    );
  });
}
