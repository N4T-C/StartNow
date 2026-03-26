const buildFallbackInsight = (mode, idea, topRegions) => {
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
    riskAnalysis:
      mode === "business"
        ? [
            "High customer acquisition costs in saturated metros.",
            "Regulatory and compliance friction in finance/health-adjacent categories.",
            "Retention risk if pricing and onboarding are not aligned with local expectations.",
          ]
        : undefined,
    marketDashboard: {
       categoryDistribution: [{ category: "Direct", count: 45 }, { category: "Indirect", count: 30 }, { category: "Adjacent", count: 25 }],
       priceDistribution: [{ range: "Value", value: 40 }, { range: "Premium", value: 35 }, { range: "Economy", value: 25 }],
       topOfferings: [{ feature: "Support", frequency: 80 }, { feature: "Reliability", frequency: 70 }, { feature: "Pricing", frequency: 65 }],
       gapAnalysis: [{ feature: "Service", gapScore: 85 }, { feature: "Innovation", gapScore: 70 }, { feature: "Speed", gapScore: 60 }],
       locationDistribution: [{ city: "Mumbai", presence: 80 }, { city: "Bangalore", presence: 75 }, { city: "Delhi", presence: 70 }],
       customerSegments: [{ segment: "Enterprise", percentage: 40 }, { segment: "SMBs", percentage: 35 }, { segment: "Retail", percentage: 25 }],
       bundlingRatio: { bundled: 65, individual: 35 },
       demandTrends: [{ month: "Jan", demand: 40 }, { month: "Mar", demand: 60 }, { month: "Jun", demand: 85 }],
       competitiveDensity: 65,
       differentiationMap: [{ competitor: "A", price: 40, value: 60 }, { competitor: "B", price: 80, value: 75 }],
       finalSummary: {
          mustHaveFeatures: ["High Reliability", "Speed", "Price Transparency"],
          idealPriceRange: "Mid-to-High Premium",
          targetMarket: topRegions[0]?.name || "Tier 1 Metros",
          targetSegment: "Enterprise / B2B clients",
          uniqueOpportunity: "Focus on AI-driven supply chain optimization in high-growth tier 1 cities."
       }
    }
  };
};

module.exports = { buildFallbackInsight };
