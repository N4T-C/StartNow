import { useState } from "react";
import { CopyPlus, Clock, ExternalLink } from "lucide-react";

export function AddCompetitorForm({ competitors, onCrawled, accent }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const handleCrawl = async (e) => {
    e.preventDefault();
    if (!url.startsWith("http")) {
      setError("URL must start with http:// or https://");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/competitors/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, name })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`✓ Crawl complete. Analysis engine will detect any UI/Text changes in the background.`);
        setName("");
        setUrl("");
        if (onCrawled) onCrawled();
      } else {
        setError(data.message || "Failed to crawl target.");
      }
    } catch (e) {
      console.error(e);
      setError("Network or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Area */}
      <div className="p-5 bg-black/40 border border-white/5 rounded-2xl shadow-xl shadow-black/50">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#f0f0f0] mb-4 flex items-center gap-2">
          <CopyPlus className="w-4 h-4" style={{ color: accent }} />
          Add Tracked Competitor
        </h3>

        <form onSubmit={handleCrawl} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#888899] tracking-wider ml-1">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Instamart"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111118] border border-white/10 text-white text-sm outline-none transition focus:border-cyan-500/50 focus:bg-[#1a1a24]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#888899] tracking-wider ml-1">Company Landing/Product URL</label>
            <input
              type="url"
              required
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111118] border border-white/10 text-white text-sm outline-none transition focus:border-cyan-500/50 focus:bg-[#1a1a24]"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-semibold text-red-400 align-middle">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-semibold text-emerald-400 align-middle">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex justify-center items-center py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition disabled:opacity-50 overflow-hidden"
            style={{
              background: `linear-gradient(45deg, ${accent}33, transparent)`,
              color: accent,
              border: `1px solid ${accent}66`
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-[2px] border-current border-t-transparent" />
                Crawling Target...
              </span>
            ) : "Crawl & Add to Tracking"}
          </button>
        </form>
      </div>

      {/* Target List */}
      <div className="p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#888899] mb-4">
          Actively Tracked Targets ({competitors.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {competitors.map(c => (
            <div
              key={c.competitorId}
              className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-[#0a0a0f] hover:bg-[#111118] transition"
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="text-xs font-extrabold text-[#f0f0f0] truncate pr-2">
                  {c.name}
                </span>
                <span className="text-[9px] font-mono text-[#888899] truncate pr-2 flex items-center gap-1.5">
                  <Clock className="w-2.5 h-2.5 text-emerald-500/70" />
                  {new Date(c.lastCrawled).toLocaleString("en-GB", { 
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={async () => {
                    const btn = document.getElementById(`recrawl-${c.competitorId}`);
                    if (btn) btn.classList.add("animate-spin", "text-cyan-400");
                    await fetch(`${API_BASE}/competitors/crawl`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ url: c.url, name: c.name })
                    });
                    if (btn) btn.classList.remove("animate-spin", "text-cyan-400");
                    if (onCrawled) onCrawled();
                  }}
                  title="Force Re-crawl"
                  className="p-2 bg-white/5 rounded-lg text-[#aaaabb] hover:text-cyan-400 hover:bg-white/10 transition"
                >
                  <Clock id={`recrawl-${c.competitorId}`} className="w-3.5 h-3.5" />
                </button>
                <a 
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Visit Website"
                  className="p-2 bg-white/5 rounded-lg text-[#aaaabb] hover:text-white hover:bg-white/10 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
          {competitors.length === 0 && (
            <p className="text-xs text-[#666677] italic col-span-2">
              No targets tracked. Start your competitive pipeline above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
