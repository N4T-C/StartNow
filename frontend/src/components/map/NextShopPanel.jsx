import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Users, IndianRupee, Home, Truck, Zap, Building2, Clock, TrendingUp, BarChart3 } from "lucide-react";

const Row = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
    <span className="flex items-center gap-2 text-xs text-[#aaaabb]">
      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accent || "#aaaabb" }} />
      {label}
    </span>
    <span className="text-sm font-bold text-[#f0f0f0]">{value}</span>
  </div>
);

export function NextShopPanel({ data, onClose }) {
  if (!data) return null;

  const { recommendedLocation, reasoning, financials } = data;

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key="next-shop-panel"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="absolute right-0 top-0 z-[3000] h-full w-full max-w-sm overflow-y-auto no-scrollbar"
          style={{
            background: "rgba(10, 10, 15, 0.96)",
            borderLeft: "1px solid rgba(0, 255, 136, 0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,136,0.08) 0%, rgba(10,10,15,0.95) 100%)",
              borderBottom: "1px solid rgba(0,255,136,0.1)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🚀</span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#00ff88] font-bold">AI Recommended</p>
                <h2 className="text-sm font-bold text-white leading-tight">Next Shop Location</h2>
              </div>
            </div>
            <button
              id="next-shop-panel-close"
              onClick={onClose}
              className="rounded-full p-1.5 text-[#aaaabb] transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Location */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,136,0.06) 0%, rgba(0,255,136,0.02) 100%)",
                border: "1px solid rgba(0,255,136,0.15)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 rounded-lg p-2 shrink-0"
                  style={{ background: "rgba(0,255,136,0.12)" }}
                >
                  <MapPin className="h-4 w-4 text-[#00ff88]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#00ff88] font-semibold mb-0.5">
                    Recommended Location
                  </p>
                  <p className="text-base font-bold text-white leading-tight">
                    {recommendedLocation?.name || "—"}
                  </p>
                  {recommendedLocation?.lat && (
                    <p className="text-[10px] text-[#555566] mt-0.5 font-mono">
                      {Number(recommendedLocation.lat).toFixed(4)}, {Number(recommendedLocation.lng).toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Reasoning */}
            {reasoning && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#aaaabb] font-semibold mb-2">
                  Why This Location?
                </p>
                <p className="text-xs text-[#ccccdd] leading-relaxed">
                  {reasoning}
                </p>
              </div>
            )}

            {/* Financial Breakdown */}
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.15em] font-bold mb-3 flex items-center gap-1.5"
                style={{ color: "#ffdd00" }}
              >
                <IndianRupee className="h-3 w-3" />
                Financial Breakdown
              </p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="px-4 py-1">
                  <Row
                    icon={Users}
                    label="Staff Needed"
                    value={`${financials?.staffNeeded || "—"} people`}
                    accent="#00aaff"
                  />
                  <Row
                    icon={IndianRupee}
                    label="Salary Cost"
                    value={`${financials?.salaryCostPerMonth || "—"}/mo`}
                    accent="#ff7777"
                  />
                  <Row
                    icon={Home}
                    label="Rent Cost"
                    value={`${financials?.rentCostPerMonth || "—"}/mo`}
                    accent="#ff9900"
                  />
                  <Row
                    icon={Truck}
                    label="Transport Savings"
                    value={`${financials?.transportSavingsPerMonth || "—"}/mo`}
                    accent="#00ff88"
                  />
                </div>

                {/* Net benefit highlight */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    background: financials?.netMonthlyBenefitPositive
                      ? "rgba(0,255,136,0.08)"
                      : "rgba(255,68,102,0.08)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="flex items-center gap-2 text-xs font-bold"
                    style={{ color: financials?.netMonthlyBenefitPositive ? "#00ff88" : "#ff4466" }}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Net Monthly Benefit
                  </span>
                  <span
                    className="text-sm font-extrabold"
                    style={{ color: financials?.netMonthlyBenefitPositive ? "#00ff88" : "#ff4466" }}
                  >
                    {financials?.netMonthlyBenefitPositive ? "+" : "-"}{financials?.netMonthlyBenefit || "—"}/mo
                  </span>
                </div>

                <div className="px-4 py-1">
                  <Row
                    icon={Building2}
                    label="Setup Cost"
                    value={financials?.setupCost || "—"}
                    accent="#aa88ff"
                  />
                  <Row
                    icon={Clock}
                    label="Break-even"
                    value={`${financials?.breakEvenMonths || "—"} months`}
                    accent="#ffdd00"
                  />
                  <Row
                    icon={TrendingUp}
                    label="Market Value +"
                    value={`${financials?.marketValueIncreasePercent || "—"}% increase`}
                    accent="#00ddff"
                  />
                  <Row
                    icon={BarChart3}
                    label="Year 1 Revenue Est."
                    value={financials?.revenueProjectionYear1 || "—"}
                    accent="#00ff88"
                  />
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,170,255,0.03) 100%)",
                border: "1px solid rgba(0,255,136,0.10)",
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#00ff88] font-bold mb-2 flex items-center gap-1.5">
                ✅ Recommendation
              </p>
              <p className="text-xs text-[#ccccdd] leading-relaxed">
                If the current market trend continues, you will hit the breakpoint in{" "}
                <span className="text-[#ffdd00] font-bold">{financials?.breakEvenMonths || "—"} months</span>, making
                your market value{" "}
                <span className="text-[#00ff88] font-bold">
                  {financials?.marketValueIncreasePercent || "—"}% more
                </span>
                . Year 1 projected revenue is{" "}
                <span className="text-[#00ff88] font-bold">{financials?.revenueProjectionYear1 || "—"}</span>.
              </p>
            </div>

            {/* Spacer at the bottom for scroll */}
            <div className="h-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
