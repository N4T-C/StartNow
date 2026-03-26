const cron = require("node-cron");
const CompetitorSnapshot = require("../models/CompetitorSnapshot");
const { crawlCompetitor } = require("./crawler");
const { detectChanges } = require("./changeDetector");
const { scoreChanges } = require("./competitorScorer");

let isScheduled = false;

function startScheduledCrawls() {
  if (isScheduled) return;
  isScheduled = true;
  console.log("⏱️ Scheduled crawls activated (every 6 hours)");

  cron.schedule('0 */6 * * *', async () => {
    try {
      console.log("🔄 Running scheduled competitor crawls...");
      // Get all unique competitor URLs
      const uniqueCompetitors = await CompetitorSnapshot.aggregate([
        { $sort: { crawledAt: -1 } },
        { $group: { _id: "$competitorId", url: { $first: "$url" }, name: { $first: "$competitorName" } } }
      ]);
      
      for (const comp of uniqueCompetitors) {
        if (!comp.url) continue;
        console.log(`Crawling ${comp.name} - ${comp.url}`);
        await crawlCompetitor(comp.url, comp.name);
        
        // Detect and score changes immediately after auto-crawl
        const newChanges = await detectChanges(comp._id);
        if (newChanges.length > 0) {
          const unscored = newChanges.filter(c => c.noveltyScore === 50 && c.relevanceScore === 50);
          await scoreChanges(unscored);
        }
      }
      
      console.log("✅ Scheduled competitor crawls completed.");
    } catch (err) {
      console.error("Failed scheduled crawl:", err);
    }
  });
}

module.exports = { startScheduledCrawls };
