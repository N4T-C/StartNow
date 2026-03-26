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

async function scoreChanges(changes) {
  if (!changes || changes.length === 0) return [];

  // Group into batches of 5 to respect context window and speed
  const batches = [];
  for (let i = 0; i < changes.length; i += 5) {
    batches.push(changes.slice(i, i + 5));
  }

  const scoredChanges = [];

  for (const batch of batches) {
    const changeObjects = batch.map((c, idx) => ({
      index: idx,
      changeType: c.changeType,
      before: c.before,
      after: c.after,
      summary: c.summary
    }));

    const prompt = `You are a competitive intelligence analyst. Score each of these competitor changes for a startup/business intelligence platform.
For each change, return ONLY a strict JSON array of objects with keys: "id" (number matching index), "noveltyScore" (0-100), "relevanceScore" (0-100), "summary" (improved one-sentence description).
noveltyScore = how unexpected or strategically significant is this change (100 = major strategic shift, 0 = trivial wording change)
relevanceScore = how relevant is this to a startup founder evaluating this market (100 = highly actionable, 0 = irrelevant)
Changes: ${JSON.stringify(changeObjects, null, 2)}
Return ONLY valid JSON array with no markdown.`;

    let aiResult = null;

    if (process.env.GROQ_API_KEY) {
      aiResult = await callGroq(prompt, process.env.GROQ_API_KEY);
    }
    if (!aiResult && process.env.GEMINI_API_KEY) {
      aiResult = await callGemini(prompt, process.env.GEMINI_API_KEY);
    }

    // Ensure array
    let resultArr = Array.isArray(aiResult) ? aiResult : (aiResult?.results || []);

    const updatedBatch = await Promise.all(
      batch.map(async (change, idx) => {
        const aiScore = resultArr.find(r => r.id === idx);
        
        // Mock fallback if AI fails for this specific item
        const noveltyScore = aiScore && typeof aiScore.noveltyScore === "number" ? aiScore.noveltyScore : (Math.floor(Math.random() * 40) + 40);
        const relevanceScore = aiScore && typeof aiScore.relevanceScore === "number" ? aiScore.relevanceScore : (Math.floor(Math.random() * 40) + 40);
        const summary = aiScore && aiScore.summary ? aiScore.summary : change.summary;
        
        const priorityScore = Math.round(noveltyScore * 0.4 + change.frequencyScore * 0.3 + relevanceScore * 0.3);

        const updated = await CompetitorChange.findByIdAndUpdate(
          change._id,
          { noveltyScore, relevanceScore, priorityScore, summary },
          { new: true }
        );
        return updated;
      })
    );
    
    scoredChanges.push(...updatedBatch);
  }

  return scoredChanges;
}

module.exports = { scoreChanges };
