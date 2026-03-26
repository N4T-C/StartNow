const crypto = require("crypto");
const AnalysisCache = require("../models/AnalysisCache");
const AnalysisRequest = require("../models/AnalysisRequest");
const { buildRegionSignals, summarizeSignals } = require("../utils/scoring");
const { generateInsights } = require("../services/llmService");
const { getInterestByRegion } = require("../services/trendsService");
const { getIndiaWideCompetition } = require("../services/marketScraper");
const { INDIA_REGIONS } = require("../utils/regions");

const sanitizeText = (value) => {
  if (!value) return "";
  return String(value).replace(/[^a-zA-Z0-9\s\-.,&()]/g, "").trim();
};

const makeCacheKey = (mode, idea, refinement) => {
  const raw = `v2|${mode}|${idea.toLowerCase()}|${(refinement || "").toLowerCase()}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
};

const analyzeController = async (req, res) => {
  try {
    const mode = req.body?.mode === "business" ? "business" : "startup";
    const idea = sanitizeText(req.body?.idea);
    const refinement = sanitizeText(req.body?.refinement);

    if (!idea || idea.length < 3) {
      return res.status(400).json({ error: "Idea must be at least 3 characters." });
    }

    const cacheKey = makeCacheKey(mode, idea, refinement);
    const cached = await AnalysisCache.findOne({ cacheKey }).lean();

    if (cached?.response) {
      await AnalysisRequest.create({
        mode,
        idea,
        refinement,
        opportunityScore: cached.response.opportunityScore,
        trendSignals: cached.response.trendSignals,
        topRegions: cached.response.topRegions.map((region) => ({
          id: region.id,
          name: region.name,
          opportunityScore: region.opportunityScore,
        })),
        source: "cache",
      });

      return res.json(cached.response);
    }

    // Live Data Fetching: Google Trends (Demand) + IndiaMart (Competition)
    const [liveDemandMap, liveCompetitionMap] = await Promise.all([
      getInterestByRegion(idea),
      getIndiaWideCompetition(idea, INDIA_REGIONS)
    ]);

    const allRegions = buildRegionSignals(idea, mode, refinement || undefined, liveDemandMap, liveCompetitionMap);
    const topRegions = allRegions.slice(0, 5);
    const summary = summarizeSignals(allRegions);

    const { insight, profitZones, competitors, providerUsed } = await generateInsights({ mode, idea, refinement, topRegions });

    const response = {
      mode,
      idea,
      refinement,
      opportunityScore: summary.opportunityScore,
      trendSignals: summary.trendSignals,
      competitionLevel: summary.competitionLevel,
      marketSaturation: summary.marketSaturation,
      topRegions,
      allRegions,
      insight,
      profitZones: profitZones || [],
      competitors: competitors || [],
      providerUsed,
    };

    await AnalysisCache.findOneAndUpdate(
      { cacheKey },
      {
        cacheKey,
        mode,
        idea,
        refinement,
        response,
        createdAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await AnalysisRequest.create({
      mode,
      idea,
      refinement,
      opportunityScore: response.opportunityScore,
      trendSignals: response.trendSignals,
      topRegions: response.topRegions.map((region) => ({
        id: region.id,
        name: region.name,
        opportunityScore: region.opportunityScore,
      })),
      source: "live",
    });

    return res.json(response);
  } catch {
    return res.status(500).json({ error: "Unable to run analysis right now." });
  }
};

const historyController = async (_req, res) => {
  try {
    const items = await AnalysisRequest.find().sort({ createdAt: -1 }).limit(15).lean();
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Unable to fetch history." });
  }
};

module.exports = { analyzeController, historyController };
