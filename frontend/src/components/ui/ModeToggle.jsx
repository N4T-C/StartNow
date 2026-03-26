import { motion } from "framer-motion";
import { clsx } from "clsx";

const MotionSpan = motion.span;

/**
 * Props:
 *  - mode: "startup" | "business"
 *  - onChange: called with "startup" directly (no auth needed)
 *  - onBusinessClick: called when user tries to switch to Business (opens the modal)
 */
export function ModeToggle({ mode, onChange, onBusinessClick }) {
  const handleClick = (item) => {
    if (item === "business" && mode !== "business") {
      // Delegate to modal gating — don't switch yet
      if (onBusinessClick) onBusinessClick();
      return;
    }
    onChange(item);
  };

  return (
    <div className="pointer-events-auto glass-panel absolute right-4 top-4 z-[1000] flex items-center rounded-full p-1 sm:right-6 sm:top-6" style={{ background: "#111118" }}>
      {["startup", "business"].map((item) => {
        const active = mode === item;
        const activeColor = item === "startup" ? "#00ff88" : "#ff8800";
        const shadowColor = item === "startup" ? "rgba(0,255,136,0.4)" : "rgba(255,136,0,0.4)";

        return (
          <button
            key={item}
            type="button"
            onClick={() => handleClick(item)}
            className={clsx(
              "relative overflow-hidden rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition-colors sm:px-5",
              active ? "text-[#0a0a0f]" : "text-[#888899]",
            )}
          >
            {active && (
              <MotionSpan
                layoutId="mode-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background: activeColor,
                  boxShadow: `0 0 12px ${shadowColor}`,
                }}
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
