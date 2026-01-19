"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export function EnvironmentBadge() {
  const [env, setEnv] = useState<'development' | 'production'>('production');

  useEffect(() => {
    const isDev = API_BASE_URL.includes('localhost');
    setEnv(isDev ? 'development' : 'production');
  }, []);

  if (env === 'production') return null; // Solo mostrar en desarrollo

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-yellow-900 shadow-lg border-2 border-yellow-600">
      <div className="h-2 w-2 rounded-full bg-yellow-600 animate-pulse"></div>
      <span>DEV MODE</span>
      <span className="text-yellow-700">→ {API_BASE_URL}</span>
    </div>
  );
}
