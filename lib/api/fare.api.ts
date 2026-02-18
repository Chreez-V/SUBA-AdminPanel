/**
 * Fare API
 * Handles general bus fare management
 */

import { API_BASE_URL } from './config';

export interface BusFare {
  _id: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarePayload {
  amount: number;
}

export interface UpdateFarePayload {
  amount: number;
}

/**
 * Get the general bus fare (first one in the system)
 */
export async function getGeneralFare(): Promise<BusFare | null> {
  const response = await fetch(`${API_BASE_URL}/api/pasajes/listar`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error('Error fetching fare');
  }
  
  const fares: BusFare[] = await response.json();
  return fares.length > 0 ? fares[0] : null;
}

/**
 * Create the initial general fare
 */
export async function createGeneralFare(amount: number): Promise<BusFare> {
  const response = await fetch(`${API_BASE_URL}/api/pasajes/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error creating fare');
  }
  
  return response.json();
}

/**
 * Update the general fare
 */
export async function updateGeneralFare(id: string, amount: number): Promise<BusFare> {
  const response = await fetch(`${API_BASE_URL}/api/pasajes/actualizar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error updating fare');
  }
  
  return response.json();
}
