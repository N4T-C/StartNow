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
  if (!raw) return fallback;

  return {
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
};

const buildPrompt = (mode, idea, refinement, topRegions) => {
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
    '  "riskAnalysis": ["string", "string", "string"]',
    "}",
    "If mode is startup, competitorAnalysis and riskAnalysis can still be present but concise.",
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

  return {
    insight: normalizeInsight(rawInsight, fallbackInsight),
    providerUsed,
  };
};

module.exports = { generateInsights };
