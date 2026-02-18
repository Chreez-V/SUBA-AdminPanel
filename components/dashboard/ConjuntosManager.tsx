"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FolderOpen,
  Plus,
  Trash2,
  Loader2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Route as RouteIcon,
  Zap,
  MinusCircle,
} from "lucide-react";
import {
  getRouteSets,
  createRouteSet,
  updateRouteSet,
  addRouteToSet,
  removeRouteFromSet,
  setActiveRouteInSet,
  deleteRouteSet,
  type RouteSet,
} from "@/lib/api/routeSets.api";
import { getRoutes, type Route } from "@/lib/api/routes.api";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ConjuntosManager() {
  const [sets, setSets] = useState<RouteSet[]>([]);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  // Create form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Expanded set for viewing details
  const [expandedSetId, setExpandedSetId] = useState<string | null>(null);

  // Add route dialog
  const [addRouteSetId, setAddRouteSetId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    setId: string;
    setName: string;
  }>({ isOpen: false, setId: "", setName: "" });

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [setsData, routesData] = await Promise.all([
        getRouteSets(),
        getRoutes(),
      ]);
      setSets(setsData);
      setAllRoutes(routesData);
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error cargando datos" });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!name.trim()) {
      addToast({ type: "error", message: "El nombre es obligatorio" });
      return;
    }
    try {
      setIsSaving(true);
      await createRouteSet({ name: name.trim(), description: description.trim() || undefined });
      addToast({ type: "success", message: "Conjunto creado exitosamente" });
      setName("");
      setDescription("");
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al crear el conjunto" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRoute = async () => {
    if (!addRouteSetId || !selectedRouteId) return;
    try {
      setIsProcessing(true);
      await addRouteToSet(addRouteSetId, selectedRouteId);
      addToast({ type: "success", message: "Ruta agregada al conjunto" });
      setAddRouteSetId(null);
      setSelectedRouteId("");
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al agregar ruta" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRoute = async (setId: string, routeId: string) => {
    try {
      setIsProcessing(true);
      await removeRouteFromSet(setId, routeId);
      addToast({ type: "success", message: "Ruta removida del conjunto" });
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al remover ruta" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateRoute = async (setId: string, routeId: string) => {
    try {
      setIsProcessing(true);
      await setActiveRouteInSet(setId, routeId);
      addToast({ type: "success", message: "Ruta activa cambiada exitosamente" });
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al cambiar ruta activa" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await deleteRouteSet(deleteDialog.setId);
      addToast({ type: "success", message: "Conjunto eliminado" });
      setDeleteDialog({ isOpen: false, setId: "", setName: "" });
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al eliminar" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Routes that aren't yet in the target set
  const getAvailableRoutes = (setId: string) => {
    const targetSet = sets.find((s) => s._id === setId);
    if (!targetSet) return allRoutes;
    const inSetIds = new Set(targetSet.routes.map((r: any) => r._id));
    return allRoutes.filter((r) => !inSetIds.has(r._id));
  };

  const filteredSets = sets.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00457C]" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* ── Left: Create form ── */}
        <div className="space-y-4 md:space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <FolderOpen className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                Nuevo Conjunto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-amber-50 p-3 text-xs md:text-sm text-amber-800">
                <p className="font-medium mb-1">¿Qué es un conjunto?</p>
                <p>
                  Un conjunto agrupa rutas alternativas. Solo una ruta del
                  conjunto puede estar activa a la vez. Si una ruta se reporta
                  como intransitable, el admin puede alternar a otra del mismo
                  conjunto.
                </p>
              </div>

              <div>
                <Label htmlFor="set-name" className="text-sm font-medium">
                  Nombre del conjunto *
                </Label>
                <Input
                  id="set-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: UNEG Atlántico"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="set-desc" className="text-sm font-medium">
                  Descripción
                </Label>
                <Input
                  id="set-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={isSaving || !name.trim()}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear Conjunto
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Sets list ── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-base md:text-lg lg:text-xl">
                  Conjuntos registrados ({sets.length})
                </CardTitle>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar conjunto..."
                  className="w-full sm:w-64"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredSets.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  {searchQuery ? "Sin resultados" : "No hay conjuntos registrados"}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredSets.map((s) => {
                    const isExpanded = expandedSetId === s._id;
                    const activeRouteId = s.activeRoute?._id || null;

                    return (
                      <div
                        key={s._id}
                        className="border rounded-lg overflow-hidden"
                      >
                        {/* Header row */}
                        <div
                          className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            setExpandedSetId(isExpanded ? null : s._id)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-sm md:text-base text-gray-900">
                                {s.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {s.routes.length} ruta
                                {s.routes.length !== 1 ? "s" : ""}{" "}
                                {s.description && `· ${s.description}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                s.activeRoute
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {s.activeRoute
                                ? `Activa: ${s.activeRoute.name}`
                                : "Sin ruta activa"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="border-t bg-gray-50 p-3 space-y-3">
                            {/* Routes in this set */}
                            {s.routes.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-2">
                                Este conjunto no tiene rutas asignadas
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {s.routes.map((r: any) => {
                                  const isActive = activeRouteId === r._id;
                                  return (
                                    <div
                                      key={r._id}
                                      className={`flex items-center justify-between p-2 rounded-lg border ${
                                        isActive
                                          ? "border-green-300 bg-green-50"
                                          : "border-gray-200 bg-white"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <RouteIcon
                                          className={`h-4 w-4 ${
                                            isActive
                                              ? "text-green-600"
                                              : "text-gray-400"
                                          }`}
                                        />
                                        <div>
                                          <p className="text-sm font-medium">
                                            {r.name}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {r.distance?.toFixed(2)} km ·{" "}
                                            {r.routeType || "bidirectional"} ·{" "}
                                            {r.status}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {!isActive && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs h-7 text-green-700 border-green-300 hover:bg-green-50"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleActivateRoute(
                                                s._id,
                                                r._id
                                              );
                                            }}
                                            disabled={isProcessing}
                                          >
                                            <Zap className="h-3 w-3 mr-1" />
                                            Activar
                                          </Button>
                                        )}
                                        {isActive && (
                                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                            Activa
                                          </span>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveRoute(s._id, r._id);
                                          }}
                                          disabled={isProcessing}
                                        >
                                          <MinusCircle className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => {
                                  setAddRouteSetId(s._id);
                                  setSelectedRouteId("");
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar ruta
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() =>
                                  setDeleteDialog({
                                    isOpen: true,
                                    setId: s._id,
                                    setName: s.name,
                                  })
                                }
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Eliminar conjunto
                              </Button>
                            </div>

                            {/* Add route inline form */}
                            {addRouteSetId === s._id && (
                              <div className="mt-2 p-3 bg-white rounded-lg border border-amber-200 space-y-2">
                                <Label className="text-xs font-medium">
                                  Seleccionar ruta a agregar
                                </Label>
                                <select
                                  value={selectedRouteId}
                                  onChange={(e) =>
                                    setSelectedRouteId(e.target.value)
                                  }
                                  className="w-full border rounded-md p-2 text-sm"
                                >
                                  <option value="">
                                    -- Seleccione una ruta --
                                  </option>
                                  {getAvailableRoutes(s._id).map((r) => (
                                    <option key={r._id} value={r._id}>
                                      {r.name} ({r.distance.toFixed(2)} km ·{" "}
                                      {r.routeType})
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="text-xs bg-amber-600 hover:bg-amber-700"
                                    disabled={!selectedRouteId || isProcessing}
                                    onClick={handleAddRoute}
                                  >
                                    {isProcessing ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : (
                                      <Plus className="h-3 w-3 mr-1" />
                                    )}
                                    Agregar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs"
                                    onClick={() => setAddRouteSetId(null)}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, setId: "", setName: "" })}
        onConfirm={handleDelete}
        title="Eliminar Conjunto"
        description={`El conjunto "${deleteDialog.setName}" será eliminado permanentemente. Las rutas contenidas no se eliminarán.`}
        type="delete"
        isLoading={isProcessing}
      />
    </div>
  );
}
