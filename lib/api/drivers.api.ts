/**
 * Drivers/Buses API
 * Handles CRUD operations for drivers and buses
 */

import { API_BASE_URL } from './config';

export interface Driver {
  id: string;
  nombre: string;
  unidad: string;
  placa: string;
  estado: 'Activo' | 'Inactivo';
  email?: string;
  telefono?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDriverPayload {
  nombre: string;
  unidad: string;
  placa: string;
  estado?: 'Activo' | 'Inactivo';
  email?: string;
  telefono?: string;
}

export interface UpdateDriverPayload {
  nombre?: string;
  unidad?: string;
  placa?: string;
  estado?: 'Activo' | 'Inactivo';
  email?: string;
  telefono?: string;
}

/**
 * Get all drivers
 * TODO: Connect with backend
 */
export async function getDrivers(): Promise<Driver[]> {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/drivers`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // if (!response.ok) throw new Error('Error fetching drivers');
  // const result = await response.json();
  // return result.data;
  
  // Mock data temporal
  return [
    { id: '1', nombre: 'Carlos Pérez', unidad: '101', placa: 'ABC-123', estado: 'Activo' },
    { id: '2', nombre: 'María González', unidad: '102', placa: 'DEF-456', estado: 'Activo' },
    { id: '3', nombre: 'Juan Rodríguez', unidad: '103', placa: 'GHI-789', estado: 'Inactivo' },
  ];
}

/**
 * Create a new driver
 * TODO: Connect with backend
 */
export async function createDriver(driver: CreateDriverPayload): Promise<Driver> {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/drivers`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(driver),
  // });
  // if (!response.ok) throw new Error('Error creating driver');
  // const result = await response.json();
  // return result.data;
  
  return { ...driver, id: Date.now().toString(), estado: driver.estado || 'Activo' };
}

/**
 * Update an existing driver
 * TODO: Connect with backend
 */
export async function updateDriver(id: string, driver: UpdateDriverPayload): Promise<Driver> {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/drivers/${id}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(driver),
  // });
  // if (!response.ok) throw new Error('Error updating driver');
  // const result = await response.json();
  // return result.data;
  
  return { ...driver, id } as Driver;
}

/**
 * Delete a driver
 * TODO: Connect with backend
 */
export async function deleteDriver(id: string): Promise<{ success: boolean }> {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/drivers/${id}`, {
  //   method: 'DELETE',
  // });
  // if (!response.ok) throw new Error('Error deleting driver');
  // const result = await response.json();
  // return result;
  
  return { success: true };
}
