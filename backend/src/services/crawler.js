const cheerio = require("cheerio");
const CompetitorSnapshot = require("../models/CompetitorSnapshot");
const crypto = require("crypto");

async function crawlCompetitor(url, name) {
  try {
    const rawUrl = url.startsWith("http") ? url : `https://${url}`;
    
    // Use an AbortController so fetch doesn't hang indefinitely 
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    let html = "";
    try {
      const response = await fetch(rawUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; StartupSeeker/1.0)',
          'Accept': 'text/html'
        },
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      html = await response.text();
    } finally {
      clearTimeout(timer);
    }
    
    const $ = cheerio.load(html);
    
    // Extract metadata and contents
    const title = $('title').text() || "";
    const metaDescription = $('meta[name="description"]').attr('content') || "";
    
    // Headings
    const headings = $('h1, h2, h3').map((_, el) => $(el).text().trim()).get().filter(Boolean);
    
    // Body Text
    const rawBody = $('body').text().replace(/\s+/g, ' ').trim();
    const bodyText = rawBody.slice(0, 8000);
    
    // Pricing Mentions (split sentences approximately using punctuation, search for keywords)
    const sentences = rawBody.match(/[^.!?]+[.!?]+/g) || [];
    const pricingMentions = sentences
      .map(s => s.trim())
      .filter(line => /\$|₹|pricing|plan|per month|\/mo/i.test(line))
      .slice(0, 50);
      
    // CTAs
    const ctaTexts = $('button, a.btn, [class*="cta"], [class*="button"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 20);
      
    // Feature claims (list items)
    const featureClaims = $('li, [class*="feature"]')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(s => s.length > 10 && s.length < 200)
      .slice(0, 30);
      
    // Generate an ID consistently from the URL structure
    // Since url might have trailing slashes, clean it up 
    const cleanUrl = rawUrl.replace(/\/$/, "");
    const competitorId = crypto.createHash('md5').update(cleanUrl).digest('hex').slice(0, 24);
    
    const snapshotData = {
      competitorId,
      competitorName: name,
      url: cleanUrl,
      crawledAt: new Date(),
      content: {
        title,
        metaDescription,
        headings,
        bodyText,
        pricingMentions,
        ctaTexts,
        featureClaims
      },
      rawHtml: html.slice(0, 15000)
    };

    const newSnapshot = await CompetitorSnapshot.create(snapshotData);
    return newSnapshot;

  } catch (error) {
    console.error(`Error crawling ${url}:`, error.message);
    throw error;
  }
}

module.exports = { crawlCompetitor };
