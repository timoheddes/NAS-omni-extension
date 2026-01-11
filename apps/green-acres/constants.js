export const SELECTORS = {
  card: '.announce-card',
  gallery: '.gallery-container',
  locationContainer: '.announce-localisation',
};

export const BASE_URL =
  'https://www.green-acres.fr/en/properties/property/';

export const LABELS = {
  analyse: '✨ Analyse',
  showAnalysis: 'Show Analysis',
  additionalInfo: '+',
  showAnalyses: (score) => `Show Analyses (${score}%)`,
};

export const ATTRIBUTES = {
  busy: 'data-busy',
  active: 'data-active',
  cachedResult: 'data-cached-result',
};

export const COLORS = {
  green: '#27ae60',
  yellow: '#c8f10fff',
  orange: '#e67e22',
  red: '#c0392b',
};

export const HTML = {
  buttons:
    '<button id="gite-hunter-analyse-btn" class="omni-button" data-busy="false" data-active="false" title="Analyse this property">✨ Analyse</button><button id="gite-hunter-additional-info-btn" class="omni-button" data-busy="false" data-active="false" data-additional-info="" style="font-weight: 600;margin-left: 1px;" title="Add additional information">+</button><button id="gite-hunter-delete-btn" title="Delete cached analysis" class="omni-button" data-busy="false" data-active="false" style="display:none">❌</button>',
  result: (data) => `
          <div class="gite-hunter-resuls-header"></div>
            <span class="gite-hunter-text-large">
              Match: <span style="color: ${COLORS.green}">${data.match_score}%</span>
            </span>
            <span class="gite-hunter-text-small">
            ${data.gite_status} | ${data.swimming_pool} (${data.swimming_pool_size}) | Energy rating: ${data.energy_rating} | ${data.bedrooms} bedrooms | ${data.energy_source}
          </span>
          </div>
          <div class="gite-hunter-results-body">
            <p class="gite-hunter-text-normal">
              ${data.description}
            </p>
          </div>
        `,
};

export const MESSAGES = [
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
