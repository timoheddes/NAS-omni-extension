export async function urlToGenerativePart(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
    return {
      inline_data: {
        mime_type:
          response.headers.get('content-type') || 'image/jpeg',
        data: base64Data,
      },
    };
  } catch (e) {
    console.error('Failed to fetch image:', imageUrl, e);
    return null;
  }
}

export function extractImageUrls(html) {
  // Regex to find image sources in the carousel
  // Matches both 'src' and 'data-lazy-src' to be safe
  const imgRegex =
    /<img[^>]*class=["'][^"']*f-carousel__slide-image[^"']*["']?[^>]*\s+(?:data-lazy-)?src=["']([^"']+)["']/gi;
  // Fallback: simpler regex if class names change, looking for typical Green-Acres photo URL pattern
  const fallbackRegex =
    /<img[^>]*\s(?:data-lazy-)?src=["']([^"']*\/Photos\/[^"']+)["']/gi;

  let matches = [...html.matchAll(imgRegex)];

  if (matches.length === 0) {
    matches = [...html.matchAll(fallbackRegex)];
  }

  // distinct URLs only
  const urls = [...new Set(matches.map((m) => m[1]))];
  return urls;
}

export function selectStrategicImages(allUrls, count = 3) {
  if (!allUrls || allUrls.length === 0) return [];

  const targetCount = Math.max(3, count);

  if (allUrls.length <= targetCount) return allUrls;

  // Cut the left 30% (Often Exterior/Facade shots)
  const cutIndex = Math.floor(allUrls.length * 0.3);
  let candidateImages = allUrls.slice(cutIndex);

  // Safety fallback: If the cut leaves us with < 3 images, use the full list
  if (candidateImages.length < 3) {
    candidateImages = allUrls;
  }

  // Set of INDICES to ensure we don't pick duplicates
  const pickedIndices = new Set();

  pickedIndices.add(0); // First
  pickedIndices.add(Math.floor(candidateImages.length / 2)); // Middle
  pickedIndices.add(candidateImages.length - 1); // Last

  // Random Fill (if we need more than 3)
  const needed = targetCount - pickedIndices.size;

  if (needed > 0) {
    // Create a pool of available indices (excluding the ones we already picked)
    const availableIndices = [];
    for (let i = 0; i < candidateImages.length; i++) {
      if (!pickedIndices.has(i)) {
        availableIndices.push(i);
      }
    }

    // Shuffle the available indices (Fisher-Yates shuffle)
    for (let i = availableIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableIndices[i], availableIndices[j]] = [
        availableIndices[j],
        availableIndices[i],
      ];
    }

    // Grab the first N items from the shuffled list
    const randomPicks = availableIndices.slice(0, needed);
    randomPicks.forEach((idx) => pickedIndices.add(idx));
  }

  return Array.from(pickedIndices)
    .sort((a, b) => a - b)
    .map((idx) => candidateImages[idx]);
}
