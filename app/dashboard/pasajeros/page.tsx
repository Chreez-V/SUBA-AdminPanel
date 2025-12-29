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

export default function PasajerosPage() {
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pasajeros</h1>
        <p className="text-gray-600">Vista de perfiles de pasajeros registrados</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {passengers.map((passenger) => (
            <Card key={passenger.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{passenger.nombre}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      {passenger.email}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Viajes realizados</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{passenger.viajes}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
