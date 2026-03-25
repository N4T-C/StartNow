import { motion } from "framer-motion";
import { LoaderCircle, Sparkles } from "lucide-react";

const MotionSection = motion.section;

export function IdeaInput({ mode, idea, refinement, loading, onIdeaChange, onRefinementChange, onSubmit }) {
  const headline =
    mode === "startup"
      ? "What startup are you planning?"
      : "What are you planning to launch or improve?";

  return (
    <MotionSection
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
      className="glass-panel absolute left-1/2 top-1/2 z-[900] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl p-4 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.26em] text-white/70">
        <Sparkles className="h-4 w-4" />
        Startup Seeker Intelligence
      </div>
      <h1 className="mb-4 text-2xl font-semibold leading-tight text-white sm:text-4xl">{headline}</h1>

      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="idea-input">
          Idea input
        </label>
        <input
          id="idea-input"
          value={idea}
          onChange={(event) => onIdeaChange(event.target.value)}
          placeholder="Ex: EV charging platform for tier-2 cities"
          className="h-12 w-full rounded-2xl border border-white/20 bg-black/30 px-4 text-white placeholder:text-white/50 outline-none transition focus:border-emerald-300"
        />

        <label className="sr-only" htmlFor="refine-input">
          Refine your idea
        </label>
        <input
          id="refine-input"
          value={refinement}
          onChange={(event) => onRefinementChange(event.target.value)}
          placeholder="Refine your idea (optional)"
          className="h-11 w-full rounded-2xl border border-white/15 bg-black/20 px-4 text-white placeholder:text-white/50 outline-none transition focus:border-yellow-200"
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || idea.trim().length < 3}
          className="group relative mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-300 via-yellow-200 to-amber-300 px-6 font-semibold text-slate-900 shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Analyze Opportunity
        </button>
      </div>

      <p className="mt-3 text-xs text-white/60">
        Minimal flow by design: one main input plus one optional refinement. Insights update dynamically.
      </p>
    </MotionSection>
  );
}
