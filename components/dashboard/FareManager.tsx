"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Coins,
  ArrowUpCircle,
  History
} from "lucide-react";
import { getGeneralFare, createGeneralFare, updateGeneralFare, type BusFare } from "@/lib/api/fare.api";
import { useToast } from "@/components/ui/toast";

export default function FareManager() {
  const [currentFare, setCurrentFare] = useState<BusFare | null>(null);
  const [newFareAmount, setNewFareAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadFare();
  }, []);

  const loadFare = async () => {
    setIsLoading(true);
    try {
      const fare = await getGeneralFare();
      setCurrentFare(fare);
      if (fare) {
        setNewFareAmount(fare.fare.toString());
      }
    } catch (error: any) {
      console.error("Error loading fare:", error);
      addToast({
        type: "error",
        message: error.message || "Error al cargar el pasaje",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFare = async () => {
    const amount = parseFloat(newFareAmount);
    
    if (isNaN(amount) || amount <= 0) {
      addToast({
        type: "warning",
        message: "Por favor ingresa un monto válido mayor a 0",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (currentFare) {
        // Actualizar pasaje existente
        const updated = await updateGeneralFare(currentFare._id, amount);
        setCurrentFare(updated);
        addToast({
          type: "success",
          message: `✅ Pasaje actualizado exitosamente a ${formatCurrency(amount)}`,
        });
      } else {
        // Crear pasaje inicial
        const created = await createGeneralFare(amount);
        setCurrentFare(created);
        addToast({
          type: "success",
          message: `✅ Pasaje creado exitosamente: ${formatCurrency(amount)}`,
        });
      }
    } catch (error: any) {
      console.error("Error saving fare:", error);
      addToast({
        type: "error",
        message: error.message || "Error al guardar el pasaje",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateChangePercentage = () => {
    if (!currentFare) return 0;
    const oldAmount = currentFare.fare;
    const newAmount = parseFloat(newFareAmount);
    if (isNaN(newAmount) || oldAmount === 0) return 0;
    return ((newAmount - oldAmount) / oldAmount) * 100;
  };

  const changePercentage = calculateChangePercentage();
  const hasChanged = currentFare && parseFloat(newFareAmount) !== currentFare.fare;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
          <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-xl">
            <Coins className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00457C]">Gestión de Pasaje</h1>
            <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium">
              Tarifa general del sistema SUBA
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-[#00457C]" />
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <div className="grid gap-4 md:gap-6 lg:gap-8">
          {/* Main Control Panel */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            {/* Current Fare Display */}
            <Card className="border-2 border-[#00457C]/20 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="border-b bg-gradient-to-r from-[#00457C]/5 to-[#0066B3]/5">
                <CardTitle className="flex items-center gap-2 text-[#00457C] text-base md:text-lg lg:text-xl">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
                  Pasaje Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                {currentFare ? (
                  <div className="space-y-4 md:space-y-6">
                    {/* Amount Display */}
                    <div className="text-center p-4 md:p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                      <p className="text-xs md:text-sm font-semibold text-green-700 mb-2">Monto Vigente</p>
                      <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-green-800 break-all">
                        {formatCurrency(currentFare.fare)}
                      </p>
                    </div>

                    {/* Last Update Info */}
                    <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 md:p-3">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 text-[#00457C] flex-shrink-0" />
                      <span className="text-center">Última actualización: {formatDate(currentFare.updatedAt)}</span>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-yellow-500 mx-auto mb-4" />
                    <p className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                      No hay pasaje configurado
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      Establece el primer pasaje del sistema →
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Update Panel */}
            <Card className="border-2 border-[#00457C]/20 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-[#00457C] text-base md:text-lg lg:text-xl">
                  <ArrowUpCircle className="h-5 w-5 md:h-6 md:w-6" />
                  {currentFare ? "Actualizar Pasaje" : "Establecer Pasaje"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6">
                <div className="space-y-4 md:space-y-6">
                  {/* Input Field */}
                  <div className="space-y-2">
                    <Label htmlFor="fareAmount" className="text-sm md:text-base font-semibold text-gray-700">
                      Nuevo Monto (Bs.)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      <Input
                        id="fareAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newFareAmount}
                        onChange={(e) => setNewFareAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-10 md:pl-12 text-xl md:text-2xl h-14 md:h-16 font-bold border-2 focus:border-[#00457C] focus:ring-[#00457C]"
                      />
                    </div>
                  </div>

                  {/* Change Preview */}
                  {hasChanged && (
                    <div className={`p-3 md:p-4 rounded-lg border-2 ${
                      changePercentage > 0 
                        ? 'bg-green-50 border-green-200' 
                        : changePercentage < 0 
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs md:text-sm font-semibold text-gray-700">Cambio:</span>
                        <div className="flex items-center gap-1 md:gap-2">
                          <TrendingUp className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 ${
                            changePercentage > 0 ? 'text-green-600' : 'text-red-600'
                          }`} />
                          <span className={`text-lg md:text-xl font-bold ${
                            changePercentage > 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-2 break-all">
                        {formatCurrency(currentFare!.fare)} → {formatCurrency(parseFloat(newFareAmount))}
                      </p>
                    </div>
                  )}

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveFare}
                    disabled={isSaving || !newFareAmount || parseFloat(newFareAmount) <= 0}
                    className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-[#00457C] to-[#0066B3] hover:from-[#003561] hover:to-[#00457C] shadow-lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        {currentFare ? "Actualizar Pasaje" : "Crear Pasaje"}
                      </>
                    )}
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
