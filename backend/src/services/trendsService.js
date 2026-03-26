const googleTrends = require("google-trends-api");

/**
 * Fetches real search interest data for a given niche across Indian states.
 * @param {string} keyword The niche/keyword to analyze (e.g. "electric vehicles")
 * @returns {Promise<Map<string, number>>} Map of ISO code (e.g. "IN-MH") to interest score (0-100)
 */
async function getInterestByRegion(keyword) {
  try {
    const results = await googleTrends.interestByRegion({
      keyword: keyword,
      geo: 'IN',
      resolution: 'REGION',
    });

    const parsed = JSON.parse(results);
    const regionData = parsed.default.geoMapData || [];
    
    const scores = new Map();
    regionData.forEach(item => {
      // item.geoCode is "IN-MH", etc.
      // item.value[0] is the score
      if (item.geoCode && item.value && item.value.length > 0) {
        scores.set(item.geoCode, item.value[0]);
      }
    });

    return scores;
  } catch (error) {
    console.error("Google Trends Error:", error);
    // Return empty map on error, will fallback to seeded random in scoring.js
    return new Map();
  }
}

module.exports = { getInterestByRegion };
