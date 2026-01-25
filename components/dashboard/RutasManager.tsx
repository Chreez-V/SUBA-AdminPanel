"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save, Trash2, Loader2, Navigation, X, Power } from "lucide-react";
import { createRoute, getRoutes, deleteRoute, deactivateRoute, updateRoute, type Route } from "@/lib/api/routes.api";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  fare: number;
  isActive: boolean;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  geometry: any;
  schedules?: string[];
}

// Importar el mapa dinámicamente para evitar problemas de SSR
const MapComponent = dynamic<{
  onMapClick: (point: RoutePoint) => void;
  routeData: RouteData;
  selectedRoute?: SavedRoute | null;
}>(() => import("@/components/dashboard/route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] md:h-[400px] lg:h-[600px] items-center justify-center bg-gray-100 rounded-lg">
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
  const [fare, setFare] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SavedRoute | null>(null);
  const [editingRoute, setEditingRoute] = useState<SavedRoute | null>(null);
  const { addToast } = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; routeId: string | null; routeName: string }>({
    isOpen: false,
    routeId: null,
    routeName: '',
  });

  const [deactivateDialog, setDeactivateDialog] = useState<{ isOpen: boolean; routeId: string | null; routeName: string; isActive: boolean }>({
    isOpen: false,
    routeId: null,
    routeName: '',
    isActive: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const routes = await getRoutes();
      // Convertir Route[] a SavedRoute[] asegurando que fare tenga un valor por defecto
      const savedRoutes: SavedRoute[] = routes.map(route => ({
        ...route,
        fare: route.fare ?? 0,
      }));
      setSavedRoutes(savedRoutes);
    } catch (error) {
      console.error("Error loading routes:", error);
      addToast({
        type: "error",
        message: "Error al cargar las rutas",
      });
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
      setRouteData(prev => ({ ...prev, end: point }));
      setIsCalculating(false);
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
    setFare("");
    setSelectedRoute(null);
    setEditingRoute(null);
  };

  const handleSaveRoute = async () => {
    if (!routeData.start || !routeData.end || !routeName.trim()) {
      addToast({
        type: "warning",
        message: "Complete el nombre de la ruta y los puntos de inicio y final",
      });
      return;
    }

    setIsSaving(true);
    try {
      const newRoute = await createRoute({
        name: routeName,
        startPoint: { lat: routeData.start.lat, lng: routeData.start.lng },
        endPoint: { lat: routeData.end.lat, lng: routeData.end.lng },
        fare: fare ? parseFloat(fare) : 0,
      });

      addToast({
        type: "success",
        message: `✅ Ruta "${routeName}" creada exitosamente`,
      });

      handleResetRoute();
      await loadRoutes();
    } catch (error: any) {
      console.error("Error saving route:", error);
      addToast({
        type: "error",
        message: error.message || "Error al guardar la ruta",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (route: SavedRoute) => {
    setDeleteDialog({
      isOpen: true,
      routeId: route._id,
      routeName: route.name,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.routeId) return;

    setIsProcessing(true);
    try {
      await deleteRoute(deleteDialog.routeId);

      addToast({
        type: "success",
        message: `🗑️ Ruta "${deleteDialog.routeName}" eliminada permanentemente`,
      });

      await loadRoutes();

      if (selectedRoute?._id === deleteDialog.routeId) {
        setSelectedRoute(null);
        handleResetRoute();
      }
    } catch (error: any) {
      console.error("Error deleting route:", error);
      addToast({
        type: "error",
        message: error.message || "Error al eliminar la ruta",
      });
    } finally {
      setIsProcessing(false);
      setDeleteDialog({ isOpen: false, routeId: null, routeName: '' });
    }
  };

  const handleOpenDeactivateDialog = (route: SavedRoute) => {
    setDeactivateDialog({
      isOpen: true,
      routeId: route._id,
      routeName: route.name,
      isActive: route.isActive,
    });
  };

  const handleConfirmToggleActive = async () => {
    if (!deactivateDialog.routeId) return;

    setIsProcessing(true);
    try {
      if (deactivateDialog.isActive) {
        await deactivateRoute(deactivateDialog.routeId);
        addToast({
          type: "warning",
          message: `⚠️ Ruta "${deactivateDialog.routeName}" desactivada`,
        });
      } else {
        await updateRoute(deactivateDialog.routeId, { isActive: true });
        addToast({
          type: "success",
          message: `✅ Ruta "${deactivateDialog.routeName}" activada`,
        });
      }

      await loadRoutes();
    } catch (error: any) {
      console.error("Error toggling route:", error);
      addToast({
        type: "error",
        message: error.message || "Error al cambiar el estado de la ruta",
      });
    } finally {
      setIsProcessing(false);
      setDeactivateDialog({ isOpen: false, routeId: null, routeName: '', isActive: false });
    }
  };

  const handleViewRoute = (route: SavedRoute) => {
    setSelectedRoute(route);
    setRouteData({
      start: route.startPoint,
      end: route.endPoint,
      geometry: route.geometry,
      distance: route.distance,
      duration: route.duration,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mb-4 md:mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00457C]">Gestión de Rutas</h1>
        <p className="text-sm md:text-base text-gray-700 font-medium mt-1">
          Crear y gestionar rutas en Ciudad Guayana usando OSRM
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="space-y-4 md:space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <Navigation className="h-4 w-4 md:h-5 md:w-5" />
                Nueva Ruta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-3 text-xs md:text-sm text-blue-800">
                <p className="font-medium mb-2">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Haga clic en el mapa para el punto de inicio</li>
                  <li>Haga clic para el punto final</li>
                  <li>Asigne un nombre y guarde la ruta</li>
                </ol>
              </div>

              {routeData.start && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                    <span className="font-medium">Inicio:</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {routeData.start.lat.toFixed(5)}, {routeData.start.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {routeData.end && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                    <span className="font-medium">Final:</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {routeData.end.lat.toFixed(5)}, {routeData.end.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {routeData.start && routeData.end && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="routeName" className="text-xs md:text-sm">Nombre de la Ruta</Label>
                    <Input
                      id="routeName"
                      placeholder="Ej: Centro - Unare"
                      value={routeName}
                      onChange={(e) => setRouteName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fare" className="text-xs md:text-sm">Tarifa (Bs.) - Opcional</Label>
                    <Input
                      id="fare"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={fare}
                      onChange={(e) => setFare(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {routeData.start && routeData.end && (
                  <Button
                    onClick={handleSaveRoute}
                    disabled={isSaving || !routeName.trim()}
                    className="flex-1 text-xs md:text-sm"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Guardar
                      </>
                    )}
                  </Button>
                )}
                {(routeData.start || routeData.end || selectedRoute) && (
                  <Button
                    variant="outline"
                    onClick={handleResetRoute}
                    disabled={isCalculating || isSaving}
                    className="p-2"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                )}
              </div>

              {isCalculating && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-xs md:text-sm text-gray-600">
                    Preparando ruta...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="max-h-[350px] md:max-h-[400px] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base md:text-lg lg:text-xl">Rutas Guardadas</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[250px] md:max-h-[300px]">
              {savedRoutes.length === 0 ? (
                <p className="text-xs md:text-sm text-gray-500">No hay rutas guardadas</p>
              ) : (
                <div className="space-y-2">
                  {savedRoutes.map((route) => (
                    <div
                      key={route._id}
                      className={`rounded-lg border p-2 md:p-3 transition-all ${
                        selectedRoute?._id === route._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div 
                          className="flex-1 cursor-pointer min-w-0"
                          onClick={() => handleViewRoute(route)}
                        >
                          <p className="font-medium text-xs md:text-sm truncate">{route.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1 md:gap-2 text-xs text-gray-600">
                            <span>📏 {route.distance.toFixed(2)} km</span>
                            <span>•</span>
                            <span>⏱️ {Math.round(route.duration)} min</span>
                            {route.fare && route.fare > 0 && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">💵 Bs. {route.fare.toFixed(2)}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className={route.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {route.isActive ? '✅ Activa' : '❌ Inactiva'}
                            </span>
                          </div>
                          {route.schedules && route.schedules.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {route.schedules.slice(0, 2).map((schedule, idx) => (
                                <span 
                                  key={idx} 
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                                >
                                  🕐 {schedule}
                                </span>
                              ))}
                              {route.schedules.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{route.schedules.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDeactivateDialog(route)}
                            className="h-7 w-7 md:h-8 md:w-8 p-0"
                            title={route.isActive ? 'Desactivar ruta' : 'Activar ruta'}
                          >
                            <Power className={`h-3 w-3 md:h-4 md:w-4 ${route.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDeleteDialog(route)}
                            className="h-7 w-7 md:h-8 md:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar ruta permanentemente"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base md:text-lg lg:text-xl">Mapa Interactivo - Ciudad Guayana</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <MapComponent 
                onMapClick={handleMapClick} 
                routeData={routeData}
                selectedRoute={selectedRoute}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, routeId: null, routeName: '' })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar ruta permanentemente?"
        description={`Esta acción eliminará permanentemente la ruta "${deleteDialog.routeName}" de la base de datos. Esta acción no se puede deshacer.`}
        type="delete"
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={deactivateDialog.isOpen}
        onClose={() => setDeactivateDialog({ isOpen: false, routeId: null, routeName: '', isActive: false })}
        onConfirm={handleConfirmToggleActive}
        title={deactivateDialog.isActive ? "¿Desactivar ruta?" : "¿Activar ruta?"}
        description={
          deactivateDialog.isActive
            ? `La ruta "${deactivateDialog.routeName}" será desactivada y no estará disponible para los usuarios. Puede reactivarla en cualquier momento.`
            : `La ruta "${deactivateDialog.routeName}" será activada y estará disponible para los usuarios.`
        }
        type="deactivate"
        isLoading={isProcessing}
      />
    </div>
  );
}
