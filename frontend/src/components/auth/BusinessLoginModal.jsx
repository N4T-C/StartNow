import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

const MotionDiv = motion.div;
const MotionButton = motion.button;

export function BusinessLoginModal({ open, onSuccess, onCancel }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/auth/business-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEmail("");
        setPassword("");
        onSuccess(data.user);
      } else {
        setError(data.message || "Invalid business credentials");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setPassword("");
    setError("");
    onCancel();
  };

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          key="business-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto absolute inset-0 z-[1300] flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(12px)", background: "rgba(5,7,15,0.72)" }}
        >
          <MotionDiv
            key="business-modal-panel"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="glass-panel relative w-full max-w-md rounded-3xl border border-white/15 p-8"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute right-5 top-5 rounded-full border border-white/15 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                Business Access
              </div>
              <h2 className="text-2xl font-bold text-white">Business Mode Access</h2>
              <p className="mt-1.5 text-sm text-white/50">
                Enter your business credentials to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="biz-email" className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  Email
                </label>
                <input
                  id="biz-email"
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@company.in"
                  className="rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  style={{ background: "rgba(255,255,255,0.055)" }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="biz-password" className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  Password
                </label>
                <input
                  id="biz-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  style={{ background: "rgba(255,255,255,0.055)" }}
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <MotionDiv
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                      {error}
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>

              <MotionButton
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(6,182,212,0.3)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : null}
                {loading ? "Authenticating…" : "Login"}
              </MotionButton>
            </form>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
