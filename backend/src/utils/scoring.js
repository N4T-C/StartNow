const { INDIA_REGIONS } = require("./regions");

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const levelFromScore = (score) => {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
};

const competitionBand = (avgCompetition) => {
  if (avgCompetition >= 72) return "High";
  if (avgCompetition >= 46) return "Medium";
  return "Low";
};

const saturationBand = (avgSaturation) => {
  if (avgSaturation >= 72) return "Saturated";
  if (avgSaturation >= 46) return "Developing";
  return "Emerging";
};

const buildRegionSignals = (idea, mode, refinement, liveDemandMap = new Map(), liveCompMap = new Map()) => {
  const seedRoot = `${idea.toLowerCase()}|${(refinement || "").toLowerCase()}|${mode}`;

  return INDIA_REGIONS.map((region, index) => {
    const seed = hashString(`${seedRoot}|${region.id}|${index}`);
    
    // 1. Live Demand Integration (Google Trends)
    const rawDemand = liveDemandMap.get(region.isoCode);
    const hasLiveDemand = rawDemand !== undefined;
    
    // 2. Live Competition Integration (IndiaMart)
    const rawComp = liveCompMap.get(region.id);
    const hasLiveComp = rawComp !== undefined;
    
    const growth = clamp(35 + (seed % 66));
    
    // If live data exists, use it (0-100), otherwise fallback to seeded random
    const demand = hasLiveDemand ? clamp(rawDemand) : clamp(30 + ((seed >> 2) % 71));
    const buzz = clamp(25 + ((seed >> 4) % 76));

    const competitionBase = mode === "business" ? 50 : 38;
    const competition = clamp(competitionBase + ((seed >> 3) % 43));

    // Saturation Logic: If we have live competitor count, map it (e.g. 500+ is highly saturated)
    const saturation = hasLiveComp 
      ? clamp(Math.round((rawComp / 800) * 100)) 
      : clamp((mode === "business" ? 45 : 30) + ((seed >> 6) % 50));

    const riskBase = mode === "business" ? 35 : 25;
    const risk = clamp(riskBase + ((seed >> 7) % 45));

    // Scoring Formula: Adjust weights based on live data availability
    const demandWeight = hasLiveDemand ? 0.45 : 0.36;
    const saturationWeight = hasLiveComp ? 0.25 : 0.18;
    const growthWeight = (hasLiveDemand || hasLiveComp) ? 0.25 : 0.34;

    const opportunityScore = clamp(
      Math.round(
        growth * growthWeight + 
        demand * demandWeight + 
        buzz * 0.25 - 
        competition * 0.20 - 
        saturation * saturationWeight - 
        risk * 0.12 + 
        28
      ),
    );

    let dataSource = "Seeded Intelligence";
    if (hasLiveDemand && hasLiveComp) dataSource = "Google Trends + IndiaMart Live";
    else if (hasLiveDemand) dataSource = "Google Trends Live";
    else if (hasLiveComp) dataSource = "IndiaMart Live";

    return {
      id: region.id,
      name: region.name,
      isoCode: region.isoCode,
      lat: region.lat,
      lng: region.lng,
      opportunityScore,
      level: levelFromScore(opportunityScore),
      growth,
      demand,
      buzz,
      competition,
      saturation,
      risk,
      dataSource
    };
  }).sort((a, b) => b.opportunityScore - a.opportunityScore);
};

const summarizeSignals = (regions) => {
  const total = regions.reduce(
    (acc, region) => {
      acc.score += region.opportunityScore;
      acc.growth += region.growth;
      acc.demand += region.demand;
      acc.buzz += region.buzz;
      acc.competition += region.competition;
      acc.saturation += region.saturation;
      return acc;
    },
    { score: 0, growth: 0, demand: 0, buzz: 0, competition: 0, saturation: 0 },
  );

  const len = Math.max(regions.length, 1);

  return {
    opportunityScore: Math.round(total.score / len),
    trendSignals: {
      growth: Math.round(total.growth / len),
      demand: Math.round(total.demand / len),
      buzz: Math.round(total.buzz / len),
    },
    competitionLevel: competitionBand(total.competition / len),
    marketSaturation: saturationBand(total.saturation / len),
  };
};

module.exports = { buildRegionSignals, summarizeSignals };
