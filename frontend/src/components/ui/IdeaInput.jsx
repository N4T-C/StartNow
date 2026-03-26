import { motion } from "framer-motion";
import { LoaderCircle, Sparkles } from "lucide-react";

const MotionSection = motion.section;

export function IdeaInput({ mode, idea, refinement, loading, onIdeaChange, onRefinementChange, onSubmit }) {
  const headline =
    mode === "startup"
      ? "What startup are you planning?"
      : "What are you planning to launch or improve?";
      
  const accentColor = mode === "startup" ? "#00ff88" : "#ff8800";

  return (
    <MotionSection
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
      className="pointer-events-auto glass-panel absolute left-1/2 top-1/2 z-[900] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl p-4 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#888899]">
        <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
        Startup Seeker Intelligence
      </div>
      <h1 className="mb-4 text-2xl font-bold leading-tight text-[#f0f0f0] sm:text-4xl">{headline}</h1>

      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="idea-input">
          Idea input
        </label>
        <input
          id="idea-input"
          value={idea}
          onChange={(event) => onIdeaChange(event.target.value)}
          placeholder="Ex: EV charging platform for tier-2 cities"
          className="h-12 w-full rounded-2xl border border-[#333344] bg-[#111118] px-4 text-[#f0f0f0] placeholder:text-[#888899] outline-none transition"
          style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
          onFocus={(e) => {
            e.target.style.borderColor = accentColor;
            e.target.style.boxShadow = `0 0 12px ${accentColor}44`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#333344";
            e.target.style.boxShadow = "none";
          }}
        />

        <label className="sr-only" htmlFor="refine-input">
          Refine your idea
        </label>
        <input
          id="refine-input"
          value={refinement}
          onChange={(event) => onRefinementChange(event.target.value)}
          placeholder="Refine your idea (optional)"
          className="h-11 w-full rounded-2xl border border-[#333344] bg-[#111118] px-4 text-[#f0f0f0] placeholder:text-[#888899] outline-none transition"
          style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
          onFocus={(e) => {
            e.target.style.borderColor = accentColor;
            e.target.style.boxShadow = `0 0 12px ${accentColor}44`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#333344";
            e.target.style.boxShadow = "none";
          }}
        />

        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={loading || idea.trim().length < 3}
          whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${accentColor}88` }}
          whileTap={{ scale: 0.98 }}
          className="group relative mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 font-bold text-[#0a0a0f] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: accentColor }}
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Analyze Opportunity
        </motion.button>
      </div>

      <p className="mt-3 text-xs font-medium text-[#666677] uppercase">
        Minimal flow by design: one main input plus one optional refinement. Insights update dynamically.
      </p>
    </MotionSection>
  );
}
