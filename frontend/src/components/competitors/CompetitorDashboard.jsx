import { useState, useEffect } from "react";
import { X, Activity, BarChart2, Plus } from "lucide-react";
import { ChangeFeed } from "./ChangeFeed";
import { ComparisonChart } from "./ComparisonChart";
import { AddCompetitorForm } from "./AddCompetitorForm";

export function CompetitorDashboard({ idea, mode, onClose, onOpenFull, analysisData }) {
  const [activeTab, setActiveTab] = useState("feed");
  const [competitors, setCompetitors] = useState([]);
  const [changes, setChanges] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const accent = mode === "business" ? "#ff8800" : "#00ff88";

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch competitors list tracked in DB
      const listRes = await fetch(`${API_BASE}/competitors/list`);
      const listData = await listRes.json();
      if (listData.success && listData.list?.length > 0) {
        setCompetitors(listData.list);
      } else {
        // Fallback to analysis competitors if DB list is empty
        setCompetitors(analysisData?.competitors || []);
      }

      // 2. Fetch changes feed from DB
      const changesRes = await fetch(`${API_BASE}/competitors/changes`);
      const changesData = await changesRes.json();
      if (changesData.success && changesData.changes?.length > 0) {
        setChanges(changesData.changes);
      } else {
        // Fallback to analysis event stream
        setChanges(analysisData?.competitorChanges || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setCompetitors(analysisData?.competitors || []);
      setChanges(analysisData?.competitorChanges || []);
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async () => {
    // If we have competitors from analysis, construct its comparison
    if (competitors.length > 0) {
       const hasScores = competitors.every(c => c.scores);
       if (hasScores) {
          const dims = Object.keys(competitors[0].scores);
          setComparison({ dimensions: dims, competitors });
          return;
       }
    }

    try {
      const ids = competitors.map(c => c.competitorId).filter(Boolean);
      if (ids.length === 0) return;
      
      const res = await fetch(`${API_BASE}/competitors/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorIds: ids, idea })
      });
      const data = await res.json();
      if (data.success && data.result) {
        setComparison(data.result);
      }
    } catch (e) {
      console.error("Comparison load error:", e);
    }
  };

  // On mount and when shifting to compare tab
  useEffect(() => {
    loadData();
  }, [analysisData]);

  useEffect(() => {
    if (activeTab === "compare" && !comparison) {
      loadComparison();
    }
  }, [activeTab, competitors, comparison]);

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
        activeTab === id
          ? "border-b-2 text-white"
          : "text-[#aa8899] hover:text-white"
      }`}
      style={{ borderColor: activeTab === id ? accent : "transparent", background: activeTab === id ? 'rgba(255,255,255,0.03)' : 'transparent' }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div
      className="flex flex-col h-full w-full border-r border-white/5 bg-[#0a0a0f]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Market Intelligence</h2>
          <p className="text-[10px] text-[#666677] uppercase font-black tracking-widest mt-1">
             Competitive Tracking Stream
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition text-[#aaaabb] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* NEW: Insight Launch Button */}
      <div className="px-5 pt-3 pb-5">
        <button
          onClick={onOpenFull}
          className="w-full group relative overflow-hidden rounded-2xl bg-white/5 p-4 text-center border border-white/10 transition-all hover:bg-white/10 active:scale-95"
        >
          <div className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-[#00ff88]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#f0f0f0]">Deep Insight Dashboard 📈</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-white/5 shrink-0 bg-black/20">
        <TabButton id="feed" label="Feed" icon={Activity} />
        <TabButton id="compare" label="Analyze" icon={BarChart2} />
        <TabButton id="add" label="Track" icon={Plus} />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 bg-[#0a0a0f]">
        {activeTab === "feed" && (
          <ChangeFeed changes={changes} loading={loading} accent={accent} />
        )}
        
        {activeTab === "compare" && (
          <ComparisonChart
            comparison={comparison}
            loading={loading && !comparison}
            accent={accent}
            mode={mode}
            competitorCount={competitors.length}
          />
        )}
        
        {activeTab === "add" && (
          <AddCompetitorForm
            onCrawled={loadData}
            competitors={competitors}
            accent={accent}
          />
        )}
      </div>
    </div>
  );
}
