"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginUser } from "@/lib/api/auth.api";
import { Bus, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ✅ Verificar si ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      
      // ✅ Guardar en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // ✅ Guardar en cookies para el middleware
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      
      // ✅ Forzar recarga de la página para limpiar caché
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-xl">
        <CardHeader className="space-y-6 text-center pb-8">
          {/* Logo SUBA */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-lg">
            <Bus className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-4xl font-bold text-[#00457C]">SUBA</CardTitle>
            <CardDescription className="text-base font-medium text-gray-700 mt-2">
              Sistema Urbano Boletería Automatizada
            </CardDescription>
            <p className="text-sm text-gray-600 mt-2">Panel de Administración</p>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-800 font-semibold">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@suba.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C] text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-800 font-semibold">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C] text-gray-900"
              />
            </div>
            
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 font-medium">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#00457C] hover:bg-[#0066B3] text-white font-semibold text-base shadow-md hover:shadow-lg transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <svg className="h-4 w-4 text-[#FDB714]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Solo administradores pueden acceder</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
