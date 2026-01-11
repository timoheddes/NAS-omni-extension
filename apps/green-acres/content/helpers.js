window.GiteHunter.scoreToColor = (score) => {
  const { COLORS } = window.GiteHunter;
  if (score > 80) {
    return COLORS.green;
  } else if (score > 70) {
    return COLORS.yellow;
  } else if (score > 55) {
    return COLORS.orange;
  } else {
    return COLORS.red;
  }
};

window.GiteHunter.cleanJSON = (jsonString) =>
  jsonString
    .replace(/```json|```/g, '')
    .replace(/[\n\r]/g, '')
    .trim();

window.GiteHunter.createCopyText = (data, url) => {
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
};

window.GiteHunter.renderResult = (
  jsonString,
  url,
  analyseButton,
  giteHunterResultContainer
) => {
  const { TEXT, SELECTORS, HTML, createCopyText, cleanJSON } =
    window.GiteHunter;
  try {
    const cleanJson = cleanJSON(jsonString);
    const data = JSON.parse(cleanJson);

    analyseButton.innerText = TEXT.showAnalyses(data.match_score);

    giteHunterResultContainer.innerHTML = HTML.result(data);

    const copyBtn = giteHunterResultContainer.querySelector(
      SELECTORS.copyButton
    );
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();

      navigator.clipboard
        .writeText(createCopyText(data, url))
        .then(() => {
          copyBtn.innerText = 'Copied';
          setTimeout(() => {
            copyBtn.innerText = 'Copy';
          }, 2000);
        })
        .catch((err) => {
          console.error('Copy failed', err);
          copyBtn.innerText = '❌';
        });
    };
  } catch (e) {
    // Fallback if JSON parsing fails
    giteHunterResultContainer.innerText = `Failed to parse JSON response. Raw data: ${response.data}`;
  }
};

window.GiteHunter.toggleVisibility = (element) => {
  if (element.style.display === 'none') {
    element.style.display = 'block';
  } else {
    element.style.display = 'none';
  }
};
