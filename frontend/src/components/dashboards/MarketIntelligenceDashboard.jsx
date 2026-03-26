import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { LayoutGrid, TrendingUp, Target, Users, MapPin, Layers, Crosshair, ArrowLeft, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#00ff88', '#00ddeb', '#8844ff', '#ff00aa', '#ffbb00', '#ff4400'];

const StatCard = ({ title, icon: Icon, children, insight, accentColor }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel group overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f1a]/80 p-6 transition-all hover:border-white/20"
  >
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/5 p-2.5">
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <h3 className="font-bold tracking-tight text-[#f0f0f0]">{title}</h3>
      </div>
    </div>
    <div className="h-[240px] w-full">
      {children}
    </div>
    {insight && (
      <div className="mt-4 border-t border-white/5 pt-4">
        <p className="text-xs font-medium leading-relaxed text-[#888899]">
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          {insight}
        </p>
      </div>
    )}
  </motion.div>
);

export function MarketIntelligenceDashboard({ data, onClose, mode }) {
  if (!data || !data.marketDashboard) {
    return (
      <div className="flex h-full items-center justify-center p-20 text-[#888899]">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Layers className="h-12 w-12 opacity-20" />
          </div>
          <p>No dashboard data available. Run a fresh analysis to generate insights.</p>
          <button onClick={onClose} className="mt-4 text-sm font-bold uppercase text-white hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { marketDashboard } = data;
  const accentColor = mode === 'startup' ? '#00ff88' : '#ff8800';

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Map
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div>
              <h1 className="text-xl font-bold text-[#f0f0f0]">Intelligence Dashboard</h1>
              <p className="text-xs font-medium text-[#666677]">Query: <span className="text-[#aaaabb]">{data.idea}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-[#888899] transition-all hover:text-white">
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#00ddeb] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-[#00ff88]/20 transition-all hover:scale-105 active:scale-95">
              <Share2 className="h-3.5 w-3.5" />
              Share Report
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 max-w-7xl px-6">
        {/* Top Summaries */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel rounded-3xl border border-white/5 bg-[#11111a] p-6 text-center">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666677]">Density Score</p>
             <p className="mt-2 text-4xl font-black text-white">{marketDashboard.competitiveDensity || 0}%</p>
             <div className="mt-3 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: `${marketDashboard.competitiveDensity}%` }} />
             </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-1 glass-panel rounded-3xl border border-white/5 bg-[#11111a] p-6 md:col-span-3">
             <div className="flex h-full items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666677]">Strategic Summary</p>
                   <p className="mt-2 text-lg font-semibold text-[#aaaabb]">{marketDashboard.finalSummary?.uniqueOpportunity}</p>
                </div>
                <div className="hidden items-center gap-4 md:flex">
                   <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-[#666677]">Ideal Market</p>
                      <p className="text-sm font-bold text-white">{marketDashboard.finalSummary?.targetMarket}</p>
                   </div>
                   <div className="h-8 w-px bg-white/10" />
                   <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-[#666677]">Pricing Range</p>
                      <p className="text-sm font-bold text-white">{marketDashboard.finalSummary?.idealPriceRange}</p>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>

        {/* The Grid of Charts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* 1. Category Distribution */}
          <StatCard title="Category Distribution" icon={LayoutGrid} accentColor="#00ff88" insight="Identifies the most crowded and underserved product categories.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketDashboard.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="category" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#00ff88" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 2. Price Distribution */}
          <StatCard title="Value Stratification" icon={TrendingUp} accentColor="#00ddeb" insight="Shows the split between budget, mid-range, and premium players.">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketDashboard.priceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {marketDashboard.priceDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 3. Top Offerings */}
          <StatCard title="Feature Dominance" icon={Target} accentColor="#8844ff" insight="Commonly provided features that customers now consider standard.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={marketDashboard.topOfferings} margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="feature" type="category" stroke="#888" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Bar dataKey="frequency" fill="#8844ff" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 4. Gap Analysis */}
          <StatCard title="Market Gap Analysis" icon={Crosshair} accentColor="#ff00aa" insight="Underserved features where you can build a unique differentiator.">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={marketDashboard.gapAnalysis}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="feature" tick={{ fill: '#666', fontSize: 8 }} />
                <Radar name="Gap Score" dataKey="gapScore" stroke="#ff00aa" fill="#ff00aa" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 5. Customer Segments */}
          <StatCard title="Acquisition Focus" icon={Users} accentColor="#ffbb00" insight="Breakdown of specific audience segments currently being targeted.">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketDashboard.customerSegments}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="percentage"
                  label={({ segment }) => segment.length > 8 ? segment.slice(0, 8) + '...' : segment}
                  labelLine={false}
                >
                  {marketDashboard.customerSegments?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 6. Differentiation Map */}
          <StatCard title="Competitive Positioning" icon={MapPin} accentColor="#ff4400" insight="Competitive landscape plotted by Price (X) vs Value (Y).">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#222" />
                <XAxis type="number" dataKey="price" name="Price" stroke="#666" fontSize={10} label={{ value: 'Price', position: 'insideBottom', offset: -10, fill: '#666' }} />
                <YAxis type="number" dataKey="value" name="Value" stroke="#666" fontSize={10} label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: '#666' }} />
                <ZAxis dataKey="competitor" name="Brand" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Scatter name="Competitors" data={marketDashboard.differentiationMap} fill="#ff4400" />
              </ScatterChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 7. Demand Trends */}
          <StatCard title="Temporal Demand" icon={TrendingUp} accentColor="#00ff88" insight="Forecasted demand interest trends for the upcoming months.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketDashboard.demandTrends}>
                <CartesianGrid stroke="#222" vertical={false} />
                <XAxis dataKey="month" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Line type="monotone" dataKey="demand" stroke="#00ff88" strokeWidth={3} dot={{ fill: '#00ff88', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 8. Bundling Ratio */}
          <StatCard title="Revenue Models" icon={Layers} accentColor="#00ddeb" insight="Likelihood of competitors offering bundled vs a la carte plans.">
             <div className="flex h-full flex-col justify-center px-4">
                <div className="mb-4">
                   <div className="mb-2 flex justify-between text-xs font-bold uppercase text-[#888899]">
                      <span>Bundled</span>
                      <span className="text-white">{marketDashboard.bundlingRatio?.bundled}%</span>
                   </div>
                   <div className="h-3 w-full rounded-full bg-white/5">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${marketDashboard.bundlingRatio?.bundled}%` }}
                        className="h-full rounded-full bg-[#00ddeb]" />
                   </div>
                </div>
                <div>
                   <div className="mb-2 flex justify-between text-xs font-bold uppercase text-[#888899]">
                      <span>Individual</span>
                      <span className="text-white">{marketDashboard.bundlingRatio?.individual}%</span>
                   </div>
                   <div className="h-3 w-full rounded-full bg-white/5">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${marketDashboard.bundlingRatio?.individual}%` }}
                        className="h-full rounded-full bg-[#8844ff]" />
                   </div>
                </div>
             </div>
          </StatCard>

          {/* 9. Location Distribution */}
          <StatCard title="Market Geo-Reach" icon={MapPin} accentColor="#ffbb00" insight="Saturation levels in specific metropolitan hubs.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketDashboard.locationDistribution}>
                <XAxis dataKey="city" stroke="#666" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Bar dataKey="presence" fill="#ffbb00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </StatCard>
        </div>

        {/* Final Strategy Summary */}
        <section className="mt-12 rounded-[40px] bg-gradient-to-br from-[#11111a] to-[#0a0a14] p-8 border border-white/5 shadow-2xl">
           <div className="mb-10 flex items-center gap-4">
              <div className="rounded-2xl bg-[#00ff88]/10 p-4">
                 <Crosshair className="h-8 w-8 text-[#00ff88]" />
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white">Winning Strategy</h2>
                 <p className="text-sm font-medium text-[#666677]">Data-driven execution plan for {data.idea}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00ff88]">Must-Have Features</p>
                 <ul className="space-y-3">
                    {marketDashboard.finalSummary?.mustHaveFeatures?.map(f => (
                       <li key={f} className="flex items-start gap-2 text-sm text-[#aaaabb]">
                          <div className="mt-1 h-3 w-3 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10" />
                          {f}
                       </li>
                    ))}
                 </ul>
              </div>

              <div className="space-y-4">
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00ddeb]">Target Market</p>
                 <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-lg font-bold text-white leading-tight">{marketDashboard.finalSummary?.targetMarket}</p>
                    <p className="mt-2 text-xs text-[#666677]">Identified as the highest conversion threshold region.</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8844ff]">Ideal Segment</p>
                 <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-lg font-bold text-white leading-tight">{marketDashboard.finalSummary?.targetSegment}</p>
                    <p className="mt-2 text-xs text-[#666677]">Audience with minimum 85% feature-relevance index.</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Market Gap</p>
                 <div className="h-full rounded-2xl bg-[#00ff88]/5 p-4 border border-[#00ff88]/10">
                    <p className="text-sm font-medium text-[#00ff88] leading-relaxed italic">" {marketDashboard.finalSummary?.uniqueOpportunity} "</p>
                 </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
