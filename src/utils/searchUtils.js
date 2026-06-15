export const parsePrice = (priceStr) => {
  if (!priceStr) return null;
  let str = priceStr.toLowerCase().replace(/,/g, '');
  let multiplier = 1;
  
  if (str.match(/\b(cr|crore|crores)\b/)) multiplier = 10000000;
  else if (str.match(/\b(lakh|lakhs|l)\b/)) multiplier = 100000;
  else if (str.match(/\b(k)\b/)) multiplier = 1000;
  
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return null;
  return num * multiplier;
};

export const parseSearchQuery = (query) => {
  let textQuery = query.toLowerCase().trim();
  let minPrice = null;
  let maxPrice = null;
  let minArea = null;
  let maxArea = null;

  // 1. Exact matches for Area dropdowns
  if (textQuery.includes("under 1000 sqft")) {
    maxArea = 1000;
    textQuery = textQuery.replace("under 1000 sqft", "");
  } else if (textQuery.includes("1000 - 2000 sqft")) {
    minArea = 1000; maxArea = 2000;
    textQuery = textQuery.replace("1000 - 2000 sqft", "");
  } else if (textQuery.includes("above 2000 sqft")) {
    minArea = 2000;
    textQuery = textQuery.replace("above 2000 sqft", "");
  }

  // 2. Exact matches for Budget dropdowns
  if (textQuery.includes("under 20 lakhs")) {
    maxPrice = 2000000;
    textQuery = textQuery.replace("under 20 lakhs", "");
  } else if (textQuery.includes("20 - 50 lakhs")) {
    minPrice = 2000000; maxPrice = 5000000;
    textQuery = textQuery.replace("20 - 50 lakhs", "");
  } else if (textQuery.includes("50 lakhs - 1 crore") || textQuery.includes("50 lakhs - 1 cr")) {
    minPrice = 5000000; maxPrice = 10000000;
    textQuery = textQuery.replace(/50 lakhs - 1 cro?r?e?/i, "");
  } else if (textQuery.includes("above 1 crore") || textQuery.includes("above 1 cr")) {
    minPrice = 10000000;
    textQuery = textQuery.replace(/above 1 cro?r?e?/i, "");
  }

  // Patterns for free text pricing
  // 1. "between 10k and 20k" or "10k to 20k" or "10k - 20k"
  const betweenMatch = textQuery.match(/(?:between\s+)?(\d+(?:\.\d+)?[kl]?\w*)\s+(?:and|to|-)\s+(\d+(?:\.\d+)?[kl]?\w*)/i);
  if (betweenMatch && !minPrice && !maxPrice) {
    minPrice = parsePrice(betweenMatch[1]);
    maxPrice = parsePrice(betweenMatch[2]);
    textQuery = textQuery.replace(betweenMatch[0], '').trim();
  } else {
    // 2. "under 20k" or "< 20k"
    const underMatch = textQuery.match(/(?:under|less than|<|below)\s+(\d+(?:\.\d+)?[kl]?\w*)/i);
    if (underMatch && !maxPrice) {
      maxPrice = parsePrice(underMatch[1]);
      textQuery = textQuery.replace(underMatch[0], '').trim();
    } else {
      // 3. "above 10k" or "> 10k"
      const aboveMatch = textQuery.match(/(?:above|more than|>)\s+(\d+(?:\.\d+)?[kl]?\w*)/i);
      if (aboveMatch && !minPrice) {
        minPrice = parsePrice(aboveMatch[1]);
        textQuery = textQuery.replace(aboveMatch[0], '').trim();
      }
    }
  }

  return { textQuery: textQuery.replace(/\s+/g, ' ').trim(), minPrice, maxPrice, minArea, maxArea };
};

export const matchProperty = (property, parsedQuery) => {
  const { textQuery, minPrice, maxPrice, minArea, maxArea } = parsedQuery;

  // Price check
  if (minPrice !== null || maxPrice !== null) {
    const propPrice = parsePrice(String(property.price || ''));
    if (propPrice === null) return false;
    if (minPrice !== null && propPrice < minPrice) return false;
    if (maxPrice !== null && propPrice > maxPrice) return false;
  }

  // Area check
  if (minArea !== null || maxArea !== null) {
    const dd = property.dynamicData || {};
    const propAreaStr = String(dd.area || dd.totalArea || '');
    const propArea = parseFloat(propAreaStr.replace(/[^0-9.]/g, ''));
    
    if (isNaN(propArea)) return false; // Exclude if we can't determine area
    
    // Quick normalization (if property is in Acres/Cents, convert to sqft for standard dropdowns)
    let areaInSqft = propArea;
    if (propAreaStr.toLowerCase().includes('acre')) areaInSqft *= 43560;
    else if (propAreaStr.toLowerCase().includes('cent')) areaInSqft *= 435.6;

    if (minArea !== null && areaInSqft < minArea) return false;
    if (maxArea !== null && areaInSqft > maxArea) return false;
  }

  // Text check
  if (textQuery) {
    const dd = property.dynamicData || {};
    const agri = dd.agricultureDetails || {};
    
    const searchableText = [
      property.location,
      property.district,
      property.propertyType,
      property.mandal,
      property.fullName,
      property.price,
      dd.bhk,
      dd.area,
      dd.carpetArea,
      dd.totalArea,
      dd.facing,
      dd.propertyStatus,
      dd.furnishing,
      property.propertyDetails,
      agri.extent,
      agri.soilType,
      agri.waterFacility,
      dd.ventureName,
      dd.plotLocation
    ].filter(Boolean).join(' ').toLowerCase();

    // Check if ALL words in the text query exist in the searchable text
    // E.g. "guntur villa" -> "guntur" AND "villa"
    const words = textQuery.split(/\s+/).filter(w => w.length > 0);
    const matchesText = words.every(word => searchableText.includes(word));
    
    if (!matchesText) return false;
  }

  return true;
};
