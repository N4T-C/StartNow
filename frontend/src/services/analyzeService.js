const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function analyzeIdea(payload) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Analysis failed");
  }

  return response.json();
}

export async function fetchHistory() {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) return { items: [] };
  return response.json();
}
