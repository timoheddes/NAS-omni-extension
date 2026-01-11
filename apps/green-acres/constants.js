// DOM Selectors
window.GiteHunter.SELECTORS = {
  card: '.announce-card',
  gallery: '.gallery-container',
  locationContainer: '.announce-localisation',

  button: '.omni-button',
  container: '.gite-hunter-container',
  result: '.gite-hunter-result',
  addInfo: '.gite-hunter-add-info',

  analyseButton: '#gite-hunter-analyse-btn',
  infoButton: '#gite-hunter-additional-info-btn',
  copyButton: '.gite-hunter-copy-btn',
  deleteButton: '#gite-hunter-delete-btn',
};

// Constants
window.GiteHunter.CONSTANTS = {
  BASE_URL: 'https://www.green-acres.fr/en/properties/property/',
};

// Text Constants
window.GiteHunter.TEXT = {
  analyse: '✨ Analyse',
  showAnalysis: 'Show Analysis',
  additionalInfo: '+',
  showAnalyses: (score) => `Show Analyses (${score}%)`,
};

window.GiteHunter.ATTRIBUTES = {
  busy: 'data-busy',
  active: 'data-active',
  cachedResult: 'data-cached-result',
};

window.GiteHunter.COLORS = {
  green: '#27ae60',
  yellow: '#c8f10fff',
  orange: '#e67e22',
  red: '#c0392b',
};

// HTML
window.GiteHunter.HTML = {
  buttons:
    '<button id="gite-hunter-analyse-btn" class="omni-button" data-busy="false" data-active="false" title="Analyse this property">✨ Analyse</button><button id="gite-hunter-additional-info-btn" class="omni-button" data-busy="false" data-active="false" data-additional-info="" style="font-weight: 600;margin-left: 1px;" title="Add additional information">+</button><button id="gite-hunter-delete-btn" title="Delete cached analysis" class="omni-button" data-busy="false" data-active="false" style="display:none">❌</button>',
  result: (data) => `
          <div class="gite-hunter-resuls-header">
            <span class="gite-hunter-text-large">
              Match: <span style="color: ${window.GiteHunter.scoreToColor(
                data.match_score
              )}">${data.match_score}%</span>
            </span>
            <span class="gite-hunter-text-small">
            ${data.gite_status} | ${data.swimming_pool} (${
    data.swimming_pool_size
  }) | Energy rating: ${data.energy_rating} | ${
    data.bedrooms
  } bedrooms | ${data.energy_source}
          </span>
          <button type="button" class="gite-hunter-copy-btn">Copy</button>
                </div>
                <div style="margin: 1em 0;">${data.verdict}</div>
                <div style="margin: 1em 0;">Aesthetic: ${
                  data.style_verdict
                } (Floors: ${data.flooring_check} | Ceilings: ${
    data.ceiling_check
  })</div>
                <ul class="gite-hunter-list" style=" color: #65ffa6;">
                    ${data.pros.map((p) => `<li>${p}</li>`).join('')}
                </ul>
                <ul class="gite-hunter-list" style=" color: #efb8b2;">
                    ${data.cons.map((c) => `<li>${c}</li>`).join('')}
                </ul>
            `,
};

// Loading messages to display during analysis
window.GiteHunter.MESSAGES = [
  '💰 Considering budget...',
  '🔋 Checking energy rating...',
  '🏡 Assessing gite potential...',
  '🛏️ Counting bedrooms...',
  '🌳 Evaluating land size...',
  '🛠️ Analysing renovation needs...',
  '🏊 Reviewing swimming pool features...',
  '🏘️ Considering proximity to amenities...',
  '💵 Factoring in price analysis...',
];
