const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Scrapes IndiaMart for the count of products/suppliers for a niche in a state.
 * @param {string} niche The niche (e.g. "ev charging")
 * @param {string} state The state name (e.g. "Maharashtra")
 * @returns {Promise<number>} Approximate count of suppliers
 */
async function getSupplierCount(niche, state) {
  try {
    const query = encodeURIComponent(`${niche} in ${state}`);
    const url = `https://dir.indiamart.com/search.mp?ss=${query}`;
    
    // Using a basic user agent to avoid instant blocks
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    const headerText = $('h1').text() || $('body').text();
    
    // Look for "(X products available)" pattern
    const match = headerText.match(/([\d,]+)\s+products\s+available/i);
    if (match && match[1]) {
      const count = parseInt(match[1].replace(/,/g, ''), 10);
      return count;
    }

    return 0; // Fallback if no count found
  } catch (error) {
    console.error(`Scraping Error for ${state}:`, error.message);
    return 0;
  }
}

/**
 * Batches scraping for multiple regions.
 */
async function getIndiaWideCompetition(niche, regions) {
  // To verify efficiency and not spam, we'll only scrape the TOP 5 regions 
  // and extrapolate for others using LLM logic or baseline.
  // Actually, let's try to get all if they are within time limits.
  
  const results = new Map();
  const promises = regions.map(r => getSupplierCount(niche, r.name).then(count => {
    results.set(r.id, count);
  }));

  await Promise.all(promises);
  return results;
}

module.exports = { getSupplierCount, getIndiaWideCompetition };
