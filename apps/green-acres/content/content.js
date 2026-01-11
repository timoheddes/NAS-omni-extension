// MAIN FUNCTION: Inject buttons into property listings
function injectButtons() {
  const {
    CONSTANTS,
    HTML,
    SELECTORS,
    TEXT,
    ATTRIBUTES,
    COLORS,
    MESSAGES,
  } = window.GiteHunter;
  const {
    scoreToColor,
    extractPropertyData,
    createCopyText,
    cleanJSON,
    isSinglePropertyPage,
    createLocationSlug,
    renderResult,
    toggleVisibility,
  } = window.GiteHunter;

  const properties = [];

  // Select all property cards
  let cards = document.querySelectorAll(SELECTORS.card);
  // Select gallery container (present when on a single property page)
  let gallery = document.querySelector(SELECTORS.gallery);

  properties.push(...cards);
  if (gallery) {
    properties.push(gallery);
  }

  // No properties found, exit
  if (!properties || properties.length === 0) return;

  // Iterate over each property to inject buttons
  properties.forEach((property) => {
    // Prevent double injection
    if (property.querySelector(SELECTORS.button)) return;

    const { url, advertId } = extractPropertyData(property);
    if (!url || !advertId || url === '' || advertId === '') return;

    // Ensure the property container has relative positioning
    property.style.position = 'relative';

    // Create the button container
    const giteHunterContainer = document.createElement('div');
    giteHunterContainer.innerHTML = HTML.buttons;
    giteHunterContainer.className = SELECTORS.container.replace(
      '.',
      ''
    );

    // Create the result container (hidden by default)
    const giteHunterResultContainer = document.createElement('div');
    giteHunterResultContainer.className = SELECTORS.result.replace(
      '.',
      ''
    );
    giteHunterResultContainer.style.display = 'none';

    const analyseButton = giteHunterContainer.querySelector(
      SELECTORS.analyseButton
    );
    const infoButton = giteHunterContainer.querySelector(
      SELECTORS.infoButton
    );
    const deleteButton = giteHunterContainer.querySelector(
      SELECTORS.deleteButton
    );

    // Check for cached result
    chrome.storage.local.get([advertId], (result) => {
      if (result[advertId]) {
        // CACHE HIT: Pre-load the data
        analyseButton.innerText = TEXT.showAnalysis;
        analyseButton.setAttribute(ATTRIBUTES.active, 'true');
        analyseButton.setAttribute(
          ATTRIBUTES.cachedResult,
          result[advertId]
        );
        deleteButton.style.display = 'inline-block';
      }
    });

    analyseButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const cachedData = analyseButton.getAttribute(
        ATTRIBUTES.cachedResult
      );

      if (cachedData) {
        console.log('⚡ Loading from cache...');
        renderResult(
          cachedData,
          url,
          analyseButton,
          giteHunterResultContainer
        );
        return toggleVisibility(giteHunterResultContainer);
      }

      console.log(`🔍 Analysing property: ${url}`);
      analyseButton.innerText = '⏳ Hold on...';
      analyseButton.disabled = true;
      analyseButton.setAttribute(ATTRIBUTES.busy, 'true');

      let loadMessage = 0;
      let shownAllMessages = false;
      const loadInterval = setInterval(
        () => {
          const msg = shownAllMessages
            ? '⏳ Almost there...'
            : MESSAGES[loadMessage];
          analyseButton.innerText = msg;
          if (loadMessage >= MESSAGES.length - 1) {
            shownAllMessages = true;
          } else {
            loadMessage++;
          }
        },
        loadMessage === 0 ? 1000 : Math.random() * 3000 + 1000
      );

      // Send message to background script to do the heavy lifting
      chrome.runtime.sendMessage(
        {
          action: 'analyze_property',
          url: url,
          additionalInfo:
            infoButton.getAttribute('data-additional-info') || null,
        },
        (response) => {
          clearInterval(loadInterval);
          analyseButton.innerText = TEXT.showAnalysis;
          analyseButton.disabled = false;

          const dataToStore = {};
          dataToStore[advertId] = response.data;
          chrome.storage.local.set(dataToStore, () => {
            console.log('💾 Result saved to cache.');
          });

          analyseButton.setAttribute(ATTRIBUTES.busy, 'false');
          analyseButton.setAttribute(ATTRIBUTES.active, 'true');
          analyseButton.setAttribute(
            ATTRIBUTES.cachedResult,
            response.data
          );
          toggleVisibility(giteHunterResultContainer);
          deleteButton.style.display = 'inline-block';

          renderResult(
            response.data,
            url,
            analyseButton,
            giteHunterResultContainer
          );
        }
      );
    };

    infoButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const additionalInfo = prompt(
        'Enter any additional info you want to include in the analysis. You may use this to override or highlight specific features of the property. Leave it blank to remove existing info.',
        infoButton.getAttribute('data-additional-info') || ''
      );
      if (additionalInfo !== null) {
        infoButton.setAttribute(
          'data-additional-info',
          additionalInfo
        );
        infoButton.style.backgroundColor =
          additionalInfo.trim() === '' ? 'transparent' : COLORS.green;
        infoButton.innerText =
          additionalInfo.trim() === '' ? '+' : '✓';
      }
    };

    property.appendChild(giteHunterContainer);
    property.appendChild(giteHunterResultContainer);

    giteHunterResultContainer.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleVisibility(giteHunterResultContainer);
    };

    deleteButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const confirmDelete = confirm(
        'Are you sure you want to delete the cached analysis for this property?'
      );
      if (!confirmDelete) return;

      chrome.storage.local.remove([advertId], () => {
        console.log('🗑️ Cached analysis deleted.');
        analyseButton.removeAttribute(ATTRIBUTES.cachedResult);
        analyseButton.setAttribute(ATTRIBUTES.active, 'false');
        analyseButton.innerText = TEXT.analyse;
        deleteButton.style.display = 'none';
        giteHunterResultContainer.style.display = 'none';
      });
    };
  });
}

// Watch for DOM changes (scrolling/pagination)
const observer = new MutationObserver((mutations) => {
  injectButtons();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
injectButtons();
