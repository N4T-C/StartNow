import { motion } from "framer-motion";
import { Activity, AlertTriangle, BarChart3, Flame, Radar, TrendingUp } from "lucide-react";

const MotionDiv = motion.div;
const MotionAside = motion.aside;

function TrendBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-white/75">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="h-2 rounded-full bg-gradient-to-r from-emerald-300 via-yellow-200 to-amber-300"
        />
      </div>
    </div>
  );
}

export function InsightPanel({ open, loading, mode, data, history = [] }) {
  return (
    <MotionAside
      initial={false}
      animate={{ x: open ? 0 : 420, opacity: open ? 1 : 0.5 }}
      transition={{ type: "spring", damping: 24, stiffness: 210 }}
      className="glass-panel absolute right-0 top-0 z-[950] h-full w-full max-w-md border-l border-white/15 p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide text-white">Market Intelligence</h2>
        <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
          {mode}
        </span>
      </div>

      {!data || loading ? (
        <div className="space-y-3 pt-4">
          <div className="h-22 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-18 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
        </div>
      ) : (
        <div className="no-scrollbar h-[calc(100%-2rem)] space-y-4 overflow-y-auto pr-1 pb-8">
          <article className="rounded-2xl border border-white/15 bg-black/25 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
              <Radar className="h-4 w-4" />
              Opportunity Score
            </div>
            <p className="text-4xl font-bold text-white">{data.opportunityScore}</p>
            <p className="text-xs text-white/65">Provider: {data.providerUsed}</p>
          </article>

          <article className="rounded-2xl border border-white/15 bg-black/25 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
              <TrendingUp className="h-4 w-4" />
              Trend Signals
            </div>
            <div className="space-y-3">
              <TrendBar label="Growth" value={data.trendSignals.growth} />
              <TrendBar label="Demand" value={data.trendSignals.demand} />
              <TrendBar label="Buzz" value={data.trendSignals.buzz} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-white/85">
            <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
              <BarChart3 className="h-4 w-4" />
              Competition + Saturation
            </div>
            <p>Competition: {data.competitionLevel}</p>
            <p>Saturation: {data.marketSaturation}</p>
          </article>

          <article className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-white/85">
            <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
              <Flame className="h-4 w-4" />
              AI Insights
            </div>
            <p className="mb-2 text-white/90">{data.insight.summary}</p>
            <ul className="space-y-1 text-white/80">
              {data.insight.reasoning.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </article>

          {mode === "business" ? (
            <article className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-white/85">
              <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
                <Activity className="h-4 w-4" />
                Business Signals
              </div>
              <p className="mb-2 font-medium text-white">Competitor analysis</p>
              <ul className="mb-3 space-y-1 text-white/80">
                {(data.insight.competitorAnalysis || []).map((line) => (
                  <li key={line}>- {line}</li>
                ))}
              </ul>
              <p className="mb-2 font-medium text-white">Risk analysis</p>
              <ul className="space-y-1 text-white/80">
                {(data.insight.riskAnalysis || []).map((line) => (
                  <li key={line}>- {line}</li>
                ))}
              </ul>
            </article>
          ) : null}

          <article className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-white/85">
            <div className="mb-3 flex items-center gap-2 text-sm text-white/80">
              <AlertTriangle className="h-4 w-4" />
              Top Opportunity Regions
            </div>
            <ul className="space-y-1">
              {data.topRegions.map((region) => (
                <li key={region.id} className="flex items-center justify-between">
                  <span>{region.name}</span>
                  <span className="font-semibold">{region.opportunityScore}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-white/85">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">Recent Queries</p>
            <ul className="space-y-1 text-xs text-white/75">
              {history.slice(0, 5).map((item) => (
                <li key={item._id}>{item.idea} ({item.mode})</li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </MotionAside>
  );
}
