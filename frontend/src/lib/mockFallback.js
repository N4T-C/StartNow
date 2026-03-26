export const buildFallbackInsight = (mode, idea, topRegions) => {
  const top = topRegions.slice(0, 3).map((region) => region.name);
  const modeLabel = mode === "startup" ? "startup" : "business";

  return {
    summary: `The ${modeLabel} opportunity for ${idea} is strongest in ${top.join(", ")} based on current momentum and competition-adjusted demand.`,
    reasoning: [
      "Demand and buzz are leading indicators in the top regions.",
      "Competition is moderate enough to allow differentiated positioning.",
      "Regional expansion should begin with one high-scoring market and one adjacent medium-risk market.",
    ],
    opportunities: [
      `Pilot in ${top[0] || "a high-opportunity metro"} with a narrow niche offering.`,
      "Design pricing tiers for high-growth and price-sensitive segments.",
      "Use local distribution or influencer channels to accelerate trust.",
    ],
    competitorAnalysis:
      mode === "business"
        ? [
            "Incumbents are broad but weak in specialized customer support.",
            "Most competitors underinvest in localization and regional partnerships.",
            "Fast iteration on feature quality can create visible market separation.",
          ]
        : undefined,
    riskAnalysis:
      mode === "business"
        ? [
            "High customer acquisition costs in saturated metros.",
            "Regulatory and compliance friction in finance/health-adjacent categories.",
            "Retention risk if pricing and onboarding are not aligned with local expectations.",
          ]
        : undefined,
  };
};
