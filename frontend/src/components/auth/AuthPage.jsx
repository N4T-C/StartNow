import { useState } from "react";
import { motion } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";

const MotionDiv = motion.div;
const MotionButton = motion.button;

// Google SVG logo
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export function AuthPage({ onAuth }) {
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuth();
    } catch (err) {
      setError(err?.message || "Sign-in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(6,182,212,0.18), transparent 60%), radial-gradient(ellipse 80% 60% at 80% 100%, rgba(99,102,241,0.12), transparent 55%), #0a0a0f",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating glow orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      <MotionDiv
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 px-6"
      >
        {/* Badge */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-300"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Beta Access
        </MotionDiv>

        {/* Heading */}
        <div className="text-center">
          <h1
            className="text-5xl font-bold tracking-tight text-white"
            style={{
              textShadow: "0 0 40px rgba(6,182,212,0.6), 0 0 80px rgba(6,182,212,0.25)",
            }}
          >
            Startup Seeker
          </h1>
          <p className="mt-3 text-base text-slate-400">
            Discover where your idea wins in India
          </p>
        </div>

        {/* Divider */}
        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30">Sign in to continue</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Google Sign-In Button */}
        <div className="w-full">
          <MotionButton
            type="button"
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(6,182,212,0.35)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/8 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {signingIn ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-cyan-400" />
            ) : (
              <GoogleLogo />
            )}
            {signingIn ? "Signing in…" : "Continue with Google"}
          </MotionButton>

          {error && (
            <MotionDiv
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs text-red-300"
            >
              {error}
            </MotionDiv>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/20">
          By signing in you agree to our terms of service.
          <br />
          Your data is secured by Firebase Auth.
        </p>
      </MotionDiv>
    </div>
  );
}
