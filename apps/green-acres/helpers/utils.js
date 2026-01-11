import {
  COLORS,
  SELECTORS,
  HTML,
  ATTRIBUTES,
  LABELS,
} from './utils.js';

import { cleanJSON } from './utils';

export function scoreToColor(score) {
  if (score >= 75) return COLORS.green;
  if (score >= 50) return COLORS.yellow;
  if (score >= 25) return COLORS.orange;
  return COLORS.red;
}

export function cleanJSON(jsonString) {
  return jsonString
    .replace(/```json|```/g, '')
    .replace(/[\n\r]/g, '')
    .trim();
}

export function createCopyText(data, url) {
  const {
    match_score,
    gite_status,
    swimming_pool,
    bedrooms,
    price,
    energy_rating,
    energy_source,
    swimming_pool_size,
    verdict,
  } = data;
  const pros = data.pros.map((p) => `- ${p}`).join('\n');
  const cons = data.cons.map((c) => `- ${c}`).join('\n');

  return `
${url}
--------------------------------
Score: ${match_score}%
Price: ${price}
${verdict}
--------------------------------
${gite_status} | ${swimming_pool} (${swimming_pool_size}) | Energy rating: ${energy_rating} | ${bedrooms} bedrooms | ${energy_source}
--------------------------------
Pros:
${pros}

Cons:
${cons}`.trim();
}

export const toggleVisibility = (element, show) => {
  if (!element) return;
  element.style.display = show ? 'block' : 'none';
};

export const renderResult = (
  jsonString,
  url,
  analyseButton,
  giteHunterResultContainer
) => {
  try {
    const cleanJson = cleanJSON(jsonString);
    const data = JSON.parse(cleanJson);
    giteHunterResultContainer.innerHTML = HTML.result(data);

    const copyText = createCopyText(data, url);
    const additionalInfoBtn = document.querySelector(
      SELECTORS.additionalInfoButton
    );
    additionalInfoBtn.setAttribute(
      'data-additional-info',
      encodeURIComponent(copyText)
    );

    toggleVisibility(giteHunterResultContainer, true);
    analyseButton.setAttribute(ATTRIBUTES.active, 'true');
  } catch (error) {
    console.error('Error parsing JSON:', error);
    giteHunterResultContainer.innerHTML =
      '<p class="gite-hunter-text-normal">❌ Error parsing analysis result.</p>';
    toggleVisibility(giteHunterResultContainer, true);
  }
};
