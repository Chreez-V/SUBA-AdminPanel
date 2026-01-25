/**
 * Passengers API
 * Handles CRUD operations for passengers
 */

import { API_BASE_URL } from './config';

export interface Passenger {
  id: string;
  nombre: string;
  email: string;
  viajes: number;
  telefono?: string;
  estado?: 'Activo' | 'Inactivo';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePassengerPayload {
  nombre: string;
  email: string;
  telefono?: string;
  estado?: 'Activo' | 'Inactivo';
}

export interface UpdatePassengerPayload {
  nombre?: string;
  email?: string;
  telefono?: string;
  estado?: 'Activo' | 'Inactivo';
}

/**
 * Get all passengers
 * TODO: Connect with backend
 */
export async function getPassengers(): Promise<Passenger[]> {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/passengers`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // if (!response.ok) throw new Error('Error fetching passengers');
  // const result = await response.json();
  // return result.data;
  
  // Mock data temporal
  return [
    { id: '1', nombre: 'Ana Silva', email: 'ana@example.com', viajes: 45 },
    { id: '2', nombre: 'Pedro Martínez', email: 'pedro@example.com', viajes: 32 },
    { id: '3', nombre: 'Luisa Fernández', email: 'luisa@example.com', viajes: 28 },
  ];
}

/**
 * Create a new passenger
 * TODO: Connect with backend
 */
export async function createPassenger(passenger: CreatePassengerPayload): Promise<Passenger> {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/passengers`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(passenger),
  // });
  // if (!response.ok) throw new Error('Error creating passenger');
  // const result = await response.json();
  // return result.data;
  
  return { ...passenger, id: Date.now().toString(), viajes: 0 };
}

/**
 * Update an existing passenger
 * TODO: Connect with backend
 */
export async function updatePassenger(id: string, passenger: UpdatePassengerPayload): Promise<Passenger> {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/passengers/${id}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(passenger),
  // });
  // if (!response.ok) throw new Error('Error updating passenger');
  // const result = await response.json();
  // return result.data;
  
  return { ...passenger, id, viajes: 0 } as Passenger;
}

/**
 * Delete a passenger
 * TODO: Connect with backend
 */
export async function deletePassenger(id: string): Promise<{ success: boolean }> {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/passengers/${id}`, {
  //   method: 'DELETE',
  // });
  // if (!response.ok) throw new Error('Error deleting passenger');
  // const result = await response.json();
  // return result;
  
  return { success: true };
}
