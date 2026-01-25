"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Bus, Users, Route, LogOut, Menu, X, Coins } from "lucide-react";
import { logoutAdmin } from "@/lib/api/auth.api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Conductores", href: "/dashboard/conductores", icon: Bus },
  { name: "Pasajeros", href: "/dashboard/pasajeros", icon: Users },
  { name: "Pasaje", href: "/dashboard/pasaje", icon: Coins },
  { name: "Rutas", href: "/dashboard/rutas", icon: Route },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logoutAdmin();
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-gradient-to-b from-[#00457C] to-[#003459] text-white shadow-2xl transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex h-16 lg:h-20 items-center justify-between gap-3 border-b border-[#0066B3]/30 px-4 lg:px-6 bg-[#003459]/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-[#FDB714] shadow-lg">
              <Bus className="h-5 w-5 lg:h-7 lg:w-7 text-[#00457C]" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">SUBA</h1>
              <p className="text-xs text-blue-200 font-medium">Admin Panel</p>
            </div>
          </div>
          
          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-[#0066B3]/50 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3 lg:px-4 py-4 lg:py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-[#FDB714] text-[#00457C] shadow-md"
                    : "text-blue-100 hover:bg-[#0066B3]/50 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-[#0066B3]/30 p-3 lg:p-4 bg-[#003459]/50">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-semibold text-blue-100 transition-all duration-200 hover:bg-[#E31E24] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>{isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}</span>
          </button>
        </div>
      </div>
    </>
  );
}

// Botón hamburguesa para móvil
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-[#00457C] text-white shadow-lg hover:bg-[#0066B3] transition-colors"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
