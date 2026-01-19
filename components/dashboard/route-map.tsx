"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const StartIcon = createCustomIcon('#10b981'); // Green
const EndIcon = createCustomIcon('#ef4444'); // Red

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

interface SavedRoute {
  _id: string;
  name: string;
  distance: number;
  duration: number;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  geometry: any;
  isActive: boolean;
  fare?: number;
  schedules?: string[];
}

interface MapComponentProps {
  onMapClick: (point: RoutePoint) => void;
  routeData: RouteData;
  selectedRoute?: SavedRoute | null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (point: RoutePoint) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function RouteMap({ onMapClick, routeData, selectedRoute }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Centro de Ciudad Guayana (Puerto Ordaz)
  const center: [number, number] = [8.2976, -62.7415];
  
  // Convertir geometría OSRM a coordenadas de Leaflet
  const routeCoordinates: [number, number][] = routeData.geometry?.coordinates
    ? routeData.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
    : [];

  if (!isClient) {
    return (
      <div className="flex h-[400px] md:h-[500px] lg:h-[600px] items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-lg overflow-hidden">
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font-family: inherit;
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
              color: selectedRoute ? "#10b981" : "#2563eb",
              weight: 5,
              opacity: 0.7,
            }}
          >
            <Popup>
              <div className="text-sm">
                {selectedRoute ? (
                  <>
                    <strong className="text-green-600">{selectedRoute.name}</strong>
                    <br />
                    Distancia: {selectedRoute.distance.toFixed(2)} km
                    <br />
                    Duración: {Math.round(selectedRoute.duration)} min
                    <br />
                    {selectedRoute.fare && (
                      <>
                        Tarifa: Bs. {selectedRoute.fare.toFixed(2)}
                        <br />
                      </>
                    )}
                    Estado: {selectedRoute.isActive ? '✅ Activa' : '❌ Inactiva'}
                    {selectedRoute.schedules && selectedRoute.schedules.length > 0 && (
                      <>
                        <br />
                        Horarios: {selectedRoute.schedules.join(', ')}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <strong className="text-blue-600">Nueva Ruta</strong>
                    <br />
                    Haz clic en "Guardar" para registrar
                  </>
                )}
              </div>
            </Popup>
          </Polyline>
        )}
      </MapContainer>

      {/* Leyenda responsive */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-[1000] rounded-lg bg-white p-2 md:p-3 shadow-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-1 md:mb-2">Leyenda:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500"></div>
            <span className="hidden md:inline">Punto de Inicio</span>
            <span className="md:hidden">Inicio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-red-500"></div>
            <span className="hidden md:inline">Punto Final</span>
            <span className="md:hidden">Final</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-blue-600"></div>
            <span>Ruta</span>
          </div>
        </div>
      </div>

      {/* Info overlay cuando hay ruta seleccionada */}
      {selectedRoute && (
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-[1000] rounded-lg bg-white border-2 border-green-500 p-2 md:p-3 shadow-lg max-w-[200px] md:max-w-xs">
          <p className="text-xs md:text-sm font-semibold text-green-800 mb-1">
            📍 {selectedRoute.name}
          </p>
          <div className="text-xs text-gray-700 space-y-0.5">
            <p>📏 {selectedRoute.distance.toFixed(2)} km</p>
            <p>⏱️ {Math.round(selectedRoute.duration)} min</p>
            {selectedRoute.fare && selectedRoute.fare > 0 && (
              <p>💵 Bs. {selectedRoute.fare.toFixed(2)}</p>
            )}
            <p className={selectedRoute.isActive ? 'text-green-600' : 'text-red-600'}>
              {selectedRoute.isActive ? '✅ Activa' : '⚠️ Inactiva'}
            </p>
            {selectedRoute.schedules && selectedRoute.schedules.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="font-semibold text-gray-800 mb-1">🕐 Horarios:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedRoute.schedules.map((schedule, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                      {schedule}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
