"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftRight,
  Loader2,
  Search,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Users,
  TrendingUp,
  Mail,
  User,
  RefreshCw,
} from "lucide-react";
import {
  getPaymentValidations,
  type PaymentValidation,
  type Transaction,
} from "@/lib/api/wallet.api";
import { getPassengers, type Passenger } from "@/lib/api/passengers.api";
import { useToast } from "@/components/ui/toast";

// We'll derive transfer info from PaymentValidation + Passenger data
// The transactions of type 'transferencia_enviada' and 'transferencia_recibida' show P2P transfers

const TRANSACTION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  recarga: {
    label: "Recarga",
    icon: DollarSign,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  transferencia_enviada: {
    label: "Transferencia Enviada",
    icon: ArrowUpRight,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  transferencia_recibida: {
    label: "Transferencia Recibida",
    icon: ArrowDownLeft,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  pago_pasaje_nfc: {
    label: "Pago Pasaje NFC",
    icon: DollarSign,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  pago_pasaje_qr: {
    label: "Pago Pasaje QR",
    icon: DollarSign,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  pago_pasaje_movil: {
    label: "Pago Pasaje Móvil",
    icon: DollarSign,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  retiro: {
    label: "Retiro",
    icon: ArrowUpRight,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  reembolso: {
    label: "Reembolso",
    icon: RefreshCw,
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
  cobro_pasaje: {
    label: "Cobro Pasaje",
    icon: DollarSign,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
};

interface TransferView {
  _id: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  amount: number;
  date: string;
  status: "completada";
}

export default function TransfersManager() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [validations, setValidations] = useState<PaymentValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"passengers" | "recharges">("passengers");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [passengersData, validationsData] = await Promise.all([
        getPassengers(),
        getPaymentValidations(),
      ]);
      setPassengers(passengersData);
      setValidations(validationsData);
    } catch (err: any) {
      addToast({
        type: "error",
        message: err.message || "Error cargando datos de transferencias",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats from approved recharges
  const approvedRecharges = validations.filter((v) => v.status === "aprobado");
  const pendingRecharges = validations.filter((v) => v.status === "pendiente");
  const totalRecharged = approvedRecharges.reduce((sum, v) => sum + v.monto, 0);
  const totalCredits = passengers.reduce((sum, p) => sum + (p.credit || 0), 0);

  // Filter passengers
  const filteredPassengers = passengers.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  // Filter recharges
  const filteredRecharges = validations.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const userName =
      typeof v.userId === "object"
        ? (v.userId.fullName || v.userId.email || "").toLowerCase()
        : "";
    return (
      userName.includes(q) ||
      v.referenciaPago.toLowerCase().includes(q) ||
      (v.banco || "").toLowerCase().includes(q)
    );
  });

  // Sort passengers by credit (highest first)
  const sortedPassengers = [...filteredPassengers].sort(
    (a, b) => (b.credit || 0) - (a.credit || 0)
  );

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
              Resumen de saldos y movimientos del sistema
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
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(totalCredits)}
            </p>
            <p className="text-xs text-green-600">Saldo total en sistema</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(totalRecharged)}
            </p>
            <p className="text-xs text-blue-600">Total recargado</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{pendingRecharges.length}</p>
            <p className="text-xs text-yellow-600">Recargas pendientes</p>
          </div>
        </div>

        {/* View toggle + Search */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    viewMode === "passengers"
                      ? "Buscar por nombre o email..."
                      : "Buscar por nombre, referencia o banco..."
                  }
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "passengers" ? "default" : "outline"}
                  className={
                    viewMode === "passengers"
                      ? "bg-[#00457C] hover:bg-[#003561] text-white"
                      : ""
                  }
                  onClick={() => setViewMode("passengers")}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Saldos
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "recharges" ? "default" : "outline"}
                  className={
                    viewMode === "recharges"
                      ? "bg-[#00457C] hover:bg-[#003561] text-white"
                      : ""
                  }
                  onClick={() => setViewMode("recharges")}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Historial Recargas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on view mode */}
        {viewMode === "passengers" ? (
          // Passengers balance view
          sortedPassengers.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500 text-sm">
                  {searchQuery
                    ? "Sin resultados para esta búsqueda"
                    : "No hay pasajeros registrados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Pasajero
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-right p-3 font-semibold text-gray-700">
                        Saldo
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPassengers.map((passenger) => (
                      <tr
                        key={passenger._id}
                        className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00457C]/10">
                              <User className="h-4 w-4 text-[#00457C]" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {passenger.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {passenger.email}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`font-bold ${
                              (passenger.credit || 0) > 0
                                ? "text-green-700"
                                : "text-gray-400"
                            }`}
                          >
                            {formatCurrency(passenger.credit || 0)}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-xs">
                          {formatDate(passenger.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          // Recharges history view (all statuses)
          filteredRecharges.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500 text-sm">
                  {searchQuery
                    ? "Sin resultados para esta búsqueda"
                    : "No hay recargas registradas"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Fecha
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Solicitante
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Referencia
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Banco
                      </th>
                      <th className="text-right p-3 font-semibold text-gray-700">
                        Monto
                      </th>
                      <th className="text-center p-3 font-semibold text-gray-700">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecharges
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((v) => {
                        const statusConf =
                          STATUS_CONFIG_SMALL[v.status] ||
                          STATUS_CONFIG_SMALL.pendiente;
                        return (
                          <tr
                            key={v._id}
                            className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                              {formatDate(v.createdAt)}
                            </td>
                            <td className="p-3 text-gray-900 font-medium">
                              {typeof v.userId === "object"
                                ? v.userId.fullName || v.userId.email || v.userId._id
                                : v.userId}
                            </td>
                            <td className="p-3 text-gray-600 font-mono text-xs">
                              {v.referenciaPago}
                            </td>
                            <td className="p-3 text-gray-600">
                              {v.banco || "—"}
                            </td>
                            <td className="p-3 text-right font-bold text-gray-900">
                              {formatCurrency(v.monto)}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConf.color} ${statusConf.bg} border ${statusConf.border}`}
                              >
                                {statusConf.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

const STATUS_CONFIG_SMALL: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  pendiente: {
    label: "Pendiente",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  aprobado: {
    label: "Aprobada",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  rechazado: {
    label: "Rechazada",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};
