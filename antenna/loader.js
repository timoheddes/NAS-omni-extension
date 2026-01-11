// Config
const NAS_IP = 'http://192.168.1.34:8084';
const ROUTER_SCRIPT = `${NAS_IP}/router.js`;
const TARGETS_FILE = `${NAS_IP}/targets.json`;

// State
let loaded = false;
let allowedDomains = [];

// Rule syncing logic
async function updateRules() {
  try {
    // Add timestamp to prevent caching the JSON file
    const url = `${TARGETS_FILE}?t=${new Date().getTime()}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error('NAS unreachable');

    const newRules = await response.json();

    // Simple validation to ensure we got an array
    if (Array.isArray(newRules)) {
      allowedDomains = newRules;
      console.log(
        `✅ Rules updated from NAS. Monitoring ${allowedDomains.length} domains.`
      );
    }
  } catch (err) {
    console.warn(
      '⚠️ Failed to sync rules from NAS (using cached list):',
      err
    );
  }
}

// Initial fetch immediately
updateRules();

// Poll for updates every 5 minutes (300,000 ms)
setInterval(updateRules, 300000);

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'PROXY_FETCH') {
      const { url, options } = request.payload;

      fetch(url, options)
        .then(async (res) => {
          const data = await res.json();
          sendResponse({ success: true, data });
        })
        .catch((err) => {
          sendResponse({ success: false, error: err.message });
        });

      return true; // Keep channel open for async response
    }

    if (request.action === 'PROXY_STORAGE_GET') {
      const { keys } = request.payload;
      chrome.storage.local.get(keys, (result) => {
        sendResponse({ success: true, data: result });
      });
      return true; // Async response
    }

    if (request.action === 'PROXY_STORAGE_SET') {
      const { data } = request.payload;
      chrome.storage.local.set(data, () => {
        sendResponse({ success: true });
      });
      return true; // Async response
    }

    if (request.action === 'PROXY_STORAGE_REMOVE') {
      const { keys } = request.payload;
      chrome.storage.local.remove(keys, () => {
        sendResponse({ success: true });
      });
      return true; // Async response
    }
  }
);

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.startsWith('http')
  ) {
    const isTarget = allowedDomains.some((domain) =>
      tab.url.includes(domain)
    );

    if (isTarget) {
      console.log(`Target Match. Injecting Omni...`);

      chrome.scripting.executeScript({
        target: { tabId },
        files: ['bridge.js'],
      });

      chrome.scripting.executeScript({
        target: { tabId },
        func: (scriptUrl) => {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = scriptUrl + '?t=' + new Date().getTime();
          document.head.appendChild(script);
        },
        args: [ROUTER_SCRIPT],
      });
    }
  }
});
