"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Save,
  Trash2,
  Loader2,
  Navigation,
  X,
  Power,
  Undo2,
  RotateCcw,
} from "lucide-react";
import {
  getRoutes,
  createRouteFromStops,
  deleteRoute,
  deactivateRoute,
  updateRoute,
  calculateEdge,
  type Route,
  type EdgePayload,
} from "@/lib/api/routes.api";
import { getActiveStops, type Stop } from "@/lib/api/stops.api";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// Dynamic import for the route builder map
const RouteBuilderMap = dynamic<{
  stops: { _id: string; name: string; location: { lat: number; lng: number } }[];
  selectedStopIds: string[];
  edges: EdgePayload[];
  onStopClick: (stopId: string) => void;
  viewingRoute?: {
    _id: string;
    name: string;
    geometry: any;
    distance: number;
    duration: number;
    routeType: "circular" | "bidirectional";
    isActive: boolean;
    stops?: any[];
  } | null;
}>(() => import("@/components/dashboard/route-builder-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] md:h-[400px] lg:h-[600px] items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
});

export default function RutasManager() {
  // ── Available stops ──
  const [stops, setStops] = useState<Stop[]>([]);

  // ── Route builder state ──
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);
  const [edges, setEdges] = useState<EdgePayload[]>([]);
  const [routeName, setRouteName] = useState("");
  const [isCalculatingEdge, setIsCalculatingEdge] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [routeType, setRouteType] = useState<"circular" | "bidirectional" | null>(null);

  // ── Saved routes ──
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // ── Dialogs ──
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    routeId: string | null;
    routeName: string;
  }>({ isOpen: false, routeId: null, routeName: "" });

  const [deactivateDialog, setDeactivateDialog] = useState<{
    isOpen: boolean;
    routeId: string | null;
    routeName: string;
    isActive: boolean;
  }>({ isOpen: false, routeId: null, routeName: "", isActive: false });

  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  // ── Load initial data ──
  useEffect(() => {
    loadStops();
    loadRoutes();
  }, []);

  const loadStops = async () => {
    try {
      const data = await getActiveStops();
      setStops(data);
    } catch (error) {
      console.error("Error loading stops:", error);
      addToast({ type: "error", message: "Error al cargar las paradas" });
    }
  };

  const loadRoutes = async () => {
    try {
      const data = await getRoutes();
      setSavedRoutes(data);
    } catch (error) {
      console.error("Error loading routes:", error);
      addToast({ type: "error", message: "Error al cargar las rutas" });
    }
  };

  // ── Total distance & duration ──
  const totalDistance = edges.reduce((sum, e) => sum + e.distance, 0);
  const totalDuration = edges.reduce((sum, e) => sum + e.duration, 0);

  // ── Stop click handler (core of the route builder) ──
  const handleStopClick = useCallback(
    async (stopId: string) => {
      // If viewing a route, ignore clicks
      if (selectedRoute) return;

      // If this is the first stop
      if (selectedStopIds.length === 0) {
        setSelectedStopIds([stopId]);
        setRouteType(null);
        return;
      }

      const lastStopId = selectedStopIds[selectedStopIds.length - 1];

      // Don't allow clicking the same stop twice in a row
      if (stopId === lastStopId) return;

      // If clicking the first stop again → close as circular
      if (stopId === selectedStopIds[0] && selectedStopIds.length >= 2) {
        setIsCalculatingEdge(true);
        try {
          const edge = await calculateEdge(lastStopId, stopId);
          setEdges((prev) => [...prev, edge]);
          setSelectedStopIds((prev) => [...prev, stopId]);
          setRouteType("circular");
          addToast({
            type: "success",
            message: "Ruta cerrada como circular. Asigne un nombre y guárdela.",
          });
        } catch (err: any) {
          addToast({ type: "error", message: err.message || "Error al calcular arista" });
        } finally {
          setIsCalculatingEdge(false);
        }
        return;
      }

      // If already closed, don't allow more clicks
      if (routeType === "circular") return;

      // Normal case: add next stop (duplicates allowed — e.g. A-B-C-D-C-F-G-A)
      setIsCalculatingEdge(true);
      try {
        const edge = await calculateEdge(lastStopId, stopId);
        setEdges((prev) => [...prev, edge]);
        setSelectedStopIds((prev) => [...prev, stopId]);
      } catch (err: any) {
        addToast({ type: "error", message: err.message || "Error al calcular arista" });
      } finally {
        setIsCalculatingEdge(false);
      }
    },
    [selectedStopIds, selectedRoute, routeType, addToast]
  );

  // ── Undo last stop ──
  const handleUndo = () => {
    if (selectedStopIds.length <= 1) {
      handleReset();
      return;
    }
    setSelectedStopIds((prev) => prev.slice(0, -1));
    setEdges((prev) => prev.slice(0, -1));
    if (routeType === "circular") setRouteType(null);
  };

  // ── Reset builder ──
  const handleReset = () => {
    setSelectedStopIds([]);
    setEdges([]);
    setRouteName("");
    setRouteType(null);
    setSelectedRoute(null);
  };

  // ── Save route ──
  const handleSaveRoute = async () => {
    if (selectedStopIds.length < 2 || edges.length === 0) {
      addToast({ type: "warning", message: "Seleccione al menos 2 paradas" });
      return;
    }
    if (!routeName.trim()) {
      addToast({ type: "warning", message: "Asigne un nombre a la ruta" });
      return;
    }

    const finalType = routeType || "bidirectional";

    setIsSaving(true);
    try {
      await createRouteFromStops({
        name: routeName.trim(),
        stopIds: selectedStopIds,
        edges,
        routeType: finalType,
      });

      addToast({
        type: "success",
        message: `Ruta "${routeName}" creada como ${finalType === "circular" ? "circular" : "bidireccional"}`,
      });
      handleReset();
      await loadRoutes();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al guardar la ruta" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── View saved route on map ──
  const handleViewRoute = (r: Route) => {
    setSelectedRoute(r);
    // Clear builder state
    setSelectedStopIds([]);
    setEdges([]);
    setRouteName("");
    setRouteType(null);
  };

  // ── Delete / deactivate handlers ──
  const handleConfirmDelete = async () => {
    if (!deleteDialog.routeId) return;
    setIsProcessing(true);
    try {
      await deleteRoute(deleteDialog.routeId);
      addToast({
        type: "success",
        message: `Ruta "${deleteDialog.routeName}" eliminada permanentemente`,
      });
      await loadRoutes();
      if (selectedRoute?._id === deleteDialog.routeId) setSelectedRoute(null);
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al eliminar la ruta" });
    } finally {
      setIsProcessing(false);
      setDeleteDialog({ isOpen: false, routeId: null, routeName: "" });
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!deactivateDialog.routeId) return;
    setIsProcessing(true);
    try {
      if (deactivateDialog.isActive) {
        await deactivateRoute(deactivateDialog.routeId);
        addToast({ type: "warning", message: `Ruta "${deactivateDialog.routeName}" desactivada` });
      } else {
        await updateRoute(deactivateDialog.routeId, { isActive: true });
        addToast({ type: "success", message: `Ruta "${deactivateDialog.routeName}" activada` });
      }
      await loadRoutes();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al cambiar estado" });
    } finally {
      setIsProcessing(false);
      setDeactivateDialog({ isOpen: false, routeId: null, routeName: "", isActive: false });
    }
  };

  // ── Derive stop names for display ──
  const stopNameById = (id: string) => stops.find((s) => s._id === id)?.name || id.slice(-6);

  return (
    <div className="bg-gray-50 p-4 md:p-6 lg:p-8">

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* ── Left panel ── */}
        <div className="space-y-4 md:space-y-6 lg:col-span-1">
          {/* Route builder card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <Navigation className="h-4 w-4 md:h-5 md:w-5" />
                Construir Ruta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-3 text-xs md:text-sm text-blue-800">
                <p className="font-medium mb-2">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Haga clic en una parada para iniciar</li>
                  <li>Haga clic en la siguiente parada para trazar arista</li>
                  <li>
                    Repita hasta completar la ruta
                  </li>
                  <li>
                    <strong>Circular:</strong> clickee la primera parada de nuevo
                  </li>
                  <li>
                    <strong>Bidireccional:</strong> simplemente guarde sin cerrar
                  </li>
                </ol>
              </div>

              {/* Selected stops summary */}
              {selectedStopIds.length > 0 && (
                <div className="rounded-lg border border-gray-200 p-3 space-y-1.5">
                  <p className="font-medium text-xs md:text-sm text-gray-700 mb-1">
                    Paradas seleccionadas ({selectedStopIds.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedStopIds.map((id, i) => (
                      <span
                        key={`${id}-${i}`}
                        className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${
                          i === 0
                            ? "bg-green-100 border-green-300 text-green-800"
                            : routeType === "circular" && i === selectedStopIds.length - 1
                            ? "bg-green-100 border-green-300 text-green-800"
                            : "bg-blue-100 border-blue-300 text-blue-800"
                        }`}
                      >
                        {i + 1}. {stopNameById(id)}
                      </span>
                    ))}
                  </div>
                  {edges.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 flex gap-3">
                      <span>📏 {totalDistance.toFixed(2)} km</span>
                      <span>⏱️ {Math.round(totalDuration)} min</span>
                    </div>
                  )}
                  {routeType && (
                    <div className="mt-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          routeType === "circular"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        🔄 {routeType === "circular" ? "Circular" : "Bidireccional"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Route name input (show when we have 2+ stops) */}
              {selectedStopIds.length >= 2 && (
                <div>
                  <Label htmlFor="routeName" className="text-xs md:text-sm">
                    Nombre de la Ruta
                  </Label>
                  <Input
                    id="routeName"
                    placeholder="Ej: Centro – Unare – Alta Vista"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedStopIds.length >= 2 && !routeType && (
                  <Button
                    onClick={() => {
                      setRouteType("bidirectional");
                    }}
                    variant="outline"
                    className="text-xs md:text-sm border-sky-300 text-sky-700 hover:bg-sky-50"
                    disabled={isCalculatingEdge}
                  >
                    Marcar Bidireccional
                  </Button>
                )}

                {selectedStopIds.length >= 2 && (
                  <Button
                    onClick={handleSaveRoute}
                    disabled={isSaving || isCalculatingEdge || !routeName.trim()}
                    className="flex-1 text-xs md:text-sm"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Registrar Ruta
                      </>
                    )}
                  </Button>
                )}

                {selectedStopIds.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleUndo}
                    disabled={isCalculatingEdge || isSaving}
                    className="p-2"
                    title="Deshacer última parada"
                  >
                    <Undo2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                )}

                {(selectedStopIds.length > 0 || selectedRoute) && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isCalculatingEdge || isSaving}
                    className="p-2"
                    title="Reiniciar"
                  >
                    <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                )}
              </div>

              {isCalculatingEdge && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-xs md:text-sm text-gray-600">
                    Calculando arista OSRM…
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved routes list */}
          <Card className="max-h-[350px] md:max-h-[400px] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base md:text-lg lg:text-xl">
                Rutas Guardadas ({savedRoutes.length})
              </CardTitle>
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
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
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
                            <span>•</span>
                            <span
                              className={`font-semibold ${
                                route.routeType === "circular"
                                  ? "text-emerald-600"
                                  : "text-sky-600"
                              }`}
                            >
                              🔄 {route.routeType === "circular" ? "Circular" : "Bidirec."}
                            </span>
                            <span>•</span>
                            <span
                              className={
                                route.isActive
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {route.isActive ? "✅ Activa" : "❌ Inactiva"}
                            </span>
                          </div>
                          {route.stops && route.stops.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Paradas: {route.stops.map((s: any) => s.name || "?").join(" → ")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDeactivateDialog({
                                isOpen: true,
                                routeId: route._id,
                                routeName: route.name,
                                isActive: route.isActive,
                              })
                            }
                            className="h-7 w-7 md:h-8 md:w-8 p-0"
                            title={route.isActive ? "Desactivar" : "Activar"}
                          >
                            <Power
                              className={`h-3 w-3 md:h-4 md:w-4 ${
                                route.isActive ? "text-green-600" : "text-gray-400"
                              }`}
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                routeId: route._id,
                                routeName: route.name,
                              })
                            }
                            className="h-7 w-7 md:h-8 md:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar permanentemente"
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

        {/* ── Map (2/3 width on desktop) ── */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base md:text-lg lg:text-xl">
                Mapa Interactivo — Constructor de Rutas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <RouteBuilderMap
                stops={stops.map((s) => ({
                  _id: s._id,
                  name: s.name,
                  location: s.location,
                }))}
                selectedStopIds={selectedStopIds}
                edges={edges}
                onStopClick={handleStopClick}
                viewingRoute={
                  selectedRoute
                    ? {
                        _id: selectedRoute._id,
                        name: selectedRoute.name,
                        geometry: selectedRoute.geometry,
                        distance: selectedRoute.distance,
                        duration: selectedRoute.duration,
                        routeType: selectedRoute.routeType,
                        isActive: selectedRoute.isActive,
                        stops: selectedRoute.stops,
                      }
                    : null
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, routeId: null, routeName: "" })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar ruta permanentemente?"
        description={`Esta acción eliminará permanentemente la ruta "${deleteDialog.routeName}" de la base de datos. No se puede deshacer.`}
        type="delete"
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={deactivateDialog.isOpen}
        onClose={() =>
          setDeactivateDialog({ isOpen: false, routeId: null, routeName: "", isActive: false })
        }
        onConfirm={handleConfirmToggleActive}
        title={deactivateDialog.isActive ? "¿Desactivar ruta?" : "¿Activar ruta?"}
        description={
          deactivateDialog.isActive
            ? `La ruta "${deactivateDialog.routeName}" será desactivada y no estará disponible.`
            : `La ruta "${deactivateDialog.routeName}" será activada.`
        }
        type="deactivate"
        isLoading={isProcessing}
      />
    </div>
  );
}
