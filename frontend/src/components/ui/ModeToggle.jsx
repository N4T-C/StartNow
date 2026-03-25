import { motion } from "framer-motion";
import { clsx } from "clsx";

const MotionSpan = motion.span;

export function ModeToggle({ mode, onChange }) {
  return (
    <div className="glass-panel absolute right-4 top-4 z-[1000] flex items-center rounded-full p-1 sm:right-6 sm:top-6">
      {["startup", "business"].map((item) => {
        const active = mode === item;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={clsx(
              "relative overflow-hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors sm:px-5",
              active ? "text-slate-950" : "text-white/80",
            )}
          >
            {active && (
              <MotionSpan
                layoutId="mode-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-300 via-yellow-200 to-amber-300"
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              />
            )}
            <span className="relative z-10">{item}</span>
          </button>
        );
      })}
    </div>
  );
}
