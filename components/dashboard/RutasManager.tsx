"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save, Trash2, Loader2, Navigation } from "lucide-react";
import { calculateRoute, createRoute, getRoutes } from "@/lib/api";

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

// Importar el mapa dinámicamente para evitar problemas de SSR
const MapComponent = dynamic<{
  onMapClick: (point: RoutePoint) => void;
  routeData: RouteData;
}>(() => import("@/components/dashboard/route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
});

export default function RutasManager() {
  const [routeData, setRouteData] = useState<RouteData>({
    start: null,
    end: null,
    geometry: null,
    distance: 0,
    duration: 0,
  });
  const [routeName, setRouteName] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const routes = await getRoutes();
      setSavedRoutes(routes);
    } catch (error) {
      console.error("Error loading routes:", error);
    }
  };

  const handleMapClick = async (point: RoutePoint) => {
    if (!routeData.start) {
      setRouteData({
        start: point,
        end: null,
        geometry: null,
        distance: 0,
        duration: 0,
      });
    } else if (!routeData.end) {
      setIsCalculating(true);
      try {
        const result = await calculateRoute(
          [routeData.start.lat, routeData.start.lng],
          [point.lat, point.lng]
        );

        if (result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          setRouteData({
            start: routeData.start,
            end: point,
            geometry: route.geometry,
            distance: route.distance / 1000,
            duration: route.duration / 60,
          });
        }
      } catch (error) {
        console.error("Error calculating route:", error);
        alert("Error al calcular la ruta. Intente nuevamente.");
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const handleResetRoute = () => {
    setRouteData({
      start: null,
      end: null,
      geometry: null,
      distance: 0,
      duration: 0,
    });
    setRouteName("");
  };

  const handleSaveRoute = async () => {
    if (!routeData.start || !routeData.end || !routeName.trim()) {
      alert("Complete el nombre de la ruta y los puntos");
      return;
    }

    setIsSaving(true);
    try {
      await createRoute({
        nombre: routeName,
        puntoInicio: routeData.start,
        puntoFinal: routeData.end,
        geometry: routeData.geometry,
        distancia: `${routeData.distance.toFixed(2)} km`,
        tiempoEstimado: `${Math.round(routeData.duration)} min`,
        estado: "Activa",
      });

      alert("Ruta guardada exitosamente");
      handleResetRoute();
      await loadRoutes();
    } catch (error) {
      console.error("Error saving route:", error);
      alert("Error al guardar la ruta");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Rutas</h1>
        <p className="text-gray-600">
          Crear y gestionar rutas en Ciudad Guayana usando OSRM
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel de Control */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Nueva Ruta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-medium mb-2">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Haga clic en el mapa para marcar el punto de inicio</li>
                  <li>Haga clic nuevamente para marcar el punto final</li>
                  <li>La ruta se calculará automáticamente</li>
                  <li>Asigne un nombre y guarde la ruta</li>
                </ol>
              </div>

              {routeData.start && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Punto de Inicio:</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Lat: {routeData.start.lat.toFixed(5)}, Lng:{" "}
                    {routeData.start.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {routeData.end && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Punto Final:</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Lat: {routeData.end.lat.toFixed(5)}, Lng:{" "}
                    {routeData.end.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {routeData.geometry && (
                <div className="space-y-3 rounded-lg bg-green-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Distancia Total
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {routeData.distance.toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Tiempo Estimado
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {Math.round(routeData.duration)} min
                    </p>
                  </div>
                </div>
              )}

              {routeData.geometry && (
                <div className="space-y-2">
                  <Label htmlFor="routeName">Nombre de la Ruta</Label>
                  <Input
                    id="routeName"
                    placeholder="Ej: Centro - Unare"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2">
                {routeData.geometry && (
                  <Button
                    onClick={handleSaveRoute}
                    disabled={isSaving || !routeName.trim()}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Ruta
                      </>
                    )}
                  </Button>
                )}
                {(routeData.start || routeData.end) && (
                  <Button
                    variant="outline"
                    onClick={handleResetRoute}
                    disabled={isCalculating || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isCalculating && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">
                    Calculando ruta óptima...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rutas Guardadas */}
          <Card>
            <CardHeader>
              <CardTitle>Rutas Guardadas</CardTitle>
            </CardHeader>
            <CardContent>
              {savedRoutes.length === 0 ? (
                <p className="text-sm text-gray-500">No hay rutas guardadas</p>
              ) : (
                <div className="space-y-2">
                  {savedRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-sm">{route.nombre}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                        <span>{route.distancia}</span>
                        <span>•</span>
                        <span>{route.tiempoEstimado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Mapa Interactivo - Ciudad Guayana</CardTitle>
            </CardHeader>
            <CardContent>
              <MapComponent onMapClick={handleMapClick} routeData={routeData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
