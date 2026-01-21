"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth(requireAuth: boolean = true) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // Verificar que sea admin
          if (parsedUser.role !== 'admin') {
            console.warn('Usuario no es admin, redirigiendo...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (requireAuth) {
              router.push('/login');
            }
            setIsAuthenticated(false);
            setUser(null);
            return;
          }

          setIsAuthenticated(true);
          setUser(parsedUser);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          if (requireAuth && pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
        setUser(null);
        if (requireAuth) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en localStorage (útil para logout en otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, pathname, requireAuth]);

  return { isAuthenticated, isLoading, user };
}
