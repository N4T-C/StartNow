import { motion } from "framer-motion";
import { Activity, AlertTriangle, BarChart3, Flame, Radar, TrendingUp, X } from "lucide-react";

const MotionDiv = motion.div;
const MotionAside = motion.aside;

function TrendBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#aaaabb]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#1a1a2a]">
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="h-2 rounded-full shadow-[0_0_8px_currentColor]"
          style={{ backgroundColor: color, color: color }}
        />
      </div>
    </div>
  );
}

export function InsightPanel({ open, onClose, loading, mode, data, history = [], focusedRegionId }) {
  const accentColor = mode === "startup" ? "#00ff88" : "#ff8800";

  const focusedRegion = focusedRegionId ? data?.allRegions?.find(r => r.id === focusedRegionId) : null;

  const displayData = focusedRegion ? {
    opportunityScore: focusedRegion.opportunityScore,
    trendSignals: {
      growth: focusedRegion.growth,
      demand: focusedRegion.demand,
      buzz: focusedRegion.buzz
    },
    competitionLevel: focusedRegion.competition >= 70 ? "High" : focusedRegion.competition >= 40 ? "Medium" : "Low",
    marketSaturation: focusedRegion.saturation >= 70 ? "Saturated" : focusedRegion.saturation >= 40 ? "Developing" : "Emerging",
    name: focusedRegion.name
  } : {
    opportunityScore: data?.opportunityScore,
    trendSignals: data?.trendSignals,
    competitionLevel: data?.competitionLevel,
    marketSaturation: data?.marketSaturation,
    name: "National Average"
  };

  return (
    <MotionAside
      initial={false}
      animate={{ x: open ? 0 : 420, opacity: open ? 1 : 0.5 }}
      transition={{ type: "spring", damping: 24, stiffness: 210 }}
      className="pointer-events-auto glass-panel absolute right-0 top-0 z-[4000] h-full w-full max-w-md border-l border-white/10 p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-wide text-[#f0f0f0]">Market Intelligence</h2>
          <span 
            className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            {focusedRegion ? focusedRegion.name : mode}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 transition text-[#888899] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!data || loading ? (
        <div className="space-y-3 pt-4">
          <div className="h-22 animate-pulse rounded-2xl bg-[#111118]" />
          <div className="h-18 animate-pulse rounded-2xl bg-[#111118]" />
          <div className="h-28 animate-pulse rounded-2xl bg-[#111118]" />
        </div>
      ) : (
        <div className="no-scrollbar h-[calc(100%-2rem)] space-y-4 overflow-y-auto pr-1 pb-8">
          <article className="rounded-2xl border border-white/5 bg-[#111118] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase text-[#aaaabb]">
              <Radar className="h-4 w-4" style={{ color: accentColor }} />
              {displayData.name} Score
            </div>
            <p className="text-4xl font-bold text-[#f0f0f0]">{displayData.opportunityScore}</p>
            {!focusedRegion && <p className="text-xs text-[#666677]">Provider: {data.providerUsed}</p>}
            {focusedRegion?.dataSource && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#666677]">
                 Source: {focusedRegion.dataSource}
              </p>
            )}
          </article>

          <article className="rounded-2xl border border-white/5 bg-[#111118] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-[#aaaabb]">
              <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
              Trend Signals
            </div>
            <div className="space-y-3">
              <TrendBar label="Growth" value={displayData.trendSignals.growth} color={accentColor} />
              <TrendBar label="Demand" value={displayData.trendSignals.demand} color={accentColor} />
              <TrendBar label="Buzz" value={displayData.trendSignals.buzz} color={accentColor} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/5 bg-[#111118] p-4 text-sm text-[#aaaabb]">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-[#aaaabb]">
              <BarChart3 className="h-4 w-4" style={{ color: accentColor }} />
              Competition + Saturation
            </div>
            <p className="font-medium text-[#f0f0f0]">Competition: {displayData.competitionLevel}</p>
            <p className="font-medium text-[#f0f0f0]">Saturation: {displayData.marketSaturation}</p>
          </article>

          <article className="rounded-2xl border border-white/5 bg-[#111118] p-4 text-sm text-[#aaaabb]">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-[#aaaabb]">
              <Flame className="h-4 w-4" style={{ color: accentColor }} />
              AI Insights
            </div>
            <p className="mb-2 text-[#f0f0f0] font-medium">{data.insight.summary}</p>
            <ul className="space-y-1">
              {data.insight.reasoning.map((line) => (
                <li key={line} className="break-words">- {line}</li>
              ))}
            </ul>
          </article>

          {mode === "business" ? (
            <article className="rounded-2xl border border-white/5 bg-[#111118] p-4 text-sm text-[#aaaabb]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-[#aaaabb]">
                <Activity className="h-4 w-4" style={{ color: accentColor }} />
                Business Signals
              </div>
              <p className="mb-2 font-semibold text-[#f0f0f0]">Competitor analysis</p>
              <ul className="mb-3 space-y-1">
                {(data.insight.competitorAnalysis || []).map((line) => (
                  <li key={line} className="break-words">- {line}</li>
                ))}
              </ul>
              <p className="mb-2 font-semibold text-[#f0f0f0]">Risk analysis</p>
              <ul className="space-y-1">
                {(data.insight.riskAnalysis || []).map((line) => (
                  <li key={line} className="break-words">- {line}</li>
                ))}
              </ul>
            </article>
          ) : null}

          <article className="rounded-2xl border border-white/5 bg-[#111118] p-4 text-sm text-[#aaaabb]">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-[#aaaabb]">
              <AlertTriangle className="h-4 w-4" style={{ color: accentColor }} />
              Top Opportunity Regions
            </div>
            <ul className="space-y-1">
              {data.topRegions.map((region) => (
                <li key={region.id} className="flex items-center justify-between">
                  <span className="font-medium text-[#f0f0f0]">{region.name}</span>
                  <span className="font-bold" style={{ color: accentColor }}>{region.opportunityScore}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/5 bg-[#111118] p-4 text-sm text-[#aaaabb]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#666677]">Recent Queries</p>
            <ul className="space-y-1 text-xs">
              {history.slice(0, 5).map((item) => (
                <li key={item._id} className="font-medium text-[#aaaabb] truncate">
                  {item.idea} <span className="opacity-50">({item.mode})</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </MotionAside>
  );
}
