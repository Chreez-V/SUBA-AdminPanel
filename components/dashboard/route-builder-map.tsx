"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Icons ───────────────────────────────────────────────
const makeIcon = (color: string, size = 24) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;">
      <div style="width:${size * 0.35}px;height:${size * 0.35}px;background:white;border-radius:50%;"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });

const DefaultStopIcon = makeIcon("#6366f1"); // indigo - unselected
const SelectedStopIcon = makeIcon("#f59e0b", 28); // amber - selected / part of current route
const FirstStopIcon = makeIcon("#10b981", 28); // green - first stop in chain

// ── Types ───────────────────────────────────────────────
export interface StopOnMap {
  _id: string;
  name: string;
  location: { lat: number; lng: number };
}

export interface EdgeOnMap {
  fromStop: string;
  toStop: string;
  geometry: { type: string; coordinates: number[][] };
  distance: number;
  duration: number;
}

export interface SavedRouteOnMap {
  _id: string;
  name: string;
  geometry: any;
  distance: number;
  duration: number;
  routeType: 'circular' | 'bidirectional';
  isActive: boolean;
  stops?: any[];
}

interface RouteBuilderMapProps {
  /** All active stops to display */
  stops: StopOnMap[];
  /** Ordered stop IDs selected so far */
  selectedStopIds: string[];
  /** Computed OSRM edges between selected stops */
  edges: EdgeOnMap[];
  /** When admin clicks a stop marker */
  onStopClick: (stopId: string) => void;
  /** A saved route to overlay on the map */
  viewingRoute?: SavedRouteOnMap | null;
}

export default function RouteBuilderMap({
  stops,
  selectedStopIds,
  edges,
  onStopClick,
  viewingRoute,
}: RouteBuilderMapProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const center: [number, number] = [8.2976, -62.7415];

  // Build polyline coordinates from edges
  const edgeLines: [number, number][][] = edges.map((e) =>
    (e.geometry?.coordinates || []).map((c: number[]) => [c[1], c[0]] as [number, number])
  );

  // Viewing route geometry
  const viewCoords: [number, number][] =
    viewingRoute?.geometry?.coordinates?.map((c: number[]) => [c[1], c[0]] as [number, number]) ||
    [];

  if (!ready) {
    return (
      <div className="flex h-[400px] md:h-[500px] lg:h-[600px] items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-gray-500">Cargando mapa…</span>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-lg overflow-hidden">
      <style jsx global>{`
        .custom-marker { background: transparent !important; border: none !important; }
        .stop-clickable { cursor: pointer !important; }
      `}</style>

      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── All stops ── */}
        {stops.map((s) => {
          const idx = selectedStopIds.indexOf(s._id);
          const isFirst = idx === 0;
          const isSelected = idx >= 0;
          const icon = isFirst ? FirstStopIcon : isSelected ? SelectedStopIcon : DefaultStopIcon;

          return (
            <Marker
              key={s._id}
              position={[s.location.lat, s.location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onStopClick(s._id),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong className={isFirst ? "text-green-700" : isSelected ? "text-amber-700" : "text-indigo-700"}>
                    {s.name}
                  </strong>
                  {isSelected && (
                    <>
                      <br />
                      <span className="text-xs text-gray-500">
                        Orden: #{idx + 1}
                        {isFirst && " (inicio)"}
                      </span>
                    </>
                  )}
                  <br />
                  <span className="text-xs text-gray-500">
                    {s.location.lat.toFixed(5)}, {s.location.lng.toFixed(5)}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ── OSRM edges currently being built ── */}
        {edgeLines.map((coords, i) => (
          <Polyline
            key={`edge-${i}`}
            positions={coords}
            pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.8 }}
          />
        ))}

        {/* ── Viewing a saved route overlay ── */}
        {viewCoords.length > 0 && (
          <Polyline
            positions={viewCoords}
            pathOptions={{ color: "#10b981", weight: 5, opacity: 0.7 }}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-green-700">{viewingRoute?.name}</strong>
                <br />
                📏 {viewingRoute?.distance.toFixed(2)} km
                <br />
                ⏱️ {Math.round(viewingRoute?.duration || 0)} min
                <br />
                🔄 {viewingRoute?.routeType === "circular" ? "Circular" : "Bidireccional"}
                <br />
                {viewingRoute?.isActive ? "✅ Activa" : "❌ Inactiva"}
              </div>
            </Popup>
          </Polyline>
        )}
      </MapContainer>

      {/* ── Legend ── */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-[1000] rounded-lg bg-white p-2 md:p-3 shadow-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-1 md:mb-2">Leyenda:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-indigo-500 border-2 border-white shadow" />
            <span>Parada disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow" />
            <span>Inicio de ruta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500 border-2 border-white shadow" />
            <span>Parada seleccionada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-blue-600" />
            <span>Arista OSRM</span>
          </div>
          {viewingRoute && (
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-4 bg-green-500" />
              <span>Ruta guardada</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Info overlay for viewing route ── */}
      {viewingRoute && (
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-[1000] rounded-lg bg-white border-2 border-green-500 p-2 md:p-3 shadow-lg max-w-[200px] md:max-w-xs">
          <p className="text-xs md:text-sm font-semibold text-green-800 mb-1">
            📍 {viewingRoute.name}
          </p>
          <div className="text-xs text-gray-700 space-y-0.5">
            <p>📏 {viewingRoute.distance.toFixed(2)} km</p>
            <p>⏱️ {Math.round(viewingRoute.duration)} min</p>
            <p>🔄 {viewingRoute.routeType === "circular" ? "Circular" : "Bidireccional"}</p>
            <p className={viewingRoute.isActive ? "text-green-600" : "text-red-600"}>
              {viewingRoute.isActive ? "✅ Activa" : "⚠️ Inactiva"}
            </p>
            {viewingRoute.stops && viewingRoute.stops.length > 0 && (
              <div className="mt-1 pt-1 border-t border-gray-200">
                <p className="font-semibold text-gray-800 mb-0.5">Paradas:</p>
                {viewingRoute.stops.map((s: any, i: number) => (
                  <p key={`${i}-${s._id}`} className="text-xs text-gray-600">
                    {i + 1}. {s.name || s._id}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
