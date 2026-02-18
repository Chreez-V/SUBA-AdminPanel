"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, CircleMarker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const StopIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#6366f1;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;">
    <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
  </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

const NewPinIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#f59e0b;width:28px;height:28px;border-radius:50% 50% 50% 0;border:3px solid white;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35);">
    <div style="width:10px;height:10px;background:white;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface StopLocation {
  lat: number;
  lng: number;
}

export interface StopMarker {
  _id: string;
  name: string;
  location: StopLocation;
  isActive: boolean;
}

interface StopMapProps {
  stops: StopMarker[];
  newPin: StopLocation | null;
  onMapClick: (point: StopLocation) => void;
}

function ClickHandler({ onMapClick }: { onMapClick: (p: StopLocation) => void }) {
  useMapEvents({ click: (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function StopMap({ stops, newPin, onMapClick }: StopMapProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const center: [number, number] = [8.2976, -62.7415];

  if (!ready) {
    return (
      <div className="flex h-[400px] md:h-[500px] lg:h-[600px] items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-gray-500">Cargando mapa…</span>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-lg overflow-hidden">
      <style jsx global>{`.custom-marker{background:transparent!important;border:none!important}`}</style>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={onMapClick} />

        {/* Existing stops */}
        {stops.map((s) => (
          <Marker key={s._id} position={[s.location.lat, s.location.lng]} icon={StopIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-indigo-700">{s.name}</strong>
                <br />
                <span className={s.isActive ? "text-green-600" : "text-red-500"}>
                  {s.isActive ? "Activa" : "Inactiva"}
                </span>
                <br />
                <span className="text-xs text-gray-500">
                  {s.location.lat.toFixed(5)}, {s.location.lng.toFixed(5)}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* New pin being placed */}
        {newPin && (
          <Marker position={[newPin.lat, newPin.lng]} icon={NewPinIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-amber-600">Nueva Parada</strong>
                <br />
                <span className="text-xs text-gray-500">
                  {newPin.lat.toFixed(5)}, {newPin.lng.toFixed(5)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-[1000] rounded-lg bg-white p-2 md:p-3 shadow-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-1">Leyenda:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-indigo-500 border-2 border-white shadow" />
            <span>Parada existente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500 border-2 border-white shadow" />
            <span>Nueva parada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
