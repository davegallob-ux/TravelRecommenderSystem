/**
 * Normalizes a benefit attribute value (higher is better) to a standard [0, 1] utility scale.
 * Used for attributes with absolute scales (stars, ratings, public transport).
 */
export function normalizeAbsolute(value, minBound, maxBound) {
  const range = maxBound - minBound;
  if (range <= 0) return 1;
  const val = Number(value);
  const normalized = (val - minBound) / range;
  return Math.min(Math.max(normalized, 0), 1); // clamp to [0, 1]
}

/**
 * Normalizes a cost attribute value (lower is better) relatively based on the min/max values
 * present in the dataset. Used for price and distance.
 */
export function normalizeRelativeCost(value, minVal, maxVal) {
  const range = maxVal - minVal;
  if (range <= 0) return 1;
  const val = Number(value);
  const normalized = (maxVal - val) / range;
  return Math.min(Math.max(normalized, 0), 1); // clamp to [0, 1]
}

/**
 * Calculates the Weighted MAUT score for a list of hotels in a city.
 */
export function calculateMaut(cityHotels, weights) {
  if (!cityHotels || cityHotels.length === 0) return [];

  // Find max/min for normalization across the current city to make it relative
  const prices = cityHotels.map(h => h.price);
  const locations = cityHotels.map(h => h.location);
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const minLoc = Math.min(...locations);
  const maxLoc = Math.max(...locations);

  // Clamp and calculate weights sum
  const cleanWeights = {
    price: Math.min(Math.max(Number(weights.price ?? 5), 0), 10),
    location: Math.min(Math.max(Number(weights.location ?? 5), 0), 10),
    stars: Math.min(Math.max(Number(weights.stars ?? 5), 0), 10),
    rating: Math.min(Math.max(Number(weights.rating ?? 5), 0), 10),
    publicTransport: Math.min(Math.max(Number(weights.publicTransport ?? 5), 0), 10),
  };

  const totalWeight = cleanWeights.price + cleanWeights.location + cleanWeights.stars + 
                      cleanWeights.rating + cleanWeights.publicTransport || 1;

  const scored = cityHotels.map(hotel => {
    // Relative Cost normalization
    const normPrice = normalizeRelativeCost(hotel.price, minPrice, maxPrice);
    const normLoc = normalizeRelativeCost(hotel.location, minLoc, maxLoc);

    // Absolute Benefit normalization
    const normStars = normalizeAbsolute(hotel.stars, 1, 5);
    const normRating = normalizeAbsolute(hotel.rating, 1, 10);
    const normTransport = normalizeAbsolute(hotel.publicTransport, 1, 10);

    const priceScore = cleanWeights.price * normPrice;
    const locScore = cleanWeights.location * normLoc;
    const starsScore = cleanWeights.stars * normStars;
    const ratingScore = cleanWeights.rating * normRating;
    const transportScore = cleanWeights.publicTransport * normTransport;

    const rawScore = priceScore + locScore + starsScore + ratingScore + transportScore;
    const percentageScore = (rawScore / totalWeight) * 100;

    return {
      ...hotel,
      matchScore: Math.round(percentageScore),
      breakdown: {
        normPrice: normPrice.toFixed(2),
        normLoc: normLoc.toFixed(2),
        normStars: normStars.toFixed(2),
        normRating: normRating.toFixed(2),
        normTransport: normTransport.toFixed(2),
        pricePts: priceScore.toFixed(1),
        locPts: locScore.toFixed(1),
        starsPts: starsScore.toFixed(1),
        ratingPts: ratingScore.toFixed(1),
        transportPts: transportScore.toFixed(1),
        totalWeight: totalWeight.toFixed(1)
      }
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Filters a list of hotels using constraint-based rules.
 */
export function filterConstraints(cityHotels, constraints) {
  if (!cityHotels) return [];
  return cityHotels.filter(hotel => {
    return hotel.price <= (constraints.maxPrice ?? 300) &&
           hotel.location <= (constraints.maxLocation ?? 10) &&
           hotel.stars >= (constraints.minStars ?? 3) &&
           hotel.rating >= (constraints.minRating ?? 7) &&
           hotel.publicTransport >= (constraints.minTransport ?? 5);
  });
}
