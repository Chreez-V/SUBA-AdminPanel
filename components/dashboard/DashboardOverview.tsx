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

export default function DashboardOverview() {
  return (
    <div className="p-8 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#00457C]">Dashboard Overview</h1>
        <p className="text-gray-700 font-medium mt-1">Panel de control - Ciudad Guayana, Venezuela</p>
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
        <Card className="border-gray-200 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#00457C]">
              Viajes Realizados (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={viajesData}>
                <defs>
                  <linearGradient id="colorViajes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00457C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00457C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="mes" stroke="#4B5563" style={{ fontSize: '12px', fontWeight: 600 }} />
                <YAxis stroke="#4B5563" style={{ fontSize: '12px', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="viajes"
                  stroke="#00457C"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViajes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rutas Más Transitadas */}
        <Card className="border-gray-200 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#00457C]">
              Rutas Más Transitadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rutasData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#4B5563" style={{ fontSize: '12px', fontWeight: 600 }} />
                <YAxis 
                  dataKey="ruta" 
                  type="category" 
                  width={140} 
                  stroke="#4B5563" 
                  style={{ fontSize: '12px', fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                />
                <Bar dataKey="viajes" fill="#FDB714" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
