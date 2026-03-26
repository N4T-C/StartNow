import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export function ChangeFeed({ changes, loading, accent }) {
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("priority");

  const badgeColor = {
    pricing: "#ffaa00",
    messaging: "#0088ff",
    feature: "#00ff88",
    cta: "#aa44ff",
    general: "#888899"
  };

  const getRelativeTime = (isoString) => {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const daysDifference = Math.round((new Date(isoString) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
      const hoursDiff = Math.round((new Date(isoString) - new Date()) / (1000 * 60 * 60));
      return rtf.format(hoursDiff, 'hour');
    }
    return rtf.format(daysDifference, 'day');
  };

  const displayList = useMemo(() => {
    let arr = [...changes];
    if (filterType !== "all") {
      arr = arr.filter((c) => c.changeType === filterType);
    }
    if (sortOrder === "priority") {
      arr.sort((a, b) => b.priorityScore - a.priorityScore);
    } else {
      arr.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
    }
    return arr;
  }, [changes, filterType, sortOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#fff]/20" style={{ borderTopColor: accent }} />
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="text-center py-10 opacity-60">
        <p className="text-sm">No competitor changes detected yet.</p>
        <p className="text-xs mt-2">Add competitors in the tracking tab to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between bg-black/30 p-2 rounded-xl border border-white/5">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-transparent text-xs text-white uppercase font-bold tracking-wider outline-none cursor-pointer p-1"
        >
          <option value="all" className="bg-[#111118]">All Changes</option>
          <option value="pricing" className="bg-[#111118]">Pricing</option>
          <option value="messaging" className="bg-[#111118]">Messaging</option>
          <option value="feature" className="bg-[#111118]">Features</option>
          <option value="cta" className="bg-[#111118]">CTAs</option>
        </select>

        <button
          onClick={() => setSortOrder(prev => prev === "priority" ? "newest" : "priority")}
          className="text-xs text-[#aaaabb] uppercase font-bold tracking-wider px-2 py-1 rounded-lg hover:bg-white/5 transition"
        >
          Sort: {sortOrder === "priority" ? "Highest Priority" : "Newest First"}
        </button>
      </div>

      {/* Feed List */}
      <div className="space-y-4 mt-4">
        {displayList.map((change, i) => {
          const badgeHex = badgeColor[change.changeType] || "#888899";
          const priorityColor = change.priorityScore >= 70 ? "#ff4466" : change.priorityScore >= 40 ? "#ffdd00" : "#888899";

          return (
            <motion.div
              key={change._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-white/10 bg-[#14141a]/60 hover:bg-[#1a1a24] transition duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded-full inline-block w-max">
                    {change.competitorName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md"
                      style={{ color: badgeHex, background: `${badgeHex}22` }}
                    >
                      {change.changeType}
                    </span>
                    <span className="text-[10px] text-[#888899]">{getRelativeTime(change.detectedAt)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-black leading-none" style={{ color: priorityColor }}>
                    {change.priorityScore}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-[#666677] font-bold">Priority</span>
                </div>
              </div>

              <p className="text-sm font-semibold text-white mb-3">
                {change.summary}
              </p>

              {/* Diff blocks */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/5">
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2.5 opacity-70">
                  <p className="text-[9px] uppercase font-bold text-red-400 mb-1">Old</p>
                  <p className="text-xs text-[#aaaabb] line-through line-clamp-3 leading-relaxed">
                    {change.before === "—" ? "None" : change.before}
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                  <p className="text-[9px] uppercase font-bold text-emerald-400 mb-1">New</p>
                  <p className="text-xs text-white line-clamp-3 leading-relaxed">
                    {change.after}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
