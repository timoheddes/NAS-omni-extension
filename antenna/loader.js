// Config
const NAS_IP = 'http://192.168.1.34:8084'; // Your NAS address
const ROUTER_SCRIPT = `${NAS_IP}/router.js`;
const TARGETS_FILE = `${NAS_IP}/targets.json`;

// State
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

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only proceed if page is fully loaded and has a URL
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.startsWith('http')
  ) {
    // Check if the current URL matches ANY domain in our Allow List
    const isTarget = allowedDomains.some((domain) =>
      tab.url.includes(domain)
    );

    if (isTarget) {
      console.log(`Target Match [${tab.url}]. Injecting Omni...`);

      chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          func: (scriptUrl) => {
            // Inject module with cache-busting
            const script = document.createElement('script');
            script.type = 'module';
            script.src = scriptUrl + '?t=' + new Date().getTime();
            document.head.appendChild(script);
          },
          args: [ROUTER_SCRIPT],
        })
        .catch((err) => console.error('Injection failed:', err));
    }
  }
});
