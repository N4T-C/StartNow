import { INDIA_REGIONS } from "./regions";

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

export const buildRegionSignals = (idea, mode, refinement) => {
  const seedRoot = `${idea.toLowerCase()}|${(refinement || "").toLowerCase()}|${mode}`;

  return INDIA_REGIONS.map((region, index) => {
    const seed = hashString(`${seedRoot}|${region.id}|${index}`);
    const growth = clamp(35 + (seed % 66));
    const demand = clamp(30 + ((seed >> 2) % 71));
    const buzz = clamp(25 + ((seed >> 4) % 76));

    const competitionBase = mode === "business" ? 50 : 38;
    const competition = clamp(competitionBase + ((seed >> 3) % 43));

    const saturationBase = mode === "business" ? 45 : 30;
    const saturation = clamp(saturationBase + ((seed >> 6) % 50));

    const riskBase = mode === "business" ? 35 : 25;
    const risk = clamp(riskBase + ((seed >> 7) % 45));

    const opportunityScore = clamp(
      Math.round(growth * 0.34 + demand * 0.36 + buzz * 0.3 - competition * 0.22 - saturation * 0.18 - risk * 0.12 + 28),
    );

    return {
      id: region.id,
      name: region.name,
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
    };
  }).sort((a, b) => b.opportunityScore - a.opportunityScore);
};

export const summarizeSignals = (regions) => {
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
