import { useMemo } from "react";
import { Info } from "lucide-react";

export function ComparisonChart({ comparison, loading, accent, mode, competitorCount }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#fff]/20" style={{ borderTopColor: accent }} />
      </div>
    );
  }

  if (competitorCount === 0 || !comparison) {
    return (
      <div className="text-center py-10 opacity-60">
        <p className="text-sm">No competitors added.</p>
        <p className="text-xs mt-2">Add competitors to start tracking and analyzing.</p>
      </div>
    );
  }

  const { dimensions = [], competitors = [] } = comparison;

  if (dimensions.length === 0 || competitors.length === 0) {
    return (
      <div className="text-center py-10 opacity-60">
        <p className="text-sm border p-4 border-white/10 rounded-xl bg-white/5">
          Not enough history to generate comparison yet. 
          <br/>It will appear here after the first scan completes.
        </p>
      </div>
    );
  }

  const chartSize = 340;
  const center = chartSize / 2;
  const radius = 120; // smaller than center to fit labels

  // Coordinates mapping logic
  const getPointCoordinates = (score, index, total) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (score / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const getLabelCoordinates = (index, total) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const padding = 20;
    return {
      x: center + (radius + padding) * Math.cos(angle),
      y: center + (radius + padding) * Math.sin(angle),
      anchor: angle > Math.PI / 2 || angle < -Math.PI / 2 ? "end" : "start"
    };
  };

  const colors = [accent, mode === "business" ? "#ff8800" : "#00ff88", "#ff4466", "#aa44ff", "#0088ff"];

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* SVG Chart Container */}
      <div className="relative w-[340px] h-[340px] mx-auto shrink-0 bg-[#0a0a0f]/50 rounded-full shadow-2xl shadow-indigo-500/10">
        <svg width={chartSize} height={chartSize} className="absolute inset-0 z-10">
          
          {/* Reference Circles */}
          {[33, 66, 100].map(s => {
            const r = (s / 100) * radius;
            return (
              <circle
                key={s}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Axes */}
          {dimensions.map((dim, i) => {
            const end = getPointCoordinates(100, i, dimensions.length);
            return (
              <line
                key={dim}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {/* Radar Polygons */}
          {competitors.map((comp, i) => {
            const color = colors[i % colors.length];
            const maxScore = Math.max(...dimensions.map(d => comp.scores[d] || 0));
            // Create points
            const points = dimensions.map((dim, dimIndex) => {
              const score = comp.scores[dim] || 0;
              const pt = getPointCoordinates(score, dimIndex, dimensions.length);
              return `${pt.x},${pt.y}`;
            }).join(" ");

            return (
              <g key={comp.competitorId}>
                <polygon
                  points={points}
                  fill={color}
                  fillOpacity="0.15"
                  stroke={color}
                  strokeWidth="2"
                  style={{ transition: "all 0.5s ease" }}
                />
                {/* Vertex Dots */}
                {dimensions.map((dim, dimIndex) => {
                  const score = comp.scores[dim] || 0;
                  const pt = getPointCoordinates(score, dimIndex, dimensions.length);
                  return (
                    <circle
                      key={`${comp.competitorId}-${dim}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#111118"
                      stroke={color}
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Labels outside graph */}
          {dimensions.map((dim, i) => {
            const loc = getLabelCoordinates(i, dimensions.length);
            return (
              <text
                key={dim}
                x={loc.x}
                y={loc.y}
                fill="#aaaabb"
                fontSize="10"
                fontWeight="700"
                textAnchor={loc.anchor}
                alignmentBaseline="middle"
                className="uppercase tracking-wider pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {dim}
              </text>
            );
          })}
        </svg>
      </div>

      {/* New: Pricing Tiers Overview */}
      <div className="px-4">
        <p className="text-[10px] uppercase font-black tracking-widest text-[#666677] mb-3">Pricing Tier Stratification</p>
        <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-white/5">
          {competitors.map((comp, i) => {
             const points = Object.values(comp.scores || {}).reduce((a, b) => a + b, 0) / 5;
             return (
               <div 
                 key={comp.competitorId} 
                 style={{ width: `${100 / competitors.length}%`, background: colors[i % colors.length] }} 
                 className="h-full opacity-80"
               />
             );
          })}
        </div>
        <div className="flex mt-2 justify-between text-[9px] font-bold text-[#888899]">
           <span>Economy</span>
           <span>Premium</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 shrink-0 px-4 mt-2">
        {competitors.map((comp, i) => (
          <div key={comp.competitorId} className="flex items-center gap-2 cursor-default group">
            <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px] shadow-current" style={{ background: colors[i % colors.length], color: colors[i % colors.length] }} />
            <span className="text-[10px] uppercase font-black tracking-widest text-[#f0f0f0] group-hover:text-white transition-colors">
              {comp.name}
            </span>
          </div>
        ))}
      </div>

      {/* Breakdowns Table */}
      <div className="overflow-x-auto no-scrollbar pb-6 px-1">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th className="py-2.5 px-3 text-[10px] uppercase tracking-widest text-[#666677] font-black border-b border-white/5 shrink-0 min-w-32">Competitor</th>
              <th className="py-2.5 px-3 text-[10px] uppercase tracking-widest text-[#666677] font-black border-b border-white/5 min-w-40">Core Positioning</th>
              <th className="py-2.5 px-3 text-[10px] uppercase tracking-widest text-[#666677] font-black border-b border-white/5 w-full">Strategic Insight</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((comp, i) => (
              <tr key={comp.competitorId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                <td className="py-4 px-3 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-xs uppercase" style={{ color: colors[i % colors.length] }}>
                      {comp.name}
                    </span>
                    <span className="text-[9px] text-[#666677] font-bold">LIFETIME SCORE: {Math.round(Object.values(comp.scores || {}).reduce((a,b)=>a+b,0)/5)}%</span>
                  </div>
                </td>
                <td className="py-4 px-3 text-xs text-[#aaaabb] font-medium leading-relaxed align-top">
                   <div className="rounded-lg bg-white/5 p-2 border border-white/5 text-white/90">
                      {comp.positioning}
                   </div>
                </td>
                <td className="py-4 px-3 text-xs text-[#888899] leading-relaxed align-top">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-3.5 w-3.5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Info className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span>{comp.topInsight}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

