import "leaflet/dist/leaflet.css";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import L from "leaflet";
import { Marker, MapContainer, TileLayer, Tooltip, Popup, useMapEvents, Circle } from "react-leaflet";
import { createPortal } from "react-dom";
import { fetchStateCities } from "../../lib/fetchStateCities";
import { AddShopModal } from "./AddShopModal";
import { NextShopPanel } from "./NextShopPanel";
import { useAuth } from "../../hooks/useAuth";

// ─── Map Event interceptor for Pin Placement logic ────────────────────────────
function MapEventController({ isPlacingPin, onMapClick }) {
  const map = useMapEvents({
    click(e) {
      if (isPlacingPin) {
        onMapClick(e.latlng);
        map.getContainer().style.cursor = "";
      }
    },
  });

  useEffect(() => {
    if (map && map.getContainer()) {
      map.getContainer().style.cursor = isPlacingPin ? "crosshair" : "";
    }
  }, [isPlacingPin, map]);

  return null;
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
const startupColors  = { high: "#00ff88", medium: "#ffdd00", low: "#ff4466" };
const businessColors = { high: "#ff8800", medium: "#ffaa33", low: "#ff3355" };

// ─── Marker factories ─────────────────────────────────────────────────────────
const createGlowMarker = (color, size = 16, isTop = false) => {
  const finalSize = isTop ? size + 4 : size;
  const animName  = isTop ? "pulseGap" : "pulse";

  return L.divIcon({
    className: "leaflet-interactive",
    html: `<div style="
      width: ${finalSize}px;
      height: ${finalSize}px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 ${finalSize}px ${color}, 0 0 ${finalSize * 2}px ${color}44;
      border: 2px solid ${color}cc;
      animation: ${animName} 2s infinite;
      cursor: pointer;
      pointer-events: auto;
    "></div>`,
    iconSize:   [finalSize, finalSize],
    iconAnchor: [finalSize / 2, finalSize / 2],
  });
};

const createCityLabel = (name, score) => {
  const color = score >= 70 ? "#00ff88" : score >= 40 ? "#ffdd00" : "#ff4466";
  return L.divIcon({
    className: "leaflet-interactive",
    html: `<div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      pointer-events: none;
    ">
      <span style="
        color: #f0f0f0;
        font-size: 11px;
        font-weight: 600;
        text-shadow: 0 0 8px #000, 0 0 4px #000;
        white-space: nowrap;
      ">${name}</span>
      <span style="
        background: ${color};
        color: #000;
        font-size: 9px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 8px;
        box-shadow: 0 0 6px ${color};
      ">${score}</span>
    </div>`,
    iconSize:   [80, 32],
    iconAnchor: [40, 16],
  });
};

const createPrivatePin = (type) => {
  const emoji = type === "warehouse" ? "📦" : type === "pos" ? "📱" : "🏪";
  return L.divIcon({
    className: "leaflet-interactive",
    html: `<div style="
      font-size: 24px;
      line-height: 1;
      filter: drop-shadow(0 0 8px #00ff88);
      pointer-events: auto;
      cursor: pointer;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
    ">${emoji}</div>`,
    iconSize:    [32, 32],
    iconAnchor:  [16, 16],
    popupAnchor: [0, -16],
  });
};

// 5C — profit-zone centre label
const createProfitZoneLabel = () =>
  L.divIcon({
    className: "profit-zone-label",
    html: `<div style="
      font-size: 11px;
      font-weight: 700;
      color: #00ff88;
      text-shadow: 0 0 8px #00ff88, 0 0 4px #000;
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
    ">💡 High Profit Zone</div>`,
    iconSize:   [130, 20],
    iconAnchor: [65, 10],
  });

// 5D — competitor orange dot
const createCompetitorMarker = () =>
  L.divIcon({
    className: "",
    html: `<div style="
      width: 18px; height: 18px;
      border-radius: 50%;
      background: #ff6600;
      box-shadow: 0 0 12px #ff6600, 0 0 24px #ff660044;
      border: 2px solid #ff8833;
      cursor: pointer;
    "></div>`,
    iconSize:    [18, 18],
    iconAnchor:  [9, 9],
    popupAnchor: [0, -12],
  });

// 5E — rocket next-shop star marker
const createNextShopMarker = () =>
  L.divIcon({
    className: "",
    html: `<div style="
      font-size: 28px;
      animation: rocketPulse 1.5s ease-in-out infinite;
      cursor: pointer;
      pointer-events: auto;
      line-height: 1;
    ">🚀</div>`,
    iconSize:    [36, 36],
    iconAnchor:  [18, 18],
    popupAnchor: [0, -20],
  });

// ─── Stars helper ─────────────────────────────────────────────────────────────
const Stars = ({ rating }) => {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span style={{ color: "#ffdd00", fontSize: 11 }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
      <span style={{ color: "#aaaabb", fontSize: 10, marginLeft: 4 }}>{rating}</span>
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export function IndiaMap({ darkMode, regions, idea, mode, analysisData, analyzed, uiHidden, onRegionFocus }) {
  const tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [mapInstance, setMapInstance]     = useState(null);
  const [analyzingState, setAnalyzingState] = useState(null);
  const [deepZoom, setDeepZoom]           = useState(null);

  // 5B — private shop pins
  const [pins, setPins]               = useState([]);
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [modalPos, setModalPos]       = useState(null);

  // 5E — next shop predictor
  const [predictLoading, setPredictLoading] = useState(false);
  const [nextShopData, setNextShopData]     = useState(null);
  const [showNextShopPanel, setShowNextShopPanel] = useState(false);
  const nextShopMarkerRef = useRef(null);

  // ── Load user pins (Scoped by Idea) ───────────────────────────────────────
  const loadPins = useCallback(async () => {
    const anonId = "anonymous-local-device";
    try {
      const url = `${API_BASE}/pins?userId=${user?.uid || anonId}&idea=${encodeURIComponent(idea)}&t=${Date.now()}`;
      const res  = await fetch(url);
      const json = await res.json();
      if (json.success) setPins(json.pins);
    } catch (e) {
      console.error("Failed to load pins", e);
    }
  }, [user?.uid, API_BASE, idea]);

  useEffect(() => { loadPins(); }, [loadPins]);

  const handleSavePin = async (pinData) => {
    try {
      const anonId = "anonymous-local-device";
      const payload = { 
        ...pinData, 
        userId: user?.uid || anonId, 
        userEmail: user?.email || "anonymous@startupseeker.in",
        idea: idea
      };
      const res = await fetch(`${API_BASE}/pins`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Failed to save pin:", data.message);
      } else {
        await loadPins();
      }
    } catch (e) {
      console.error("Network error while saving pin:", e);
    }
    setModalPos(null);
    setIsPlacingPin(false);
  };

  // ── Normalise state markers ─────────────────────────────────────────────────
  const normalized = useMemo(() => {
    const colors = darkMode ? businessColors : startupColors;
    return regions.map((region, index) => {
      const baseSize = 8 + Math.round(region.opportunityScore / 10);
      const isTop    = index === 0;
      const color    = colors[region.level] || colors.low;
      return { ...region, markerIcon: createGlowMarker(color, baseSize, isTop) };
    });
  }, [regions, darkMode]);

  // ── 5A — state click / deep zoom ───────────────────────────────────────────
  const handleRegionClick = async (region) => {
    if (!mapInstance || isPlacingPin) return;

    mapInstance.flyTo([region.lat, region.lng], 8, { animate: true, duration: 1.5 });
    setAnalyzingState(region.name);
    setDeepZoom(null);
    if (onRegionFocus) onRegionFocus(region.id);

    const cities = await fetchStateCities(region.name);
    if (cities.length === 0) { setAnalyzingState(null); return; }

    try {
      const res  = await fetch(`${API_BASE}/analyze-cities`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ stateName: region.name, cities, idea, mode }),
      });
      const data = await res.json();
      if (data.success && data.cities) {
        setDeepZoom({ stateName: region.name, cities: data.cities });
      }
    } catch {
      // silent
    } finally {
      setAnalyzingState(null);
    }
  };

  const handleBackToIndia = () => {
    setDeepZoom(null);
    if (onRegionFocus) onRegionFocus(null);
    if (mapInstance) mapInstance.flyTo([22.5, 80.5], 5, { animate: true, duration: 1.5 });
  };

  // ── 5E — predict next shop ─────────────────────────────────────────────────
  const handlePredictNextShop = async () => {
    if (predictLoading) return;
    setPredictLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/predict-next-shop`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userId:       user?.uid || "anonymous",
          idea:         idea || "general business",
          existingPins: pins.map((p) => ({ lat: p.lat, lng: p.lng, type: p.type })),
          mode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNextShopData(data);
        setShowNextShopPanel(true);
        if (mapInstance && data.recommendedLocation) {
          mapInstance.flyTo(
            [data.recommendedLocation.lat, data.recommendedLocation.lng],
            10,
            { animate: true, duration: 1.8 }
          );
        }
      }
    } catch (e) {
      console.error("predict-next-shop failed:", e);
    } finally {
      setPredictLoading(false);
    }
  };

  // ── Derived analysis extras (5C & 5D) ──────────────────────────────────────
  const profitZones  = analysisData?.profitZones  || [];
  const competitors  = analysisData?.competitors  || [];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 bg-[#0a0a0f]">
      {/* 5A — Analysing overlay (Portal to center) */}
      {analyzingState && createPortal(
        <div className="glass-panel fixed left-1/2 top-10 z-[5000] -translate-x-1/2 px-6 py-3 font-semibold tracking-wide text-[#f0f0f0] shadow-xl">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-[#00ff88] mr-3 align-middle" />
          Analysing cities in {analyzingState}...
        </div>,
        document.body
      )}

      {/* 5A — Back to India button (Portal to top-left) */}
      {deepZoom && createPortal(
        <button
          id="back-to-india-btn"
          onClick={() => {
            setAnalyzingState(null);
            handleBackToIndia();
          }}
          className="glass-panel fixed left-5 top-24 z-[5000] flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#f0f0f0] transition hover:bg-white/5 shadow-2xl"
        >
          ← Back to India
        </button>,
        document.body
      )}

      {/* 5B — Add Private Shop Button */}
      {analyzed && !uiHidden && (
        <button
          id="add-shop-btn"
          onClick={() => { setIsPlacingPin(!isPlacingPin); setModalPos(null); }}
          className="glass-panel absolute bottom-6 left-5 z-[2000] flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#f0f0f0] shadow-[0_0_20px_rgba(0,0,0,0.4)] transition hover:bg-white/5"
          style={{
            borderColor: isPlacingPin ? "#ff4466" : "#00ff88",
            color:       isPlacingPin ? "#ff4466" : "#00ff88",
            background:  isPlacingPin ? "rgba(255,68,102,0.1)" : "rgba(10,10,15,0.7)",
          }}
        >
          {isPlacingPin ? "❌ Cancel Placement" : "📍 Add My Shop"}
        </button>
      )}

      {/* 5E — Predict Next Shop Button */}
      {analyzed && !uiHidden && (
        <button
          id="predict-next-shop-btn"
          onClick={handlePredictNextShop}
          disabled={predictLoading}
          className="glass-panel absolute bottom-6 right-5 z-[2000] flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(0,0,0,0.4)] transition disabled:opacity-60"
          style={{
            borderColor: "#00ff88",
            color:       "#00ff88",
            background:  predictLoading ? "rgba(0,255,136,0.05)" : "rgba(10,10,15,0.7)",
            boxShadow:   predictLoading ? "none" : "0 0 20px rgba(0,255,136,0.15)",
          }}
        >
          {predictLoading ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88]" />
              Predicting...
            </>
          ) : (
            "🚀 Predict Next Shop"
          )}
        </button>
      )}

      {/* 5B — AddShopModal (In portal) */}
      {modalPos && createPortal(
        <div className="fixed inset-0 z-[6000]">
          <AddShopModal
            open={true}
            position={modalPos}
            onCancel={() => setModalPos(null)}
            onSave={handleSavePin}
          />
        </div>,
        document.body
      )}

      {/* 5E — Next Shop Panel (Portal-based from right) */}
      {showNextShopPanel && nextShopData && createPortal(
        <div className="fixed inset-0 z-[6000] pointer-events-none">
          <div className="pointer-events-auto h-full ml-auto">
            <NextShopPanel
              data={nextShopData}
              onClose={() => setShowNextShopPanel(false)}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ── Leaflet Map ─────────────────────────────────────────────────────── */}
      <MapContainer
        center={[22.5, 80.5]}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        zoomControl={false}
        className="h-full w-full bg-[#0a0a0f]"
        attributionControl={false}
        ref={setMapInstance}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url={tileUrl}
        />

        <MapEventController
          isPlacingPin={isPlacingPin}
          onMapClick={(latlng) => setModalPos(latlng)}
        />

        {/* 5A — State-level markers (hidden when deep-zoomed or not analyzed) */}
        {analyzed && !deepZoom &&
          normalized.map((region) => (
            <Marker
              key={region.id}
              position={[region.lat, region.lng]}
              icon={region.markerIcon}
              eventHandlers={{ click: () => handleRegionClick(region) }}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={1}>
                <div className="space-y-1 text-xs" style={{ color: "black" }}>
                  <p className="font-semibold text-slate-900">{region.name}</p>
                  <p className="text-slate-700">Opportunity: {region.opportunityScore}/100</p>
                  <p className="mt-2 text-[10px] font-bold uppercase text-blue-600">
                    Click to Deep Dive 🔍
                  </p>
                </div>
              </Tooltip>
            </Marker>
          ))}

        {/* 5A — Deep zoom city labels */}
        {analyzed && deepZoom &&
          deepZoom.cities.map((city, i) => (
            <Marker
              key={`city-${i}`}
              position={[city.lat, city.lon]}
              icon={createCityLabel(city.name, city.score)}
              interactive={false}
            />
          ))}

        {/* 5B — Private user shop pins */}
        {pins.map((pin) => (
          <Marker
            key={pin._id}
            position={[pin.lat, pin.lng]}
            icon={createPrivatePin(pin.type)}
          >
            <Popup className="shop-pin-popup">
              <div className="flex flex-col gap-1 p-1 min-w-[200px]">
                <span className="font-bold text-sm text-slate-900 border-b pb-1 mb-1">
                  {pin.name}
                </span>
                <span className="text-xs uppercase font-semibold text-emerald-600 tracking-wider inline-block">
                  {pin.type}
                </span>
                <span className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {pin.address}
                </span>
                <a
                  href="mailto:admin@startupseeker.in"
                  className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  Request main DB merge
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 5C — Profit-opportunity zone circles */}
        {analyzed && profitZones.map((zone, i) => (
          <React.Fragment key={`pz-${i}`}>
            <Circle
              center={[zone.lat, zone.lng]}
              radius={80000}
              pathOptions={{
                color:       "#00ff88",
                fillColor:   "#00ff88",
                fillOpacity: 0.07,
                weight:      2,
                opacity:     0.55,
                dashArray:   "8, 4",
              }}
            >
              <Tooltip sticky direction="top" opacity={1}>
                <div style={{ color: "black", maxWidth: 220, fontSize: 12 }}>
                  <p className="font-bold">💡 {zone.name}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    {zone.reason}
                  </p>
                </div>
              </Tooltip>
            </Circle>

            {/* Centre label */}
            <Marker
              position={[zone.lat, zone.lng]}
              icon={createProfitZoneLabel()}
              interactive={false}
            />
          </React.Fragment>
        ))}

        {/* 5D — Competitor markers (business mode) */}
        {analyzed && mode === "business" &&
          competitors.map((comp, i) => (
            <Marker
              key={`comp-${i}`}
              position={[comp.lat, comp.lng]}
              icon={createCompetitorMarker()}
            >
              <Popup className="competitor-popup">
                <div
                  style={{
                    padding:    "14px 16px",
                    minWidth:   200,
                    background: "transparent",
                  }}
                >
                  <div
                    style={{
                      fontSize:     13,
                      fontWeight:   700,
                      color:        "#ff8833",
                      marginBottom: 4,
                      lineHeight:   1.2,
                    }}
                  >
                    {comp.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#aaaabb", marginBottom: 8 }}>
                    📍 {comp.city}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems:     "center",
                      gap:            8,
                    }}
                  >
                    <span
                      style={{
                        background:   "rgba(255,102,0,0.15)",
                        border:       "1px solid rgba(255,102,0,0.3)",
                        borderRadius: 6,
                        padding:      "2px 8px",
                        fontSize:     10,
                        fontWeight:   700,
                        color:        "#ff8833",
                      }}
                    >
                      {comp.marketShare} share
                    </span>
                    <Stars rating={Number(comp.rating) || 0} />
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 5E — Next shop predicted marker */}
        {analyzed && nextShopData?.recommendedLocation && (
          <Marker
            ref={nextShopMarkerRef}
            position={[
              nextShopData.recommendedLocation.lat,
              nextShopData.recommendedLocation.lng,
            ]}
            icon={createNextShopMarker()}
            eventHandlers={{ click: () => setShowNextShopPanel(true) }}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <div style={{ color: "black", fontSize: 12, fontWeight: 700 }}>
                🚀 {nextShopData.recommendedLocation.name}
                <br />
                <span style={{ fontWeight: 400, fontSize: 10, color: "#444" }}>
                  Click for full financial breakdown
                </span>
              </div>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
