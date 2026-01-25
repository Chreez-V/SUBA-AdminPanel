/**
 * Fare API
 * Handles general bus fare management
 */

import { API_BASE_URL } from './config';

export interface BusFare {
  _id: string;
  routeId?: string;
  fare: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarePayload {
  routeId?: string;
  fare: number;
}

export interface UpdateFarePayload {
  fare: number;
}

/**
 * Get the general bus fare (first one in the system)
 */
export async function getGeneralFare(): Promise<BusFare | null> {
  const response = await fetch(`${API_BASE_URL}/api/busfares`, {
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
export async function createGeneralFare(fare: number): Promise<BusFare> {
  const response = await fetch(`${API_BASE_URL}/api/busfares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routeId: 'general', fare }),
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
export async function updateGeneralFare(id: string, fare: number): Promise<BusFare> {
  const response = await fetch(`${API_BASE_URL}/api/busfares/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fare }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error updating fare');
  }
  
  return response.json();
}
