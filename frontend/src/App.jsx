import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { IdeaInput } from "./components/ui/IdeaInput";
import { InsightPanel } from "./components/insights/InsightPanel";
import { ModeToggle } from "./components/ui/ModeToggle";
import { CoursesButton } from "./components/ui/CoursesButton";
import { CoursesModal } from "./components/courses/CoursesModal";
import { IndiaMap } from "./components/map/IndiaMap";
import { analyzeIdea, fetchHistory } from "./services/analyzeService";
import { createCourseCheckout, fetchCourses } from "./services/courseService";
import { buildFallbackInsight } from "./lib/mockFallback";
import { buildRegionSignals, summarizeSignals } from "./lib/scoring";

const MotionDiv = motion.div;

function createLocalInitial(mode) {
  const idea = mode === "startup" ? "AI productivity studio" : "Retail operations optimization";
  const allRegions = buildRegionSignals(idea, mode, undefined);
  const topRegions = allRegions.slice(0, 5);
  const summary = summarizeSignals(allRegions);

  return {
    mode,
    idea,
    opportunityScore: summary.opportunityScore,
    trendSignals: summary.trendSignals,
    competitionLevel: summary.competitionLevel,
    marketSaturation: summary.marketSaturation,
    topRegions,
    allRegions,
    insight: buildFallbackInsight(mode, idea, topRegions),
    providerUsed: "fallback",
  };
}

function App() {
  const [mode, setMode] = useState("startup");
  const [idea, setIdea] = useState("");
  const [refinement, setRefinement] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [data, setData] = useState(() => createLocalInitial("startup"));
  const [history, setHistory] = useState([]);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      const payload = await fetchHistory();
      setHistory(payload.items || []);
    } catch {
      setHistory([]);
    }
  }, []);

  const runAnalysis = useCallback(
    async (ideaValue, refinementValue, modeOverride) => {
      if (ideaValue.trim().length < 3) return;

      const activeMode = modeOverride || mode;
      setLoading(true);
      setPanelOpen(true);

      try {
        const json = await analyzeIdea({ mode: activeMode, idea: ideaValue, refinement: refinementValue });
        setData(json);
      } catch {
        const allRegions = buildRegionSignals(ideaValue, activeMode, refinementValue);
        const topRegions = allRegions.slice(0, 5);
        const summary = summarizeSignals(allRegions);

        setData({
          mode: activeMode,
          idea: ideaValue,
          refinement: refinementValue,
          opportunityScore: summary.opportunityScore,
          trendSignals: summary.trendSignals,
          competitionLevel: summary.competitionLevel,
          marketSaturation: summary.marketSaturation,
          topRegions,
          allRegions,
          insight: buildFallbackInsight(activeMode, ideaValue, topRegions),
          providerUsed: "fallback",
        });
      } finally {
        setLoading(false);
        loadHistory();
      }
    },
    [mode, loadHistory],
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const openCourses = useCallback(async () => {
    setCoursesOpen(true);
    if (courses.length > 0) return;

    setCoursesLoading(true);
    try {
      const payload = await fetchCourses();
      setCourses(payload.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [courses.length]);

  const handleCourseSelect = useCallback(async (course) => {
    setCoursesLoading(true);
    try {
      const payload = await createCourseCheckout(course.code);
      setCheckoutInfo(payload.checkout);
    } catch {
      setCheckoutInfo(null);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!analyzed || refinement.trim().length < 2) return;
    const timer = setTimeout(() => {
      runAnalysis(idea, refinement);
    }, 700);

    return () => clearTimeout(timer);
  }, [refinement, idea, analyzed, runAnalysis]);

  const regions = useMemo(() => data?.allRegions || buildRegionSignals("AI tools", mode), [data, mode]);

  return (
    <main
      className="relative h-screen w-full overflow-hidden"
      style={{
        background:
          mode === "startup"
            ? "radial-gradient(1200px 800px at 10% 0%, rgba(16,185,129,0.35), transparent 60%), radial-gradient(1000px 800px at 90% 100%, rgba(251,191,36,0.28), transparent 55%), linear-gradient(120deg, #0b1022, #14193a 38%, #1b2348 100%)"
            : "radial-gradient(1200px 800px at 0% 10%, rgba(59,130,246,0.23), transparent 56%), radial-gradient(1000px 700px at 100% 100%, rgba(16,185,129,0.14), transparent 56%), linear-gradient(120deg, #05070f, #0a1223 45%, #0d1b33 100%)",
      }}
    >
      <IndiaMap darkMode={mode === "business"} regions={regions} />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_35%)]" />

      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20">
        <CoursesButton onClick={openCourses} />

        <ModeToggle
          mode={mode}
          onChange={(nextMode) => {
            setMode(nextMode);
            if (analyzed && idea.trim().length >= 3) {
              runAnalysis(idea, refinement, nextMode);
            }
          }}
        />

        {showInput ? (
          <IdeaInput
            mode={mode}
            idea={idea}
            refinement={refinement}
            loading={loading}
            onIdeaChange={setIdea}
            onRefinementChange={setRefinement}
            onSubmit={() => {
              setAnalyzed(true);
              setShowInput(false);
              runAnalysis(idea, refinement);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="glass-panel absolute left-5 top-24 z-[999] inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
          >
            <Pencil className="h-3 w-3" />
            Edit Query
          </button>
        )}

        <button
          type="button"
          onClick={() => setPanelOpen((prev) => !prev)}
          className="glass-panel absolute right-4 top-24 z-[999] rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white sm:right-6"
        >
          {panelOpen ? "Hide Insights" : "Show Insights"}
        </button>

        <InsightPanel open={panelOpen} loading={loading} mode={mode} data={data} history={history} />

        <CoursesModal
          open={coursesOpen}
          courses={courses}
          loading={coursesLoading}
          checkoutInfo={checkoutInfo}
          onClose={() => {
            setCoursesOpen(false);
            setCheckoutInfo(null);
          }}
          onSelectCourse={handleCourseSelect}
        />
      </MotionDiv>
    </main>
  );
}

export default App;
