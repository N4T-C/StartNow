const express = require("express");

const router = express.Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Indian currency formatter ─────────────────────────────────────────────────
const inr = (n) => {
  const num = Math.round(Number(n) || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

// ── Mock fallback ─────────────────────────────────────────────────────────────
const mockFallback = (idea) => ({
  recommendedLocation: { name: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567 },
  reasoning: `Pune is one of India's fastest-growing tier-2 cities with a young, educated population and rising disposable income. For "${idea}", Pune offers a blend of tech-savvy consumers, lower operational costs compared to Mumbai, and excellent road connectivity to the rest of Maharashtra. Its thriving startup ecosystem and growing middle class make it an untapped goldmine for expansion.`,
  financials: {
    staffNeeded: 12,
    salaryCostPerMonth: 120000,
    rentCostPerMonth: 75000,
    transportSavingsPerMonth: 160000,
    setupCost: 600000,
    breakEvenMonths: 12,
    marketValueIncreasePercent: 12,
    revenueProjectionYear1: 2880000,
  },
});

// ── Groq helper ───────────────────────────────────────────────────────────────
const callGroq = async (prompt, apiKey) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const resp = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    const text = json?.choices?.[0]?.message?.content;
    if (!text) return null;
    // Strip markdown fences
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

// ── Gemini helper ─────────────────────────────────────────────────────────────
const callGemini = async (prompt, apiKey) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
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

// ── Route ─────────────────────────────────────────────────────────────────────
router.post("/predict-next-shop", async (req, res) => {
  try {
    const { userId, idea, existingPins = [], mode } = req.body;

    if (!idea || idea.trim().length < 3) {
      return res.status(400).json({ success: false, message: "idea required" });
    }

    const pinsDescription =
      existingPins.length > 0
        ? existingPins
            .map((p) => `${p.type || "shop"} at (${p.lat}, ${p.lng})`)
            .join("; ")
        : "No existing locations yet";

    const prompt = `You are a business expansion AI for the Indian market.
The user runs a business: "${idea}"
Mode: ${mode || "startup"}
Their existing locations: ${pinsDescription}

Based on market gaps, population density, transport routes, and demand patterns in India, recommend the single best location for their next shop or warehouse.

Return ONLY raw JSON (no markdown, no code blocks) with this exact structure:
{
  "recommendedLocation": { "name": "City, State", "lat": 00.0000, "lng": 00.0000 },
  "reasoning": "Why this location is best (2-3 sentences)",
  "financials": {
    "staffNeeded": 10,
    "salaryCostPerMonth": 100000,
    "rentCostPerMonth": 80000,
    "transportSavingsPerMonth": 150000,
    "setupCost": 500000,
    "breakEvenMonths": 14,
    "marketValueIncreasePercent": 10,
    "revenueProjectionYear1": 2400000
  }
}`;

    let result = null;

    if (process.env.GROQ_API_KEY) {
      result = await callGroq(prompt, process.env.GROQ_API_KEY);
    }
    if (!result && process.env.GEMINI_API_KEY) {
      result = await callGemini(prompt, process.env.GEMINI_API_KEY);
    }
    if (!result) {
      result = mockFallback(idea);
    }

    // Ensure financials has all required keys with sane defaults
    const f = result.financials || {};
    const netMonthlyBenefit =
      (Number(f.transportSavingsPerMonth) || 0) -
      (Number(f.salaryCostPerMonth) || 0) -
      (Number(f.rentCostPerMonth) || 0);

    const financialsFormatted = {
      staffNeeded: f.staffNeeded || 10,
      salaryCostPerMonth: inr(f.salaryCostPerMonth || 100000),
      rentCostPerMonth: inr(f.rentCostPerMonth || 80000),
      transportSavingsPerMonth: inr(f.transportSavingsPerMonth || 150000),
      netMonthlyBenefit: inr(Math.abs(netMonthlyBenefit)),
      netMonthlyBenefitPositive: netMonthlyBenefit >= 0,
      setupCost: inr(f.setupCost || 500000),
      breakEvenMonths: f.breakEvenMonths || 14,
      marketValueIncreasePercent: f.marketValueIncreasePercent || 10,
      revenueProjectionYear1: inr(f.revenueProjectionYear1 || 2400000),
    };

    return res.status(200).json({
      success: true,
      recommendedLocation: result.recommendedLocation,
      reasoning: result.reasoning,
      financials: financialsFormatted,
    });
  } catch (err) {
    console.error("predict-next-shop error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
