import { useAuth } from "../../hooks/useAuth";
import { AuthPage } from "./AuthPage";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Full-screen spinner while Firebase resolves auth state
  if (loading) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />
      </div>
    );
  }

  // Not signed in → show auth page
  if (!user) {
    return <AuthPage onAuth={() => {}} />;
  }

  // Signed in → render the protected app
  return children;
}
