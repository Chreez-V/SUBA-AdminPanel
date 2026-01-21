"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bus, LayoutDashboard, Users, Map, LogOut } from "lucide-react";
import { logoutAdmin } from "@/lib/api";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Buses (Drivers)", href: "/dashboard/buses", icon: Bus },
  { name: "Pasajeros", href: "/dashboard/pasajeros", icon: Users },
  { name: "Rutas", href: "/dashboard/rutas", icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      // ✅ Llamar al backend para invalidar el token
      await logoutAdmin();
      
      // ✅ Eliminar cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      
      // ✅ Forzar recarga completa para limpiar caché y estado
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      
      // ✅ Limpiar cookies incluso si hay error
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      
      // ✅ Redirigir al login de todos modos
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-[#00457C] to-[#003459] text-white shadow-2xl">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-[#0066B3]/30 px-6 bg-[#003459]/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDB714] shadow-lg">
          <Bus className="h-7 w-7 text-[#00457C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">SUBA</h1>
          <p className="text-xs text-blue-200 font-medium">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-[#FDB714] text-[#00457C] shadow-md"
                  : "text-blue-100 hover:bg-[#0066B3]/50 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-[#0066B3]/30 p-4 bg-[#003459]/50">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-blue-100 transition-all duration-200 hover:bg-[#E31E24] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-5 w-5" />
          <span>{isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}</span>
        </button>
      </div>
    </div>
  );
}
