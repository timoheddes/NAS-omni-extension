window.GiteHunter.isSinglePropertyPage = (property) =>
  property.classList.contains('gallery-container');

window.GiteHunter.createLocationSlug = (text) =>
  text
    .toLowerCase()
    .replace(/ *\([^)]*\) */g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

window.GiteHunter.extractPropertyData = (property) => {
  const { CONSTANTS, SELECTORS } = window.GiteHunter;

  const { isSinglePropertyPage, createLocationSlug } =
    window.GiteHunter;

  let url = '';
  let advertId = '';

  if (!isSinglePropertyPage(property)) {
    advertId = property.getAttribute('data-advertid');
    const locationContainer = property.querySelector(
      SELECTORS.locationContainer
    );

    // Safety check, exit if essential data is missing
    if (!advertId || !locationContainer) return { url, advertId };

    // Create a slug from the location text
    const locationSlug = createLocationSlug(
      locationContainer.innerText
    );

    url = `${CONSTANTS.BASE_URL}${locationSlug}/${advertId}.htm`;
  } else {
    // Single property page, extract advertId from URL
    url = window.location.href;
    const match = url.match(/\/([A-Za-z0-9]+)\.htm/);
    advertId = match ? match[1] : url;
  }

  return { url, advertId };
};
