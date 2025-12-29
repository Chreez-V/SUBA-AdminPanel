"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const StartIcon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "marker-start",
});

const EndIcon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "marker-end",
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteData {
  start: RoutePoint | null;
  end: RoutePoint | null;
  geometry: any;
  distance: number;
  duration: number;
}

interface MapComponentProps {
  onMapClick: (point: RoutePoint) => void;
  routeData: RouteData;
}

function MapClickHandler({ onMapClick }: { onMapClick: (point: RoutePoint) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function RouteMap({ onMapClick, routeData }: MapComponentProps) {
  // Centro de Ciudad Guayana (Puerto Ordaz)
  const center: [number, number] = [8.2976, -62.7415];
  
  // Convertir geometría OSRM a coordenadas de Leaflet
  const routeCoordinates: [number, number][] = routeData.geometry?.coordinates
    ? routeData.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
    : [];

  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden">
      <style jsx global>{`
        .marker-start {
          filter: hue-rotate(90deg);
        }
        .marker-end {
          filter: hue-rotate(0deg);
        }
      `}</style>
      
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={onMapClick} />

        {/* Marcador de inicio */}
        {routeData.start && (
          <Marker position={[routeData.start.lat, routeData.start.lng]} icon={StartIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-green-600">Punto de Inicio</strong>
                <br />
                Lat: {routeData.start.lat.toFixed(5)}
                <br />
                Lng: {routeData.start.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcador de fin */}
        {routeData.end && (
          <Marker position={[routeData.end.lat, routeData.end.lng]} icon={EndIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-red-600">Punto Final</strong>
                <br />
                Lat: {routeData.end.lat.toFixed(5)}
                <br />
                Lng: {routeData.end.lng.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Línea de la ruta calculada */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: "#2563eb",
              weight: 5,
              opacity: 0.7,
            }}
          />
        )}
      </MapContainer>

      {/* Leyenda */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white p-3 shadow-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">Leyenda:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Punto de Inicio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span>Punto Final</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-blue-600"></div>
            <span>Ruta OSRM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
