const express = require("express");
const { crawlCompetitor } = require("../services/crawler");
const { detectChanges } = require("../services/changeDetector");
const { scoreChanges } = require("../services/competitorScorer");
const { compareCompetitors } = require("../services/dimensionComparator");
const { startScheduledCrawls } = require("../services/scheduledCrawl");

const CompetitorSnapshot = require("../models/CompetitorSnapshot");
const CompetitorChange = require("../models/CompetitorChange");

const router = express.Router();

let crawlsScheduled = false;

router.post("/competitors/crawl", async (req, res) => {
  try {
    const { url, name } = req.body;
    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ success: false, message: "Valid URL required starting with http/https" });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: "Competitor name required" });
    }

    const snapshot = await crawlCompetitor(url, name);

    // Initialise scheduled crawls exactly once
    if (!crawlsScheduled) {
      startScheduledCrawls();
      crawlsScheduled = true;
    }

    // Immediately run change detection if this is not the first scrape
    const newChanges = await detectChanges(snapshot.competitorId);
    
    // Attempt automatic scoring of exact newly created changes
    if (newChanges.length > 0) {
      // Background async to avoid blocking UX response
      const unscored = newChanges.filter(c => c.noveltyScore === 50 && c.relevanceScore === 50);
      scoreChanges(unscored).catch(console.error);
    }

    return res.status(200).json({ success: true, snapshot });
  } catch (error) {
    console.error("Crawl error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/competitors/list", async (req, res) => {
  try {
    const list = await CompetitorSnapshot.aggregate([
      { $sort: { crawledAt: -1 } },
      { 
        $group: { 
          _id: "$competitorId", 
          name: { $first: "$competitorName" }, 
          url: { $first: "$url" }, 
          lastCrawled: { $first: "$crawledAt" } 
        } 
      }
    ]);

    const formatted = list.map(c => ({
      competitorId: c._id,
      name: c.name,
      url: c.url,
      lastCrawled: c.lastCrawled
    }));

    return res.status(200).json({ success: true, list: formatted });
  } catch (error) {
    console.error("List error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/competitors/changes", async (req, res) => {
  try {
    const { competitorId } = req.query;
    const filter = competitorId ? { competitorId } : {};

    const changes = await CompetitorChange.find(filter)
      .sort({ detectedAt: -1, priorityScore: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, changes });
  } catch (error) {
    console.error("Changes error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/competitors/score", async (req, res) => {
  try {
    const { competitorId } = req.body;
    const filter = { noveltyScore: 50, relevanceScore: 50 };
    if (competitorId) filter.competitorId = competitorId;

    const unscored = await CompetitorChange.find(filter).lean();
    
    if (unscored.length === 0) {
      return res.status(200).json({ success: true, scored: 0 });
    }

    const scored = await scoreChanges(unscored);
    
    return res.status(200).json({ success: true, scored: scored.length });
  } catch (error) {
    console.error("Score error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/competitors/compare", async (req, res) => {
  try {
    const { competitorIds, idea } = req.body;
    if (!competitorIds || !Array.isArray(competitorIds)) {
      return res.status(400).json({ success: false, message: "competitorIds array required" });
    }

    const result = await compareCompetitors(competitorIds, idea || "Startup");
    
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Compare error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
