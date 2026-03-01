"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeftRight,
  Loader2,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  TrendingUp,
  Mail,
  User,
  Check,
  X,
  Eye,
  CreditCard,
  Building2,
  ExternalLink,
  Wallet,
} from "lucide-react";
import {
  getPaymentValidations,
  approveRecharge,
  rejectRecharge,
  type PaymentValidation,
} from "@/lib/api/wallet.api";
import { getPassengers, type Passenger } from "@/lib/api/passengers.api";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ── Status configs ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  aprobado: {
    label: "Aprobado",
    icon: CheckCircle,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  rechazado: {
    label: "Rechazado",
    icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

const TYPE_LABELS: Record<string, string> = {
  recarga: "Recarga de saldo",
  pago_tarjeta_nfc: "Pago por tarjeta NFC",
};

type TabKey = "saldos" | "recargas" | "historial";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "saldos", label: "Saldos", icon: Users },
  { key: "recargas", label: "Recargas", icon: Wallet },
  { key: "historial", label: "Historial", icon: TrendingUp },
];

// ── Component ──────────────────────────────────────────────────────────

export default function TransfersManager() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [validations, setValidations] = useState<PaymentValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  // Tab & filters
  const [activeTab, setActiveTab] = useState<TabKey>("saldos");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Recargas – approve / reject
  const [approveDialog, setApproveDialog] = useState<{
    isOpen: boolean;
    validationId: string;
    amount: number;
    userName: string;
  }>({ isOpen: false, validationId: "", amount: 0, userName: "" });

  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    validationId: string;
  }>({ isOpen: false, validationId: "" });
  const [rejectionReason, setRejectionReason] = useState("");

  // Detail expand
  const [detailId, setDetailId] = useState<string | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [passengersData, validationsData] = await Promise.all([
        getPassengers(),
        getPaymentValidations(),
      ]);
      setPassengers(passengersData);
      setValidations(Array.isArray(validationsData) ? validationsData : []);
    } catch (err: any) {
      addToast({
        type: "error",
        message: err.message || "Error cargando datos",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Helpers ──────────────────────────────────────────────────────────

  const getUserName = (userId: PaymentValidation["userId"]): string => {
    if (typeof userId === "object" && userId !== null) {
      return userId.fullName || userId.email || userId._id;
    }
    return String(userId);
  };

  const getUserEmail = (userId: PaymentValidation["userId"]): string => {
    if (typeof userId === "object" && userId !== null) {
      return userId.email || "";
    }
    return "";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Actions ──────────────────────────────────────────────────────────

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await approveRecharge(approveDialog.validationId);
      addToast({
        type: "success",
        message: `Recarga de ${formatCurrency(approveDialog.amount)} aprobada exitosamente`,
      });
      setApproveDialog({ isOpen: false, validationId: "", amount: 0, userName: "" });
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al aprobar la recarga" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.trim().length < 5) {
      addToast({ type: "warning", message: "El motivo de rechazo debe tener al menos 5 caracteres" });
      return;
    }
    try {
      setIsProcessing(true);
      await rejectRecharge(rejectDialog.validationId, rejectionReason.trim());
      addToast({ type: "success", message: "Solicitud de recarga rechazada" });
      setRejectDialog({ isOpen: false, validationId: "" });
      setRejectionReason("");
      await fetchData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al rechazar la recarga" });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Computed ─────────────────────────────────────────────────────────

  const pendingCount = validations.filter((v) => v.status === "pendiente").length;
  const approvedCount = validations.filter((v) => v.status === "aprobado").length;
  const totalApproved = validations.filter((v) => v.status === "aprobado").reduce((s, v) => s + v.monto, 0);
  const totalCredits = passengers.reduce((s, p) => s + (p.credit || 0), 0);

  // Saldos tab – filtered passengers
  const filteredPassengers = passengers
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    })
    .sort((a, b) => (b.credit || 0) - (a.credit || 0));

  // Recargas tab – filtered & status-filtered validations
  const recargasFiltered = validations.filter((v) => {
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        getUserName(v.userId).toLowerCase().includes(q) ||
        getUserEmail(v.userId).toLowerCase().includes(q) ||
        v.referenciaPago.toLowerCase().includes(q) ||
        (v.banco || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Historial tab – all validations sorted by date
  const historialFiltered = validations
    .filter((v) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        getUserName(v.userId).toLowerCase().includes(q) ||
        v.referenciaPago.toLowerCase().includes(q) ||
        (v.banco || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // ── Render ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00457C]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-lg">
            <ArrowLeftRight className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00457C]">
              Transferencias
            </h1>
            <p className="text-sm md:text-base text-gray-700 font-medium">
              Gestión de saldos, recargas y movimientos del sistema
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{passengers.length}</p>
            <p className="text-xs text-gray-500">Pasajeros</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalCredits)}</p>
            <p className="text-xs text-green-600">Saldo total en sistema</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
            <p className="text-xs text-yellow-600">Recargas pendientes</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalApproved)}</p>
            <p className="text-xs text-blue-600">Total aprobado</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg border p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#00457C] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.key === "recargas" && pendingCount > 0 && (
                  <span
                    className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-[#FDB714] text-[#00457C]"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === "saldos"
                      ? "Buscar por nombre o email..."
                      : "Buscar por nombre, referencia o banco..."
                  }
                  className="pl-9"
                />
              </div>
              {activeTab === "recargas" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-full sm:w-48"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobado">Aprobadas</option>
                  <option value="rechazado">Rechazadas</option>
                </select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── Tab: Saldos ──────────────────────────────────────────── */}
        {activeTab === "saldos" &&
          (filteredPassengers.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500 text-sm">
                  {searchQuery ? "Sin resultados para esta búsqueda" : "No hay pasajeros registrados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700">Pasajero</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Email</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Saldo</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPassengers.map((passenger) => (
                      <tr key={passenger._id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00457C]/10">
                              <User className="h-4 w-4 text-[#00457C]" />
                            </div>
                            <span className="font-medium text-gray-900">{passenger.fullName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {passenger.email}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className={`font-bold ${(passenger.credit || 0) > 0 ? "text-green-700" : "text-gray-400"}`}>
                            {formatCurrency(passenger.credit || 0)}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-xs">{formatDate(passenger.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        {/* ─── Tab: Recargas (approve / reject) ─────────────────────── */}
        {activeTab === "recargas" &&
          (recargasFiltered.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500 text-sm">
                  {searchQuery || statusFilter !== "all"
                    ? "Sin resultados con los filtros actuales"
                    : "No hay solicitudes de recarga registradas"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recargasFiltered.map((validation) => {
                const config = STATUS_CONFIG[validation.status] || STATUS_CONFIG.pendiente;
                const StatusIcon = config.icon;
                const isExpanded = detailId === validation._id;

                return (
                  <Card key={validation._id} className={`border ${config.border} ${config.bg} transition-all duration-200`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        {/* Left: info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusIcon className={`h-4 w-4 ${config.color}`} />
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color} ${config.bg} border ${config.border}`}>
                              {config.label}
                            </span>
                            <span className="text-xs text-gray-400">{formatDate(validation.createdAt)}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border shadow-sm">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-lg text-gray-900">{formatCurrency(validation.monto)}</p>
                              <p className="text-xs text-gray-600">{TYPE_LABELS[validation.type] || validation.type}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <CreditCard className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate">
                                <span className="font-medium">Ref:</span> {validation.referenciaPago}
                              </span>
                            </div>
                            {validation.banco && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  <span className="font-medium">Banco:</span> {validation.banco}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Solicitante:</span> {getUserName(validation.userId)}
                            {getUserEmail(validation.userId) && (
                              <span className="text-gray-400 ml-1">({getUserEmail(validation.userId)})</span>
                            )}
                          </div>

                          {validation.rejectionReason && (
                            <div className="bg-red-100 border border-red-200 rounded p-2">
                              <p className="text-xs text-red-700">
                                <span className="font-semibold">Motivo de rechazo:</span> {validation.rejectionReason}
                              </p>
                            </div>
                          )}

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="mt-2 p-3 bg-white rounded-lg border space-y-2">
                              <p className="text-sm font-semibold text-gray-800">Detalles completos</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">ID:</span>{" "}
                                  <span className="font-mono">{validation._id}</span>
                                </div>
                                {validation.fechaPago && (
                                  <div>
                                    <span className="font-medium">Fecha de pago:</span> {formatDate(validation.fechaPago)}
                                  </div>
                                )}
                                {validation.reviewedBy && (
                                  <div>
                                    <span className="font-medium">Revisado por:</span> {validation.reviewedBy}
                                  </div>
                                )}
                                {validation.reviewedAt && (
                                  <div>
                                    <span className="font-medium">Revisado el:</span> {formatDate(validation.reviewedAt)}
                                  </div>
                                )}
                              </div>
                              {validation.comprobanteUrl && (
                                <a
                                  href={validation.comprobanteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Ver comprobante
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: actions */}
                        <div className="flex flex-row md:flex-col gap-2 items-start">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => setDetailId(isExpanded ? null : validation._id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {isExpanded ? "Ocultar" : "Detalles"}
                          </Button>

                          {validation.status === "pendiente" && (
                            <>
                              <Button
                                size="sm"
                                className="text-xs bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  setApproveDialog({
                                    isOpen: true,
                                    validationId: validation._id,
                                    amount: validation.monto,
                                    userName: getUserName(validation.userId),
                                  })
                                }
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() =>
                                  setRejectDialog({ isOpen: true, validationId: validation._id })
                                }
                              >
                                <X className="h-3 w-3 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}

        {/* ─── Tab: Historial ────────────────────────────────────────── */}
        {activeTab === "historial" &&
          (historialFiltered.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500 text-sm">
                  {searchQuery ? "Sin resultados para esta búsqueda" : "No hay recargas registradas"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700">Fecha</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Solicitante</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Referencia</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Banco</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Monto</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialFiltered.map((v) => {
                      const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG.pendiente;
                      return (
                        <tr key={v._id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(v.createdAt)}</td>
                          <td className="p-3 text-gray-900 font-medium">
                            {typeof v.userId === "object" ? v.userId.fullName || v.userId.email || v.userId._id : v.userId}
                          </td>
                          <td className="p-3 text-gray-600 font-mono text-xs">{v.referenciaPago}</td>
                          <td className="p-3 text-gray-600">{v.banco || "—"}</td>
                          <td className="p-3 text-right font-bold text-gray-900">{formatCurrency(v.monto)}</td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.color} ${sc.bg} border ${sc.border}`}>
                              {sc.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────── */}

      {/* Approve confirmation */}
      <ConfirmDialog
        isOpen={approveDialog.isOpen}
        onClose={() => setApproveDialog({ isOpen: false, validationId: "", amount: 0, userName: "" })}
        onConfirm={handleApprove}
        title="Aprobar Recarga"
        description={`¿Confirmas aprobar la recarga de ${formatCurrency(approveDialog.amount)} para ${approveDialog.userName}? El saldo se acreditará inmediatamente.`}
        type="warning"
        isLoading={isProcessing}
      />

      {/* Reject modal */}
      {rejectDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Rechazar Recarga</h3>
                <p className="text-sm text-gray-500">Indica el motivo del rechazo</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Motivo del rechazo</Label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ej: Referencia de pago no verificada, monto incorrecto..."
                  className="w-full border rounded-md p-3 text-sm mt-1 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  minLength={5}
                  maxLength={255}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {rejectionReason.length}/255 caracteres (mínimo 5)
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setRejectDialog({ isOpen: false, validationId: "" });
                    setRejectionReason("");
                  }}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleReject}
                  disabled={isProcessing || rejectionReason.trim().length < 5}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Rechazar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
