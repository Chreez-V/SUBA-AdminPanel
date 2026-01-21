"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { EnvironmentBadge } from "@/components/dashboard/environment-badge";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth(true);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#00457C] to-[#003459]">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto"></div>
          <p className="text-white font-semibold">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (el hook redirige)
  if (!isAuthenticated) {
    return null;
  }

  // Usuario autenticado, mostrar dashboard
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <EnvironmentBadge />
    </div>
  );
}
