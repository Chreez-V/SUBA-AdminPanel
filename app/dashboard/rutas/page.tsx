"use client";

import React, { useState } from "react";
import RutasManager from "@/components/dashboard/RutasManager";
import ParadasManager from "@/components/dashboard/ParadasManager";
import { Route, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "rutas", label: "Rutas", icon: Route },
  { key: "paradas", label: "Paradas", icon: MapPin },
] as const;

type Tab = (typeof tabs)[number]["key"];

const RutasPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("rutas");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00457C]">
          Gestión de Rutas
        </h1>
        <p className="text-sm md:text-base text-gray-700 font-medium mt-1">
          Administrar rutas y paradas del sistema de transporte
        </p>

        <div className="flex gap-1 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-[1px]",
                activeTab === tab.key
                  ? "border-[#00457C] text-[#00457C] bg-gray-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "rutas" ? <RutasManager /> : <ParadasManager />}
    </div>
  );
};

export default RutasPage;
