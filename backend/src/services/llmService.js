const { buildFallbackInsight } = require("../utils/mockFallback");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const normalizeInsight = (raw, fallback) => {
  if (!raw) return { insight: fallback, profitZones: [], competitors: [] };

  const insight = {
    summary: raw.summary || fallback.summary,
    reasoning: Array.isArray(raw.reasoning) && raw.reasoning.length > 0 ? raw.reasoning : fallback.reasoning,
    opportunities:
      Array.isArray(raw.opportunities) && raw.opportunities.length > 0
        ? raw.opportunities
        : fallback.opportunities,
    competitorAnalysis:
      Array.isArray(raw.competitorAnalysis) && raw.competitorAnalysis.length > 0
        ? raw.competitorAnalysis
        : fallback.competitorAnalysis,
    riskAnalysis: Array.isArray(raw.riskAnalysis) && raw.riskAnalysis.length > 0 ? raw.riskAnalysis : fallback.riskAnalysis,
  };

  // Extract geospatial extras — validate each entry has lat/lng
  const profitZones = Array.isArray(raw.profitZones)
    ? raw.profitZones
        .filter((z) => z && typeof z.lat === "number" && typeof z.lng === "number")
        .slice(0, 3)
    : [];

  const competitors = Array.isArray(raw.competitors)
    ? raw.competitors
        .filter((c) => c && typeof c.lat === "number" && typeof c.lng === "number")
        .slice(0, 5)
    : [];

  const marketDashboard = raw.marketDashboard || null;
  const competitorChanges = Array.isArray(raw.competitorChanges) ? raw.competitorChanges : [];

  return { insight, profitZones, competitors, marketDashboard, competitorChanges };
};

const buildPrompt = (mode, idea, refinement, topRegions) => {
  const profitZoneSchema = [
    '  "profitZones": [',
    '    { "name": "City", "lat": 00.0000, "lng": 00.0000, "reason": "brief" },',
    '    { "name": "City", "lat": 00.0000, "lng": 00.0000, "reason": "brief" },',
    '    { "name": "City", "lat": 00.0000, "lng": 00.0000, "reason": "brief" }',
    '  ],',
  ];

  const competitorSchema =
    mode === "business"
        ? [
            '  "competitors": [',
            '    { ',
            '      "name": "Name", "city": "City", "lat": 00.00, "lng": 00.00, ',
            '      "marketShare": "15%", "rating": 4.2,',
            '      "positioning": "Brief core strategy",',
            '      "topInsight": "One strategic weakness or gap",',
            '      "scores": { "Pricing": 85, "UX": 70, "Quality": 90, "Speed": 65, "Support": 80 }',
            '    }',
            '  ]',
          ]
        : ['  "competitors": []'];

  return [
    "You are Startup Seeker intelligence engine.",
    `Mode: ${mode}`,
    `Idea: ${idea}`,
    `Refinement: ${refinement || "none"}`,
    `Top regions from model scoring: ${topRegions.join(", ")}`,
    "Return strict JSON only with this schema:",
    "{",
    '  "summary": "short paragraph",',
    '  "reasoning": ["string", "string", "string"],',
    '  "opportunities": ["string", "string", "string"],',
    '  "competitorAnalysis": ["string", "string", "string"],',
    '  "riskAnalysis": ["string", "string", "string"],',
    '  "competitorSchema": [...],',
    '  "competitorChanges": [',
    '    { "competitorName": "String", "changeType": "pricing/messaging/feature", "summary": "String", "priorityScore": 0, "before": "String", "after": "String", "detectedAt": "ISO date" }',
    '  ],',
    '  "marketDashboard": { ... }',
    '  ...',
    '}',
    "marketDashboard MUST contain 100% data-driven estimations based on actual market history in India.",
    "profitZones must be 3 REAL Indian cities with accurate lat/lng that represent the highest untapped demand + lowest competition for this idea.",
    "If mode is startup, competitors can be empty.",
    "If mode is business, competitors are the top 5 REAL known competitors in India for this idea with realistic market share and Google Maps-style rating.",
  ].join("\n");
};

const fetchFromGroq = async (prompt, apiKey) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.35,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const json = await response.json();
    const text = json?.choices?.[0]?.message?.content;
    if (!text || typeof text !== "string") return null;
    return safeJsonParse(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchFromGemini = async (prompt, apiKey) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) return null;
    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || typeof text !== "string") return null;
    return safeJsonParse(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const generateInsights = async ({ mode, idea, refinement, topRegions }) => {
  const prompt = buildPrompt(
    mode,
    idea,
    refinement,
    topRegions.map((region) => region.name),
  );

  const fallbackInsight = buildFallbackInsight(mode, idea, topRegions);

  let rawInsight = null;
  let providerUsed = "fallback";

  if (process.env.GROQ_API_KEY) {
    rawInsight = await fetchFromGroq(prompt, process.env.GROQ_API_KEY);
    if (rawInsight) providerUsed = "groq";
  }

  if (!rawInsight && process.env.GEMINI_API_KEY) {
    rawInsight = await fetchFromGemini(prompt, process.env.GEMINI_API_KEY);
    if (rawInsight) providerUsed = "gemini";
  }

  const { insight, profitZones, competitors, marketDashboard, competitorChanges } = normalizeInsight(rawInsight, fallbackInsight);

  return { insight, profitZones, competitors, marketDashboard, competitorChanges, providerUsed };
};

module.exports = { generateInsights };
