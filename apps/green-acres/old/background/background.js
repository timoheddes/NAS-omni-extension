import {
  extractImageUrls,
  selectStrategicImages,
  urlToGenerativePart,
} from './images.js';

import { GEMINI_URL } from '../../config.js';

function extractDescription(html) {
  // Narrative text from the agent
  const descriptionMatch = html.match(
    /<div[^>]*class="[^"]*description-text[^"]*"[^>]*>([\s\S]*?)<\/div>/i
  );
  // Sometimes there is a secondary text block
  const featuresTextMatch = html.match(
    /<div[^>]*class="[^"]*main-feature-desc[^"]*"[^>]*>([\s\S]*?)<\/div>/i
  );

  let narrative = descriptionMatch ? descriptionMatch[1] : '';
  if (featuresTextMatch) {
    narrative += ' ' + featuresTextMatch[1];
  }

  let facts = [];

  // Main Characteristics
  // Structure: <ul class="main-characteristics">...<p>Label</p><p>Value</p>...</ul>
  const characteristicsMatch = html.match(
    /<ul[^>]*class="[^"]*main-characteristics[^"]*"[^>]*>([\s\S]*?)<\/ul>/i
  );
  if (characteristicsMatch) {
    const listItemsRegex =
      /<div[^>]*class=["'][^"']*description[^"']*["'][^>]*>\s*<[a-z]+[^>]*>(.*?)<\/[a-z]+>\s*<[a-z]+[^>]*>(.*?)<\/[a-z]+>\s*<\/div>/gi;
    let match;
    while (
      (match = listItemsRegex.exec(characteristicsMatch[1])) !== null
    ) {
      const label = match[1].replace(/<[^>]+>/g, '').trim();
      const value = match[2].replace(/<[^>]+>/g, '').trim();
      if (label && value) facts.push(`${label}: ${value}`);
    }
  }

  // Features Description
  // Structure: <ul class="main-feature-desc"><li>Value</li>...</ul>
  const featureListMatch = html.match(
    /<ul[^>]*class="[^"]*main-feature-desc[^"]*"[^>]*>([\s\S]*?)<\/ul>/i
  );
  if (featureListMatch) {
    // Regex to grab content inside <li> tags
    const liRegex = /<li[^>]*>(.*?)<\/li>/g;
    let match;
    while ((match = liRegex.exec(featureListMatch[1])) !== null) {
      const item = match[1].replace(/<[^>]+>/g, '').trim();
      if (item) facts.push(`Feature: ${item}`);
    }
  }

  // Energy Ratings (DPE/GES)
  // We look for the "active" letter inside the dpe-line or ges-line containers
  const dpeContextMatch = html.match(
    /class=["']dpe-line["'][\s\S]*?class=["']letter\s+([A-G])\s+active["']/i
  );
  const gesContextMatch = html.match(
    /class=["']ges-line["'][\s\S]*?class=["']letter\s+([A-G])\s+active["']/i
  );

  const realDpe = dpeContextMatch ? dpeContextMatch[1] : 'Unknown';
  const realGes = gesContextMatch ? gesContextMatch[1] : 'Unknown';

  // Price
  const containerMatch = html.match(
    /class=["']price-container["'][\s\S]*?class=["']price["'][^>]*>([\s\S]*?)<\/span>/i
  );
  const looseMatch = html.match(
    /<span[^>]*class=["']price["'][^>]*>([\s\S]*?)<\/span>/i
  );
  const currencyMatch = html.match(
    /<span[^>]*class=["'][^"']*symbol[^"']*["'][^>]*>([\s\S]*?)<\/span>/i
  );

  // Select the best match
  let rawPrice = containerMatch
    ? containerMatch[1]
    : looseMatch
    ? looseMatch[1]
    : null;

  const priceValue = rawPrice
    ? rawPrice.replace(/\s+/g, '').trim() // Remove spaces/newlines
    : 'Unknown Price';

  const currency = currencyMatch ? currencyMatch[1].trim() : '€';

  // Assemble final prompt
  const finalPromptText = `
[HARD DATA POINTS]:
PRICE: ${priceValue} ${currency}
${facts.join('\n')}
Energy Rating (DPE): ${realDpe}
Gas Emission (GES): ${realGes}
--------------------------------
[AGENT DESCRIPTION]:
${narrative}
`.substring(0, 10000); // Token limit safety (approx)

  // Clean up any remaining HTML tags from the final string
  return finalPromptText
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'analyze_property') {
      // 1. Fetch the property page
      fetch(request.url)
        .then((res) => res.text())
        .then(async (html) => {
          const cleanText = extractDescription(html);

          const allImageUrls = extractImageUrls(html);
          const selectedUrls = selectStrategicImages(
            allImageUrls,
            Math.ceil(allImageUrls.length / 8)
          );

          console.log(
            `📸 Found ${allImageUrls.length} images. Selected:`,
            selectedUrls
          );

          // Download and convert images to Base64
          const imageParts = await Promise.all(
            selectedUrls.map((url) => urlToGenerativePart(url))
          );

          // Filter out any failed downloads
          const validImageParts = imageParts.filter(
            (p) => p !== null
          );

          const additionalInfo = request.additionalInfo;

          console.log(
            '🔍 DEBUG: Extracted Text sent to Gemini:',
            cleanText
          );

          // 2. Ask Gemini
          const prompt = `
You are a discerning real estate investor. Analyze this property (Text + Photos).
Buyer Profile: Loves "High-End Rustic Modern". Hates "Cheap/Dated Renovations".

**VISUAL ANALYSIS (Crucial):**
Look at the attached photos for these specific Style Flags:

**❌ RED FLAGS (FAIL):**
- **Flooring:** Small, generic white/grey ceramic tiles (hospital vibe). Linoleum.
- **Ceiling:** Polystyrene tiles, drop ceilings, discolored or stained ceilings.
- **Kitchen/Bath:** Laminate countertops, drop-in oval sinks, full-wall generic tiling.
- **Vibe:** "Soulless," "Clinical," or "Cheap DIY."

**✅ GREEN FLAGS (PASS):**
- **Structure:** Exposed heavy timber beams, exposed stone walls (if well kept).
- **Flooring:** Travertine, natural stone, original tomettes, wood.
- **Kitchen/Bath:** Flat-panel modern cabinets, Micro-cement/Tadelakt walls, Vessel sinks, Wood/Stone counters, Stainless steel.
- **Vibe:** "Warm," "Organic," "High Contrast" (Old shell + Modern interior).

**Criteria & Weights (0-10):**
1. [Weight 7] Visual Style Match: Does it match the Green Flags? (If Red Flags found, score low). If you're certain from the photos that the interior is "Cheap/Dated," score very low.
2. [Weight 6] Gite: Existing gite or CLEAR, EASY potential (not just "barn to convert") is a big plus. Alternatively, a property that could easily host a gite (separate entrance, outbuilding, studio, etc.).
3. [Weight 8] Condition: Minimal renovation. "Refresh" is okay; "Structural work" is a fail.
4. [Weight 7] Size: At least 3 bedrooms.
5. [Weight 7] Land: 8000m2 (0.8 hectares) or more. Under 6000m2 is a fail. Above 10000m2 is a big plus.
6. [Weight 6] Pool: Has a swimming pool. Preferably 10 meters or larger in length.
7. [Weight 6] Efficiency: Good energy rating implied (insulation, double glazing, heat pump). If energy label is available, DPE A, B, or C preferred. E or worse is a fail.
8. [Weight 6] Amenities: Proximity to a village with shops, bakery, schools, medical facilities (within 10 to 20 minutes drive) is a big plus.
9. [Weight 6] Connectivity: Airport or TGV access within 1 hour is a plus.
10. [Weight 7] Price: Consider price carefully in final assessment and relate it to market value for the area (considering condition and features). A €410k property with a gite is a "Steal," while an €790k one might be "Overpriced" if it needs work. A low price (<500k) with high specs often implies a dated interior. If the property is 800k+ it must be exceptional in all other criteria.
11. [Weight 5] Extras: Features like scenic views, gardens, terraces, fireplaces, parking, security systems, and modern amenities can add value.
**Property Text:** "${cleanText}"

**Images:** I have attached ${
            validImageParts.length
          } photos selected from the listing. An attempt was made to isolate interior shots. If it is an exterior shot, use it to assess the land, pool, and outbuildings. If the photos were not helpful or all exterior shots, say so and request the user to check for themselves.

**Instructions:**
- Calculate a "Match Score" (0-100%) based on how well the text meets the weighted criteria.
- Use the [HARD DATA POINTS] first. If the list says "4 hectares", trust it over the text. Use the PRICE to judge value for money.
- Be skeptical. If the text says "possibility to create a gite", that is NOT a gite (low score on #1).
- For the final score, 90+ is exceptional, 80+ is very good, 60+ is average, below 60 is poor.

${
  additionalInfo
    ? `**IMPORTANT:** The user has additional information or instructions that you MUST consider. This information or instruction may override anything else in this analysis but you can challenge it in the final verdict if needed: ${additionalInfo}`
    : ''
}

**Output strictly valid JSON (no markdown formatting):**
{
  "match_score": number,
  "price": "Extracted price with currency",
  "verdict": "One short punchy sentence summarizing the buy/no-buy decision. Mention if the photos reveal anything noteworthy about interior.",
  "style_verdict": "Short verdict on style, e.g. Modern Rustic (Pass), Dated/Cheap (Fail), with additional notes if needed.",
  "flooring_check": "Pass" | "Fail (Generic/Dated)",
  "ceiling_check": "Pass (Beams)" | "Fail (Plain/Tiles)",
  "gite_status": "Has a Gite" | "Has Gite potential" | "No Gite" | "Studio/Outbuilding potential" | "Barn to convert (low score)",
  "renovation_level": "Turnkey" | "Minor work needs" | "Heavy Work",
  "energy_rating": "A" | "B" | "C" | "D" | "E" | "F" | "G" | "Unknown",
  "land_size": "large" | "medium" | "small",
  "bedrooms": number,
  "energy_source": "Type of heating/energy source if mentioned",
  "swimming_pool": "Pool" | "No pool",
  swimming_pool_size: "large" | "small" | "none" | "no size listed",
  "pros": ["bullet point", "bullet point"],
  "cons": ["bullet point", "bullet point"]
}
`;

          return fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });
        })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error('Gemini API Error:', data.error);
            throw new Error(data.error.message);
          }
          if (!data.candidates || !data.candidates[0]) {
            console.error('Blocked/Empty Response:', data);
            throw new Error(
              'Gemini returned no candidates (Safety block?)'
            );
          }

          const answer = data.candidates[0].content.parts[0].text;

          sendResponse({ data: answer });
        })
        .catch((err) => {
          console.error(err);
          sendResponse({
            error: err.message,
          });
        });

      return true;
    }
  }
);
