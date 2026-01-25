"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Wallet, Calendar, Loader2, Search, Users as UsersIcon, TrendingUp } from "lucide-react";
import { getPassengers, type Passenger } from "@/lib/api/passengers.api";

export default function PasajerosManager() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [filteredPassengers, setFilteredPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPassengers();
  }, []);

  useEffect(() => {
    // Filtrar pasajeros por nombre o email
    if (searchTerm.trim() === "") {
      setFilteredPassengers(passengers);
    } else {
      const filtered = passengers.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPassengers(filtered);
    }
  }, [searchTerm, passengers]);

  const loadPassengers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPassengers();
      setPassengers(data);
      setFilteredPassengers(data);
    } catch (error: any) {
      console.error("Error loading passengers:", error);
      setError(error.message || "Error al cargar los pasajeros");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-lg">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00457C]">Pasajeros</h1>
            <p className="text-sm md:text-base text-gray-700 font-medium">
              {isLoading ? "Cargando..." : `${filteredPassengers.length} pasajero${filteredPassengers.length !== 1 ? 's' : ''} registrado${filteredPassengers.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
         {/* Stats Summary */}
      {!isLoading && !error && passengers.length > 0 && (
        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 py-4">
          <Card className="border-gray-200 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Pasajeros</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-900">{passengers.length}</p>
                </div>
                <UsersIcon className="h-10 w-10 md:h-12 md:w-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
          />
                       
        </div>

      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00457C]" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredPassengers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? "No se encontraron pasajeros" : "No hay pasajeros registrados"}
          </p>
          <p className="text-sm text-gray-500">
            {searchTerm ? "Intenta con otro término de búsqueda" : "Los pasajeros aparecerán aquí cuando se registren"}
          </p>
        </div>
      )}

      {/* Passengers Grid */}
      {!isLoading && !error && filteredPassengers.length > 0 && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPassengers.map((passenger) => (
            <Card 
              key={passenger._id} 
              className="border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 bg-white overflow-hidden"
            >
              <CardHeader className="pb-3 bg-gradient-to-br from-[#00457C]/5 to-[#0066B3]/5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-md flex-shrink-0">
                    <User className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg font-bold text-gray-900 truncate" title={passenger.fullName}>
                      {passenger.fullName}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 mt-1">
                      <Mail className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                      <span className="truncate" title={passenger.email}>{passenger.email}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                {/* Saldo */}
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 md:h-5 md:w-5 text-green-700" />
                    <span className="text-xs md:text-sm font-semibold text-gray-800">Saldo</span>
                  </div>
                  <span className="text-base md:text-lg font-bold text-green-700">
                    {formatCurrency(passenger.credit || 0)}
                  </span>
                </div>

                {/* Fecha de registro */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 rounded-lg p-2.5">
                  <Calendar className="h-4 w-4 text-[#00457C] flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-500 text-xs">Registro</p>
                    <p className="font-semibold text-gray-800">{formatDate(passenger.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


    </div>
  );
}
