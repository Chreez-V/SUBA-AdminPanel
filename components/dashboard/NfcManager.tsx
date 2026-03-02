"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  CreditCard,
  Search,
  Loader2,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  getNfcSolicitudes,
  getNfcUsuarios,
  aprobarNfcSolicitud,
  rechazarNfcSolicitud,
  type NfcSolicitud,
  type NfcUsuario,
} from "@/lib/api/nfc.api";

type TabType = "solicitudes" | "usuarios";

// ── Helpers ────────────────────────────────────────────────────────────

const statusLabels: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  pendiente_revision: "Pendiente de revisión",
  aprobada: "Aprobada",
  vinculada: "Vinculada",
  rechazada: "Rechazada",
};

const nfcStatusLabels: Record<string, string> = {
  none: "Sin solicitud",
  pending_payment: "Pendiente de pago",
  pending_review: "Pendiente de revisión",
  approved: "Aprobada",
  active: "NFC Activo",
  rejected: "Rechazada",
};

function getStatusColor(status: string) {
  switch (status) {
    case "pendiente_pago":
    case "pending_payment":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "pendiente_revision":
    case "pending_review":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "aprobada":
    case "approved":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "vinculada":
    case "active":
      return "bg-green-100 text-green-800 border-green-300";
    case "rechazada":
    case "rejected":
      return "bg-red-100 text-red-800 border-red-300";
    case "none":
      return "bg-gray-100 text-gray-600 border-gray-300";
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pendiente_pago":
    case "pending_payment":
      return <Clock className="h-3.5 w-3.5" />;
    case "pendiente_revision":
    case "pending_review":
      return <AlertTriangle className="h-3.5 w-3.5" />;
    case "aprobada":
    case "approved":
      return <CheckCircle className="h-3.5 w-3.5" />;
    case "vinculada":
    case "active":
      return <Shield className="h-3.5 w-3.5" />;
    case "rechazada":
    case "rejected":
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function getUserName(solicitud: NfcSolicitud): string {
  if (typeof solicitud.userId === "object" && solicitud.userId !== null) {
    return solicitud.userId.fullName;
  }
  return String(solicitud.userId);
}

function getUserEmail(solicitud: NfcSolicitud): string {
  if (typeof solicitud.userId === "object" && solicitud.userId !== null) {
    return solicitud.userId.email;
  }
  return "";
}

// ── Component ──────────────────────────────────────────────────────────

export default function NfcManager() {
  const { addToast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>("solicitudes");
  const [solicitudes, setSolicitudes] = useState<NfcSolicitud[]>([]);
  const [usuarios, setUsuarios] = useState<NfcUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Dialogs
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
  const [rejectionReason, setRejectionReason] = useState("");

  // Filter for users tab
  const [nfcFilter, setNfcFilter] = useState<"all" | "active" | "none" | "pending">("all");

  // ── Data loading ───────────────────────────────────────────────────

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "solicitudes") {
        const data = await getNfcSolicitudes();
        setSolicitudes(data);
      } else {
        const data = await getNfcUsuarios();
        setUsuarios(data);
      }
    } catch (err: any) {
      console.error("Error loading NFC data:", err);
      setError(err.message || "Error al cargar los datos");
      addToast({ type: "error", message: err.message || "Error al cargar datos NFC" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Actions ────────────────────────────────────────────────────────

  const handleApprove = async () => {
    setProcessingId(approveDialog.id);
    try {
      await aprobarNfcSolicitud(approveDialog.id);
      addToast({ type: "success", message: `Solicitud de ${approveDialog.name} aprobada exitosamente` });
      setApproveDialog({ open: false, id: "", name: "" });
      loadData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al aprobar la solicitud" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      addToast({ type: "warning", message: "El motivo de rechazo debe tener al menos 5 caracteres" });
      return;
    }
    setProcessingId(rejectDialog.id);
    try {
      await rechazarNfcSolicitud(rejectDialog.id, rejectionReason);
      addToast({ type: "success", message: `Solicitud de ${rejectDialog.name} rechazada` });
      setRejectDialog({ open: false, id: "", name: "" });
      setRejectionReason("");
      loadData();
    } catch (err: any) {
      addToast({ type: "error", message: err.message || "Error al rechazar la solicitud" });
    } finally {
      setProcessingId(null);
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────

  const filteredSolicitudes = solicitudes.filter((s) => {
    const name = getUserName(s).toLowerCase();
    const email = getUserEmail(s).toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const filteredUsuarios = usuarios.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (nfcFilter === "all") return matchSearch;
    if (nfcFilter === "active") return matchSearch && u.nfcStatus === "active";
    if (nfcFilter === "none") return matchSearch && (u.nfcStatus === "none" || u.nfcStatus === "rejected");
    if (nfcFilter === "pending") return matchSearch && ["pending_payment", "pending_review", "approved"].includes(u.nfcStatus);
    return matchSearch;
  });

  // ── Stats ──────────────────────────────────────────────────────────

  const pendingCount = solicitudes.filter((s) => s.status === "pendiente_revision").length;
  const approvedCount = solicitudes.filter((s) => s.status === "aprobada" || s.status === "vinculada").length;
  const activeUsersCount = usuarios.filter((u) => u.nfcStatus === "active").length;

  // ── Format helpers ─────────────────────────────────────────────────

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00457C]">Tarjetas NFC</h1>
            <p className="text-sm md:text-base text-gray-700 font-medium">
              Gestión de solicitudes y tarjetas NFC
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
        <Card className="border-orange-200 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Pendientes</p>
                <p className="text-2xl md:text-3xl font-bold text-orange-900">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 md:h-12 md:w-12 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Aprobadas / Vinculadas</p>
                <p className="text-2xl md:text-3xl font-bold text-green-900">{approvedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 md:h-12 md:w-12 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Usuarios con NFC activo</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-900">{activeUsersCount}</p>
              </div>
              <Shield className="h-10 w-10 md:h-12 md:w-12 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab("solicitudes"); setSearchTerm(""); }}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === "solicitudes"
              ? "bg-[#00457C] text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Solicitudes
            {pendingCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </div>
        </button>
        <button
          onClick={() => { setActiveTab("usuarios"); setSearchTerm(""); }}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === "usuarios"
              ? "bg-[#00457C] text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Usuarios NFC
          </div>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
          />
        </div>
        {activeTab === "usuarios" && (
          <div className="flex gap-2 flex-wrap">
            {(["all", "active", "pending", "none"] as const).map((filter) => {
              const labels = { all: "Todos", active: "Con NFC", pending: "En proceso", none: "Sin NFC" };
              return (
                <button
                  key={filter}
                  onClick={() => setNfcFilter(filter)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    nfcFilter === filter
                      ? "bg-[#00457C] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00457C]" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: SOLICITUDES                                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {activeTab === "solicitudes" && !isLoading && !error && (
        <>
          {filteredSolicitudes.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? "No se encontraron solicitudes" : "No hay solicitudes registradas"}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm ? "Intenta con otro término" : "Las solicitudes aparecerán aquí cuando los pasajeros las realicen"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSolicitudes.map((solicitud) => (
                <Card key={solicitud._id} className="border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 bg-white">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* User info */}
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-md flex-shrink-0">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base truncate">{getUserName(solicitud)}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-0.5">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{getUserEmail(solicitud)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(solicitud.status)}`}>
                              {getStatusIcon(solicitud.status)}
                              {statusLabels[solicitud.status] || solicitud.status}
                            </div>
                            <span className="text-xs text-gray-500">
                              Monto: Bs. {solicitud.emissionAmount}
                            </span>
                          </div>
                          {solicitud.rejectionReason && (
                            <p className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                              Motivo: {solicitud.rejectionReason}
                            </p>
                          )}
                          {solicitud.linkedCardUid && (
                            <p className="mt-1 text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                              Tarjeta vinculada: {solicitud.linkedCardUid}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date + Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(solicitud.createdAt)}
                        </div>

                        {solicitud.status === "pendiente_revision" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setApproveDialog({ open: true, id: solicitud._id, name: getUserName(solicitud) })}
                              disabled={processingId === solicitud._id}
                              className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => setRejectDialog({ open: true, id: solicitud._id, name: getUserName(solicitud) })}
                              disabled={processingId === solicitud._id}
                              className="h-9 px-3 border-2 border-red-300 bg-white text-red-600 hover:bg-red-50 text-xs"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: USUARIOS NFC                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {activeTab === "usuarios" && !isLoading && !error && (
        <>
          {filteredUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUsuarios.map((usuario) => (
                <Card
                  key={usuario._id}
                  className="border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 bg-white overflow-hidden"
                >
                  <CardHeader className="pb-3 bg-gradient-to-br from-[#00457C]/5 to-[#0066B3]/5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-md flex-shrink-0">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-bold text-gray-900 truncate" title={usuario.fullName}>
                          {usuario.fullName}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate" title={usuario.email}>{usuario.email}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3">
                    {/* NFC Status */}
                    <div className={`flex items-center gap-2 rounded-lg border p-3 ${getStatusColor(usuario.nfcStatus)}`}>
                      {getStatusIcon(usuario.nfcStatus) || <CreditCard className="h-4 w-4" />}
                      <span className="text-sm font-semibold">
                        {nfcStatusLabels[usuario.nfcStatus] || usuario.nfcStatus}
                      </span>
                    </div>

                    {/* Extra info */}
                    {usuario.cedula && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
                        <Shield className="h-4 w-4 text-[#00457C] flex-shrink-0" />
                        <span className="font-semibold">{usuario.cedula}</span>
                      </div>
                    )}
                    {usuario.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
                        <Phone className="h-4 w-4 text-[#00457C] flex-shrink-0" />
                        <span className="font-semibold">{usuario.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
                      <Calendar className="h-4 w-4 text-[#00457C] flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-500 text-xs">Registro</p>
                        <p className="font-semibold text-gray-800">{formatDate(usuario.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DIALOGS                                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={approveDialog.open}
        onClose={() => setApproveDialog({ open: false, id: "", name: "" })}
        onConfirm={handleApprove}
        title="Aprobar solicitud NFC"
        description={`¿Estás seguro de aprobar la solicitud de tarjeta NFC de ${approveDialog.name}? El usuario podrá vincular su tarjeta física después de la aprobación.`}
        type="approve"
        isLoading={!!processingId}
      />

      {/* Reject Dialog (custom with reason input) */}
      {rejectDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setRejectDialog({ open: false, id: "", name: "" }); setRejectionReason(""); }} />
          <div className="relative z-50 w-full max-w-md mx-4">
            <Card className="shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <XCircle className="h-5 w-5" />
                  Rechazar solicitud
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-gray-700">
                  ¿Estás seguro de rechazar la solicitud de <strong>{rejectDialog.name}</strong>?
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo del rechazo *
                  </label>
                  <Input
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ej: Referencia de pago no verificable..."
                    className="border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 5 caracteres</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    onClick={() => { setRejectDialog({ open: false, id: "", name: "" }); setRejectionReason(""); }}
                    disabled={!!processingId}
                    className="border-2 border-[#00457C] bg-white text-[#00457C] hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={!!processingId || rejectionReason.trim().length < 5}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
