"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, TrendingUp, DollarSign, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data para gráficos
const viajesData = [
  { mes: "Ene", viajes: 450 },
  { mes: "Feb", viajes: 520 },
  { mes: "Mar", viajes: 480 },
  { mes: "Abr", viajes: 620 },
  { mes: "May", viajes: 580 },
  { mes: "Jun", viajes: 750 },
];

const rutasData = [
  { ruta: "Centro-Unare", viajes: 340 },
  { ruta: "Alta Vista-Centro", viajes: 280 },
  { ruta: "Chirica-Puerto", viajes: 220 },
  { ruta: "UD4-Centro", viajes: 190 },
  { ruta: "Castillito-Centro", viajes: 160 },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Panel de control - Ciudad Guayana, Venezuela</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Buses Activos"
          value="24"
          icon={Bus}
          trend="+3 esta semana"
          trendUp={true}
        />
        <StatCard
          title="Viajes Hoy"
          value="156"
          icon={Activity}
          trend="+12% vs ayer"
          trendUp={true}
        />
        <StatCard
          title="Ingresos Hoy"
          icon={DollarSign}
          value="Bs. 12,450"
          trend="+8% vs promedio"
          trendUp={true}
        />
        <StatCard
          title="Rutas Activas"
          value="8"
          icon={TrendingUp}
          trend="2 nuevas este mes"
          trendUp={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Viajes Realizados */}
        <Card>
          <CardHeader>
            <CardTitle>Viajes Realizados (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={viajesData}>
                <defs>
                  <linearGradient id="colorViajes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="viajes"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViajes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rutas Más Transitadas */}
        <Card>
          <CardHeader>
            <CardTitle>Rutas Más Transitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rutasData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="ruta" type="category" width={120} stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="viajes" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
