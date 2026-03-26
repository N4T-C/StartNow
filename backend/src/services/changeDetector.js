const CompetitorSnapshot = require("../models/CompetitorSnapshot");
const CompetitorChange = require("../models/CompetitorChange");

async function detectChanges(competitorId) {
  try {
    const snapshots = await CompetitorSnapshot.find({ competitorId })
      .sort({ crawledAt: -1 })
      .limit(2)
      .lean();

    if (snapshots.length < 2) {
      return []; // Not enough history
    }

    const [neu, old] = snapshots;
    const oldContent = old.content || {};
    const newContent = neu.content || {};

    const detectedChanges = [];

    // Helper to find additions in arrays
    const findNewItems = (oldArr, newArr) => {
      const oldSet = new Set((oldArr || []).map(s => s.trim().toLowerCase()));
      return (newArr || []).filter(s => s.trim() && !oldSet.has(s.trim().toLowerCase()));
    };

    // 1. Headings (messaging)
    const newHeadings = findNewItems(oldContent.headings, newContent.headings);
    newHeadings.forEach(h => {
      detectedChanges.push({
        competitorId,
        competitorName: neu.competitorName,
        changeType: "messaging",
        field: "headings",
        before: "—",
        after: h.slice(0, 500),
        summary: `Messaging changed: ${h.slice(0, 120)}`
      });
    });

    // 2. Pricing Mentions
    const newPricing = findNewItems(oldContent.pricingMentions, newContent.pricingMentions);
    newPricing.forEach(p => {
      detectedChanges.push({
        competitorId,
        competitorName: neu.competitorName,
        changeType: "pricing",
        field: "pricingMentions",
        before: "—",
        after: p.slice(0, 500),
        summary: `Pricing changed: ${p.slice(0, 120)}`
      });
    });

    // 3. CTA Texts
    const newCTAs = findNewItems(oldContent.ctaTexts, newContent.ctaTexts);
    newCTAs.forEach(cta => {
      detectedChanges.push({
        competitorId,
        competitorName: neu.competitorName,
        changeType: "cta",
        field: "ctaTexts",
        before: "—",
        after: cta.slice(0, 500),
        summary: `CTA changed: ${cta.slice(0, 120)}`
      });
    });

    // 4. Feature Claims
    const newFeatures = findNewItems(oldContent.featureClaims, newContent.featureClaims);
    newFeatures.forEach(f => {
      detectedChanges.push({
        competitorId,
        competitorName: neu.competitorName,
        changeType: "feature",
        field: "featureClaims",
        before: "—",
        after: f.slice(0, 500),
        summary: `Feature added: ${f.slice(0, 120)}`
      });
    });

    // 5. General (Title or Meta)
    if (oldContent.title !== newContent.title) {
      detectedChanges.push({
        competitorId,
        competitorName: neu.competitorName,
        changeType: "general",
        field: "title",
        before: (oldContent.title || "").slice(0, 500),
        after: (newContent.title || "").slice(0, 500),
        summary: `Title changed to: ${(newContent.title || "").slice(0, 100)}`
      });
    }

    if (oldContent.metaDescription !== newContent.metaDescription) {
      detectedChanges.push({
        competitorId,
        competitorName: neu.competitorName,
        changeType: "general",
        field: "metaDescription",
        before: (oldContent.metaDescription || "").slice(0, 500),
        after: (newContent.metaDescription || "").slice(0, 500),
        summary: `Meta description updated`
      });
    }

    const savedChanges = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Save and calc frequency
    for (const change of detectedChanges) {
      const frequencyCount = await CompetitorChange.countDocuments({
        competitorId,
        field: change.field,
        detectedAt: { $gte: thirtyDaysAgo }
      });
      
      const frequencyScore = Math.min(100, Math.max(0, frequencyCount * 15)); // pseudo logic
      
      const newChange = await CompetitorChange.create({
        ...change,
        noveltyScore: 50,
        frequencyScore,
        relevanceScore: 50,
        priorityScore: 0,
        detectedAt: new Date()
      });
      savedChanges.push(newChange);
    }

    return savedChanges;

  } catch (error) {
    console.error(`Error detecting changes for ${competitorId}:`, error);
    throw error;
  }
}

module.exports = { detectChanges };
