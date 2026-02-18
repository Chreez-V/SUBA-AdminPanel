"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save, Trash2, Loader2, X, Power, Search } from "lucide-react";
import {
  getStops,
  createStop,
  deleteStop,
  deactivateStop,
  updateStop,
  type Stop,
} from "@/lib/api/stops.api";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StopLocation {
  lat: number;
  lng: number;
}

// Dynamic import for the map
const StopMapComponent = dynamic<{
  stops: { _id: string; name: string; location: StopLocation; isActive: boolean }[];
  newPin: StopLocation | null;
  onMapClick: (point: StopLocation) => void;
}>(() => import("@/components/dashboard/stop-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] md:h-[400px] lg:h-[600px] items-center justify-center bg-gray-100 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  ),
});

export default function ParadasManager() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [newPin, setNewPin] = useState<StopLocation | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [referenceLabel, setReferenceLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    stopId: string | null;
    stopName: string;
  }>({ isOpen: false, stopId: null, stopName: "" });

  const [toggleDialog, setToggleDialog] = useState<{
    isOpen: boolean;
    stopId: string | null;
    stopName: string;
    isActive: boolean;
  }>({ isOpen: false, stopId: null, stopName: "", isActive: false });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    try {
      const data = await getStops();
      setStops(data);
    } catch (error) {
      console.error("Error loading stops:", error);
      addToast({ type: "error", message: "Error al cargar las paradas" });
    }
  };

  const handleMapClick = (point: StopLocation) => {
    setNewPin(point);
  };

  const handleReset = () => {
    setNewPin(null);
    setName("");
    setDescription("");
    setAddress("");
    setReferenceLabel("");
  };

  const handleSave = async () => {
    if (!newPin || !name.trim()) {
      addToast({
        type: "warning",
        message: "Seleccione un punto en el mapa y escriba el nombre de la parada",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createStop({
        name: name.trim(),
        description: description.trim() || undefined,
        location: newPin,
        address: address.trim() || undefined,
        referenceLabel: referenceLabel.trim() || undefined,
      });
      addToast({ type: "success", message: `Parada "${name}" creada exitosamente` });
      handleReset();
      await loadStops();
    } catch (error: any) {
      addToast({ type: "error", message: error.message || "Error al crear la parada" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.stopId) return;
    setIsProcessing(true);
    try {
      await deleteStop(deleteDialog.stopId);
      addToast({
        type: "success",
        message: `Parada "${deleteDialog.stopName}" eliminada permanentemente`,
      });
      await loadStops();
    } catch (error: any) {
      addToast({ type: "error", message: error.message || "Error al eliminar la parada" });
    } finally {
      setIsProcessing(false);
      setDeleteDialog({ isOpen: false, stopId: null, stopName: "" });
    }
  };

  const handleConfirmToggle = async () => {
    if (!toggleDialog.stopId) return;
    setIsProcessing(true);
    try {
      if (toggleDialog.isActive) {
        await deactivateStop(toggleDialog.stopId);
        addToast({ type: "warning", message: `Parada "${toggleDialog.stopName}" desactivada` });
      } else {
        await updateStop(toggleDialog.stopId, { isActive: true });
        addToast({ type: "success", message: `Parada "${toggleDialog.stopName}" activada` });
      }
      await loadStops();
    } catch (error: any) {
      addToast({ type: "error", message: error.message || "Error al cambiar estado" });
    } finally {
      setIsProcessing(false);
      setToggleDialog({ isOpen: false, stopId: null, stopName: "", isActive: false });
    }
  };

  const filteredStops = stops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 p-4 md:p-6 lg:p-8">

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* ── Left panel ── */}
        <div className="space-y-4 md:space-y-6 lg:col-span-1">
          {/* Create stop card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                Nueva Parada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-indigo-50 p-3 text-xs md:text-sm text-indigo-800">
                <p className="font-medium mb-2">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Haga clic en el mapa donde desea colocar la parada</li>
                  <li>Complete los datos del formulario</li>
                  <li>Presione &quot;Registrar Parada&quot;</li>
                </ol>
              </div>

              {newPin && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Ubicación seleccionada</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {newPin.lat.toFixed(5)}, {newPin.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {newPin && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="stopName" className="text-xs md:text-sm">
                      Nombre de la Parada *
                    </Label>
                    <Input
                      id="stopName"
                      placeholder='Ej: "Av. Atlántico / C.C. Alta Vista"'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stopDesc" className="text-xs md:text-sm">
                      Descripción (opcional)
                    </Label>
                    <Input
                      id="stopDesc"
                      placeholder="Referencia o detalle adicional"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stopAddr" className="text-xs md:text-sm">
                      Dirección (opcional)
                    </Label>
                    <Input
                      id="stopAddr"
                      placeholder="Dirección legible"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stopRef" className="text-xs md:text-sm">
                      Etiqueta de referencia (app SUBA)
                    </Label>
                    <Input
                      id="stopRef"
                      placeholder="Nombre corto para la app"
                      value={referenceLabel}
                      onChange={(e) => setReferenceLabel(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {newPin && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                    className="flex-1 text-xs md:text-sm bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Registrar Parada
                      </>
                    )}
                  </Button>
                )}
                {newPin && (
                  <Button variant="outline" onClick={handleReset} className="p-2">
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Saved stops list */}
          <Card className="max-h-[400px] md:max-h-[450px] overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg lg:text-xl">
                Paradas ({stops.length})
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Buscar parada…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[280px] md:max-h-[320px]">
              {filteredStops.length === 0 ? (
                <p className="text-xs md:text-sm text-gray-500">
                  {stops.length === 0 ? "No hay paradas registradas" : "Sin resultados"}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredStops.map((stop) => (
                    <div
                      key={stop._id}
                      className="rounded-lg border border-gray-200 hover:bg-gray-50 p-2 md:p-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-xs md:text-sm truncate">{stop.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-600">
                            <span>
                              📍 {stop.location.lat.toFixed(4)}, {stop.location.lng.toFixed(4)}
                            </span>
                            <span>•</span>
                            <span
                              className={
                                stop.isActive
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {stop.isActive ? "✅ Activa" : "❌ Inactiva"}
                            </span>
                          </div>
                          {stop.address && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{stop.address}</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setToggleDialog({
                                isOpen: true,
                                stopId: stop._id,
                                stopName: stop.name,
                                isActive: stop.isActive,
                              })
                            }
                            className="h-7 w-7 md:h-8 md:w-8 p-0"
                            title={stop.isActive ? "Desactivar" : "Activar"}
                          >
                            <Power
                              className={`h-3 w-3 md:h-4 md:w-4 ${
                                stop.isActive ? "text-green-600" : "text-gray-400"
                              }`}
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                stopId: stop._id,
                                stopName: stop.name,
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

        {/* ── Map ── */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base md:text-lg lg:text-xl">
                Mapa Interactivo – Paradas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <StopMapComponent
                stops={stops.map((s) => ({
                  _id: s._id,
                  name: s.name,
                  location: s.location,
                  isActive: s.isActive,
                }))}
                newPin={newPin}
                onMapClick={handleMapClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, stopId: null, stopName: "" })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar parada permanentemente?"
        description={`Esta acción eliminará permanentemente la parada "${deleteDialog.stopName}". No se puede deshacer.`}
        type="delete"
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={toggleDialog.isOpen}
        onClose={() =>
          setToggleDialog({ isOpen: false, stopId: null, stopName: "", isActive: false })
        }
        onConfirm={handleConfirmToggle}
        title={toggleDialog.isActive ? "¿Desactivar parada?" : "¿Activar parada?"}
        description={
          toggleDialog.isActive
            ? `La parada "${toggleDialog.stopName}" será desactivada.`
            : `La parada "${toggleDialog.stopName}" será activada.`
        }
        type="deactivate"
        isLoading={isProcessing}
      />
    </div>
  );
}
