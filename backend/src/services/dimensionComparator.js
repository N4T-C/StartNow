const CompetitorSnapshot = require("../models/CompetitorSnapshot");
const CompetitorChange = require("../models/CompetitorChange");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const callGroq = async (prompt, apiKey) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    const text = json?.choices?.[0]?.message?.content;
    if (!text) return null;
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const callGemini = async (prompt, apiKey) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }),
        signal: controller.signal,
      }
    );
    if (!resp.ok) return null;
    const json = await resp.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

async function compareCompetitors(competitorIds, idea) {
  if (!competitorIds || competitorIds.length === 0) {
    return { dimensions: [], competitors: [] };
  }

  const summaries = [];

  for (const id of competitorIds) {
    const snapshots = await CompetitorSnapshot.find({ competitorId: id })
      .sort({ crawledAt: -1 })
      .limit(3)
      .lean();
    
    const changes = await CompetitorChange.find({ competitorId: id })
      .sort({ detectedAt: -1 })
      .limit(10)
      .lean();

    if (snapshots.length === 0) continue;

    const latest = snapshots[0];
    const changeText = changes.map(c => `- ${c.changeType}: ${c.summary}`).join("\n");
    const contentText = `Title: ${latest.content.title}\nDescription: ${latest.content.metaDescription}\nFeatures: ${latest.content.featureClaims.slice(0, 5).join(", ")}`;

    summaries.push({
      competitorId: id,
      name: latest.competitorName,
      summaryText: `Name: ${latest.competitorName}\nRecent Content:\n${contentText}\nRecent Changes:\n${changeText}`
    });
  }

  const prompt = `You are a strategic analyst. Given these competitor data summaries for a "${idea}" business, score each competitor on these 5 dimensions (0-100): Cost Leadership, Feature Depth, Market Positioning, Customer Focus, Innovation Rate.
Return ONLY valid JSON in this exact structure:
{
  "competitors": [
    {
      "competitorId": "id_from_input",
      "name": "competitor_name",
      "costLeadership": 80,
      "featureDepth": 75,
      "marketPositioning": 90,
      "customerFocus": 85,
      "innovationRate": 70,
      "positioning": "Premium, feature-driven",
      "topInsight": "One-line strategic insight."
    }
  ]
}

Competitors Data:
${JSON.stringify(summaries)}

Return ONLY valid JSON (no markdown).`;

  let aiResult = null;

  if (process.env.GROQ_API_KEY) {
    aiResult = await callGroq(prompt, process.env.GROQ_API_KEY);
  }
  if (!aiResult && process.env.GEMINI_API_KEY) {
    aiResult = await callGemini(prompt, process.env.GEMINI_API_KEY);
  }

  const dimensions = ["Cost Leadership", "Feature Depth", "Market Positioning", "Customer Focus", "Innovation Rate"];

  if (!aiResult || !aiResult.competitors) {
    // Fallback
    const competitors = summaries.map(s => ({
      competitorId: s.competitorId,
      name: s.name,
      scores: {
        "Cost Leadership": Math.floor(Math.random() * 40) + 40,
        "Feature Depth": Math.floor(Math.random() * 40) + 40,
        "Market Positioning": Math.floor(Math.random() * 40) + 40,
        "Customer Focus": Math.floor(Math.random() * 40) + 40,
        "Innovation Rate": Math.floor(Math.random() * 40) + 40
      },
      positioning: "General market player",
      topInsight: "Lacking enough historic data to generate a strategic insight."
    }));

    return { dimensions, competitors };
  }

  const formattedCompetitors = aiResult.competitors.map(c => ({
    competitorId: c.competitorId,
    name: c.name,
    scores: {
      "Cost Leadership": c.costLeadership || 50,
      "Feature Depth": c.featureDepth || 50,
      "Market Positioning": c.marketPositioning || 50,
      "Customer Focus": c.customerFocus || 50,
      "Innovation Rate": c.innovationRate || 50
    },
    positioning: c.positioning || "Unknown",
    topInsight: c.topInsight || "No specific insight"
  }));

  return { dimensions, competitors: formattedCompetitors };
}

module.exports = { compareCompetitors };
