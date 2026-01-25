/**
 * Passengers API
 * Handles CRUD operations for passengers
 */

import { API_BASE_URL } from './config';

export interface Passenger {
  _id: string;
  fullName: string;
  email: string;
  credit: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface PassengersResponse {
  passengers: Passenger[];
}

/**
 * Get all passengers from backend
 */
export async function getPassengers(): Promise<Passenger[]> {
  const response = await fetch(`${API_BASE_URL}/api/passengers`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error fetching passengers' }));
    throw new Error(error.error || 'Error al obtener pasajeros');
  }
  
  const result: PassengersResponse = await response.json();
  return result.passengers;
}
