import "leaflet/dist/leaflet.css";

import { useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

const levelColor = {
  high: "#2dd4bf",
  medium: "#facc15",
  low: "#f87171",
};

export function IndiaMap({ darkMode, regions }) {
  const tileUrl = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const normalized = useMemo(() => {
    return regions.map((region) => {
      const radius = 9 + Math.round(region.opportunityScore / 14);
      return {
        ...region,
        radius,
        color: levelColor[region.level],
      };
    });
  }, [regions]);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[22.5, 80.5]}
        zoom={5}
        minZoom={4}
        maxZoom={7}
        zoomControl={false}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        {normalized.map((region) => (
          <CircleMarker
            key={region.id}
            center={[region.lat, region.lng]}
            radius={region.radius}
            pathOptions={{
              color: region.color,
              fillColor: region.color,
              fillOpacity: 0.35,
              opacity: 0.95,
              weight: 2,
              className: "map-pulse",
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <div className="space-y-1 text-xs">
                <p className="font-semibold">{region.name}</p>
                <p>Opportunity: {region.opportunityScore}/100</p>
                <p>
                  Trend: G {region.growth} | D {region.demand} | B {region.buzz}
                </p>
              </div>
            </Tooltip>
            <CircleMarker
              center={[region.lat, region.lng]}
              radius={region.radius + 8}
              pathOptions={{
                color: region.color,
                fillColor: region.color,
                fillOpacity: 0.08,
                opacity: 0.35,
                weight: 1,
                className: "map-halo",
              }}
            />
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
