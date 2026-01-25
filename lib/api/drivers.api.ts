/**
 * Drivers API
 * Handles CRUD operations for drivers
 */

import { API_BASE_URL, getAuthHeaders } from './config';

export interface Driver {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  phone: string;
  status: 'Active' | 'Inactive';
  role: 'driver';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverPayload {
  name: string;
  email: string;
  password: string;
  licenseNumber: string;
  phone: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateDriverPayload {
  name?: string;
  email?: string;
  licenseNumber?: string;
  phone?: string;
  status?: 'Active' | 'Inactive';
}

/**
 * Get all drivers
 */
export async function getDrivers(): Promise<Driver[]> {
  const response = await fetch(`${API_BASE_URL}/api/drivers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error fetching drivers' }));
    throw new Error(error.message || 'Error al obtener conductores');
  }
  
  const result = await response.json();
  return result.data || result;
}

/**
 * Get active drivers only
 */
export async function getActiveDrivers(): Promise<Driver[]> {
  const response = await fetch(`${API_BASE_URL}/api/drivers/active`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error fetching active drivers' }));
    throw new Error(error.message || 'Error al obtener conductores activos');
  }
  
  const result = await response.json();
  return result.data || result;
}

/**
 * Get driver by ID
 */
export async function getDriverById(id: string): Promise<Driver> {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error fetching driver' }));
    throw new Error(error.message || 'Error al obtener conductor');
  }
  
  const result = await response.json();
  return result.data || result;
}

/**
 * Create a new driver
 */
export async function createDriver(driver: CreateDriverPayload): Promise<Driver> {
  const response = await fetch(`${API_BASE_URL}/api/drivers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(driver),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error creating driver' }));
    throw new Error(error.message || 'Error al crear conductor');
  }
  
  const result = await response.json();
  return result.data || result;
}

/**
 * Update an existing driver
 */
export async function updateDriver(id: string, driver: UpdateDriverPayload): Promise<Driver> {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(driver),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error updating driver' }));
    throw new Error(error.message || 'Error al actualizar conductor');
  }
  
  const result = await response.json();
  return result.data || result;
}

/**
 * Delete a driver
 */
export async function deleteDriver(id: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false), // No Content-Type for DELETE without body
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error deleting driver' }));
    throw new Error(error.message || 'Error al eliminar conductor');
  }
  
  const result = await response.json();
  return result;
}
