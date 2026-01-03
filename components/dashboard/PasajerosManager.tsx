"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, TrendingUp, Loader2 } from "lucide-react";
import { getPassengers } from "@/lib/api";

interface Passenger {
  id: string;
  nombre: string;
  email: string;
  viajes: number;
}

export default function PasajerosManager() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    setIsLoading(true);
    try {
      const data = await getPassengers();
      setPassengers(data);
    } catch (error) {
      console.error("Error loading passengers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#00457C]">Pasajeros</h1>
        <p className="text-gray-700 font-medium mt-1">Vista de perfiles de pasajeros registrados</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00457C]" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {passengers.map((passenger) => (
            <Card key={passenger.id} className="border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-md">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">{passenger.nombre}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                      <Mail className="h-3.5 w-3.5" />
                      {passenger.email}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#00457C]" />
                    <span className="text-sm font-semibold text-gray-800">Viajes realizados</span>
                  </div>
                  <span className="text-2xl font-bold text-[#00457C]">{passenger.viajes}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
