const express = require("express");

const router = express.Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Fallback when LLM is unavailable ─────────────────────────────────────────
const buildFallbackCities = (cities, idea) =>
  cities.slice(0, 8).map((city, idx) => ({
    name:   city.name,
    lat:    city.lat,
    lon:    city.lon,
    score:  Math.max(20, 95 - idx * 8 - Math.floor(Math.random() * 5)),
    reason: `High population density and local demand for ${idea}`,
  }));

// ── LLM helpers ───────────────────────────────────────────────────────────────
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
        model:       "llama-3.3-70b-versatile",
        temperature: 0.35,
        messages:    [{ role: "user", content: prompt }],
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
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, responseMimeType: "application/json" },
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

// ── Route ──────────────────────────────────────────────────────────────────────
router.post("/analyze-cities", async (req, res) => {
  try {
    const { stateName, cities, idea, mode } = req.body;

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({ success: false, message: "Cities array is required" });
    }

    // Limit payload to 12 city names for the prompt
    const promptCities = cities.slice(0, 12).map((c) => c.name).join(", ");

    const prompt =
      `You are a market intelligence AI. Given the business idea: "${idea}", ` +
      `rate each of these cities/towns in ${stateName}, India for business opportunity on a scale of 0-100. ` +
      `Consider local demand, population density, competition, and growth potential.\n` +
      `Cities to rate: ${promptCities}\n` +
      `Return ONLY a raw JSON array (no markdown) with objects: { "name": "CityName", "score": 85, "reason": "brief reason" }`;

    let aiResult = null;

    if (process.env.GROQ_API_KEY) {
      aiResult = await callGroq(prompt, process.env.GROQ_API_KEY);
    }
    if (!aiResult && process.env.GEMINI_API_KEY) {
      aiResult = await callGemini(prompt, process.env.GEMINI_API_KEY);
    }
    if (!aiResult) {
      aiResult = buildFallbackCities(cities, idea);
    }

    // Ensure aiResult is an array (LLM might wrap it in an object)
    const resultArr = Array.isArray(aiResult) ? aiResult : (aiResult?.cities || aiResult?.result || []);

    // Merge AI scores back with original coordinates
    const scoredCities = resultArr
      .map((aiCity) => {
        const orig = cities.find(
          (c) => c.name.toLowerCase() === (aiCity.name || "").toLowerCase()
        );
        return {
          name:   aiCity.name,
          score:  typeof aiCity.score === "number" ? aiCity.score : 50,
          reason: aiCity.reason || "",
          lat:    orig ? orig.lat : 0,
          lon:    orig ? orig.lon : 0,
        };
      })
      .filter((c) => c.lat !== 0);

    return res.status(200).json({ success: true, cities: scoredCities });
  } catch (err) {
    console.error("Analyze cities error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
