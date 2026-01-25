/**
 * Authentication API
 * Handles admin login and logout
 */

import { API_BASE_URL } from './config';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

/**
 * Admin login
 * @param email - Admin email
 * @param password - Admin password
 * @returns Login response with token and user data
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en el inicio de sesión');
  }

  const data = await response.json();

  // ✅ El backend ya verifica que sea admin, pero doble validación
  if (data.user?.role !== 'admin') {
    throw new Error('Acceso denegado: Solo administradores pueden acceder');
  }

  return data;
}

/**
 * Admin logout
 * Clears localStorage and calls logout endpoint
 */
export async function logoutAdmin(): Promise<{ success: boolean; message: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cerrar sesión');
    }

    // ✅ Limpiar datos del localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return await response.json();
  } catch (error) {
    // Limpiar localStorage incluso si hay error
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error;
  }
}
