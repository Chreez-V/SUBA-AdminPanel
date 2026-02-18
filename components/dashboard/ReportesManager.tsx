"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Loader2,
  Check,
  X,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ArrowRight,
} from "lucide-react";
import {
  getReports,
  resolveReport,
  deleteReport,
  type Report,
} from "@/lib/api/reports.api";
import { getRoutes, type Route } from "@/lib/api/routes.api";
import { getRouteSets, type RouteSet } from "@/lib/api/routeSets.api";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const REASON_LABELS: Record<string, string> = {
  via_deteriorada: "Vía deteriorada / huecos",
  inundacion: "Inundación / acumulación de agua",
  derrumbe: "Derrumbe / deslizamiento de tierra",
  accidente_vial: "Accidente vial bloqueando la vía",
  obra_en_construccion: "Obra en construcción",
  cierre_policial: "Cierre policial / militar",
  arbol_caido: "Árbol caído / obstrucción",
  falla_semaforo: "Falla de semáforo",
  protesta: "Protesta / manifestación",
  otro: "Otro",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
  },
  approved: {
    label: "Aprobado",
    icon: CheckCircle,
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  rejected: {
    label: "Rechazado",
    icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  resolved: {
    label: "Resuelto",
    icon: Check,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
};

export default function ReportesManager() {
  const [reports, setReports] = useState<Report[]>([]);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [routeSets, setRouteSets] = useState<RouteSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Resolve form
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveStatus, setResolveStatus] = useState<string>("approved");
  const [switchToRouteId, setSwitchToRouteId] = useState<string>("");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    reportId: string;
  }>({ isOpen: false, reportId: "" });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reportsData, routesData, setsData] = await Promise.all([
        getReports(),
        getRoutes(),
        getRouteSets(),
      ]);
      setReports(reportsData);
      setAllRoutes(routesData);
      setRouteSets(setsData);
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error cargando datos" });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find alternative routes for a reported route (from its set)
  const getAlternativeRoutes = (reportedRouteId: string): Route[] => {
    // Find which set contains this route
    const set = routeSets.find((s) =>
      s.routes.some((r: any) => r._id === reportedRouteId)
    );
    if (!set) return [];
    // Return other routes in the set excluding the reported one
    return set.routes
      .filter((r: any) => r._id !== reportedRouteId)
      .map((r: any) => ({
        _id: r._id,
        name: r.name,
        distance: r.distance || 0,
        duration: r.estimatedTime || r.duration || 0,
        geometry: r.geometry,
        routeType: r.routeType || "bidirectional",
        isActive: r.status === "Active",
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })) as Route[];
  };

  const handleResolve = async () => {
    if (!resolveId) return;

    try {
      setIsProcessing(true);
      await resolveReport(resolveId, {
        status: resolveStatus as "approved" | "rejected" | "resolved",
        switchToRouteId: resolveStatus === "approved" && switchToRouteId ? switchToRouteId : undefined,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      addToast({
        type: "success",
        message:
          resolveStatus === "approved"
            ? "Reporte aprobado — ruta desactivada"
            : resolveStatus === "rejected"
            ? "Reporte rechazado"
            : "Reporte resuelto",
      });
      setResolveId(null);
      setResolveStatus("approved");
      setSwitchToRouteId("");
      setResolutionNotes("");
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al resolver reporte" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await deleteReport(deleteDialog.reportId);
      addToast({ type: "success", message: "Reporte eliminado" });
      setDeleteDialog({ isOpen: false, reportId: "" });
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al eliminar reporte" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.route?.name?.toLowerCase().includes(q) ||
        r.driver?.name?.toLowerCase().includes(q) ||
        (REASON_LABELS[r.reason] || r.reason).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00457C]" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="space-y-4 md:space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            <p className="text-xs text-gray-500">Total reportes</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
            <p className="text-xs text-yellow-600">Pendientes</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
            <p className="text-2xl font-bold text-green-700">
              {reports.filter((r) => r.status === "approved").length}
            </p>
            <p className="text-xs text-green-600">Aprobados</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-center">
            <p className="text-2xl font-bold text-red-700">
              {reports.filter((r) => r.status === "rejected").length}
            </p>
            <p className="text-xs text-red-600">Rechazados</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por ruta, conductor o motivo..."
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full sm:w-48"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
                <option value="resolved">Resueltos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Reports list */}
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500 text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Sin resultados con los filtros actuales"
                  : "No hay reportes registrados"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const config = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const isResolving = resolveId === report._id;
              const alternatives = getAlternativeRoutes(report.route?._id);

              // Which set contains this route?
              const parentSet = routeSets.find((s) =>
                s.routes.some((r: any) => r._id === report.route?._id)
              );

              return (
                <Card key={report._id} className={`border ${config.bg}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      {/* Left: report info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusIcon className={`h-4 w-4 ${config.color}`} />
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color} ${config.bg} border`}
                          >
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(report.createdAt).toLocaleString("es-VE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold text-sm md:text-base text-gray-900">
                            <AlertTriangle className="inline h-4 w-4 text-amber-500 mr-1" />
                            Ruta: {report.route?.name || "Desconocida"}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Conductor: {report.driver?.name || "Desconocido"}{" "}
                            {report.driver?.email && (
                              <span className="text-gray-400">
                                ({report.driver.email})
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="bg-white rounded p-2 border">
                          <p className="text-xs font-medium text-gray-700">
                            Motivo:{" "}
                            <span className="font-semibold text-gray-900">
                              {REASON_LABELS[report.reason] || report.reason}
                            </span>
                          </p>
                          {report.reason === "otro" && report.customReason && (
                            <p className="text-xs text-gray-600 mt-1">
                              Detalle: {report.customReason}
                            </p>
                          )}
                          {report.notes && (
                            <p className="text-xs text-gray-600 mt-1">
                              Notas: {report.notes}
                            </p>
                          )}
                        </div>

                        {parentSet && (
                          <p className="text-xs text-amber-700">
                            Conjunto:{" "}
                            <span className="font-semibold">
                              {parentSet.name}
                            </span>{" "}
                            ({alternatives.length} alternativa
                            {alternatives.length !== 1 ? "s" : ""} disponible
                            {alternatives.length !== 1 ? "s" : ""})
                          </p>
                        )}

                        {report.switchedToRoute && (
                          <p className="text-xs text-green-700 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            Alternada a:{" "}
                            <span className="font-semibold">
                              {report.switchedToRoute.name}
                            </span>
                          </p>
                        )}

                        {report.resolutionNotes && (
                          <p className="text-xs text-gray-600 italic">
                            Resolución: {report.resolutionNotes}
                          </p>
                        )}
                      </div>

                      {/* Right: actions */}
                      <div className="flex flex-row md:flex-col gap-2 items-start">
                        {report.status === "pending" && (
                          <Button
                            size="sm"
                            className="text-xs bg-[#00457C] hover:bg-[#003561]"
                            onClick={() => {
                              setResolveId(report._id);
                              setResolveStatus("approved");
                              setSwitchToRouteId("");
                              setResolutionNotes("");
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Resolver
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              reportId: report._id,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    {/* Resolve inline form */}
                    {isResolving && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 space-y-3">
                        <p className="text-sm font-semibold text-gray-800">
                          Resolver reporte
                        </p>

                        <div>
                          <Label className="text-xs font-medium">Acción</Label>
                          <select
                            value={resolveStatus}
                            onChange={(e) => setResolveStatus(e.target.value)}
                            className="w-full border rounded-md p-2 text-sm mt-1"
                          >
                            <option value="approved">
                              Aprobar (desactivar ruta)
                            </option>
                            <option value="rejected">
                              Rechazar (mantener ruta activa)
                            </option>
                            <option value="resolved">
                              Marcar como resuelto
                            </option>
                          </select>
                        </div>

                        {resolveStatus === "approved" &&
                          alternatives.length > 0 && (
                            <div>
                              <Label className="text-xs font-medium">
                                Alternar a ruta alternativa (opcional)
                              </Label>
                              <select
                                value={switchToRouteId}
                                onChange={(e) =>
                                  setSwitchToRouteId(e.target.value)
                                }
                                className="w-full border rounded-md p-2 text-sm mt-1"
                              >
                                <option value="">
                                  -- Solo desactivar, sin alternar --
                                </option>
                                {alternatives.map((alt) => (
                                  <option key={alt._id} value={alt._id}>
                                    {alt.name} ({alt.distance?.toFixed(2)} km)
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                        <div>
                          <Label className="text-xs font-medium">
                            Notas de resolución
                          </Label>
                          <Input
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Comentario del administrador..."
                            className="mt-1"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="text-xs bg-[#00457C] hover:bg-[#003561]"
                            disabled={isProcessing}
                            onClick={handleResolve}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                            onClick={() => setResolveId(null)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, reportId: "" })}
        onConfirm={handleDelete}
        title="Eliminar Reporte"
        description="El reporte será eliminado permanentemente. Esta acción no se puede deshacer."
        type="delete"
        isLoading={isProcessing}
      />
    </div>
  );
}
