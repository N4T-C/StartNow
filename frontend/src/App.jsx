import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil } from "lucide-react";
import { IdeaInput } from "./components/ui/IdeaInput";
import { InsightPanel } from "./components/insights/InsightPanel";
import { ModeToggle } from "./components/ui/ModeToggle";
import { CoursesButton } from "./components/ui/CoursesButton";
import { CoursesModal } from "./components/courses/CoursesModal";
import { IndiaMap } from "./components/map/IndiaMap";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { BusinessLoginModal } from "./components/auth/BusinessLoginModal";
import { MarketIntelligenceDashboard } from "./components/dashboards/MarketIntelligenceDashboard";
import { CompetitorDashboard } from "./components/competitors/CompetitorDashboard";
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

function MainApp() {
  const [mode, setMode] = useState("startup");
  const [idea, setIdea] = useState("");
  const [refinement, setRefinement] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showCompetitors, setShowCompetitors] = useState(false);
  const [data, setData] = useState(() => createLocalInitial("startup"));
  const [history, setHistory] = useState([]);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [businessModalOpen, setBusinessModalOpen] = useState(false);
  const [focusedRegionId, setFocusedRegionId] = useState(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);

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

  const handleBusinessAuthSuccess = useCallback(
    (_bizUser) => {
      setBusinessModalOpen(false);
      setMode("business");
      if (analyzed && idea.trim().length >= 3) {
        runAnalysis(idea, refinement, "business");
      }
    },
    [analyzed, idea, refinement, runAnalysis],
  );

  const isAnyModalOpen = coursesOpen || businessModalOpen;

  return (
    <main
      className="relative h-screen w-full overflow-hidden"
      style={{
        background:
          mode === "startup"
            ? "linear-gradient(135deg, #0a0a0f 0%, #0a1a12 100%)"
            : "linear-gradient(135deg, #0a0a0f 0%, #1a0f00 100%)",
      }}
    >
      <IndiaMap 
        darkMode={mode === "business"} 
        regions={regions} 
        idea={idea} 
        mode={mode} 
        analysisData={data} 
        analyzed={analyzed} 
        uiHidden={isAnyModalOpen}
        onRegionFocus={(id) => {
          setFocusedRegionId(id);
          setPanelOpen(true);
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_35%)]" />

      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute inset-0 z-[3000]">
        {!isAnyModalOpen ? (
          <>
            <CoursesButton onClick={openCourses} />
            <ModeToggle
              mode={mode}
              onChange={(nextMode) => {
                setMode(nextMode);
                if (analyzed && idea.trim().length >= 3) {
                  runAnalysis(idea, refinement, nextMode);
                }
              }}
              onBusinessClick={() => setBusinessModalOpen(true)}
            />
          </>
        ) : null}

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
        ) : null}

        {/* Top-Left Action: Edit Query */}
        {!showInput && !showCompetitors && !isAnyModalOpen && (
           <button
            type="button"
            onClick={() => setShowInput(true)}
            className="pointer-events-auto glass-panel absolute left-5 top-24 z-[2000] inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition-all hover:bg-white/5 active:scale-95"
          >
            <Pencil className="h-3 w-3" />
            Edit Query
          </button>
        )}

        {/* Top-Right Control Group */}
        {!isAnyModalOpen && (
          <div className="pointer-events-none absolute right-4 top-24 z-[2000] flex flex-col gap-3 items-end sm:right-6 sm:flex-row">
            {/* Competitors Toggle */}
            {analyzed && (
              <button
                type="button"
                onClick={() => {
                  setShowCompetitors((prev) => !prev);
                  setPanelOpen(false);
                }}
                className="pointer-events-auto glass-panel rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#00ff88] transition-all hover:bg-[#00ff88]/10 active:scale-95"
                style={{ borderColor: "#00ff88" }}
              >
                {showCompetitors ? "Close Dashboard" : "Competitors"}
              </button>
            )}

            {/* Insight Toggle */}
            {analyzed && (
              <button
                type="button"
                onClick={() => {
                  setPanelOpen((prev) => !prev);
                  setShowCompetitors(false);
                }}
                className="pointer-events-auto glass-panel rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10 active:scale-95"
              >
                {panelOpen ? "Hide Insights" : "Show Insights"}
              </button>
            )}
          </div>
        )}

        <InsightPanel 
          open={panelOpen} 
          onClose={() => setPanelOpen(false)} 
          loading={loading} 
          mode={mode} 
          data={data} 
          history={history}
          focusedRegionId={focusedRegionId}
        />

        {/* Competitors Sliding Panel */}
        {showCompetitors && (
          <MotionDiv
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="pointer-events-auto absolute left-0 top-0 z-[4000] h-full w-full sm:w-[480px] shadow-2xl shadow-black/80"
          >
            <CompetitorDashboard 
              idea={idea} 
              mode={mode} 
              analysisData={data}
              onClose={() => setShowCompetitors(false)}
              onOpenFull={() => setDashboardOpen(true)}
            />
          </MotionDiv>
        )}

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

        <BusinessLoginModal
          open={businessModalOpen}
          onSuccess={handleBusinessAuthSuccess}
          onCancel={() => setBusinessModalOpen(false)}
        />

        <AnimatePresence>
          {dashboardOpen && (
            <motion.div 
               initial={{ opacity: 0, x: '100%' }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: '100%', opacity: 0 }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed inset-0 z-[7000] bg-[#0a0a0f] overflow-y-auto"
            >
               <MarketIntelligenceDashboard 
                 data={data}
                 mode={mode}
                 onClose={() => setDashboardOpen(false)}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionDiv>
    </main>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <MainApp />
    </ProtectedRoute>
  );
}

export default App;
