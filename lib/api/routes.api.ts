/**
 * Routes API
 * Handles CRUD operations for bus routes
 */

import { API_BASE_URL } from './config';

export interface Route {
  _id: string;
  name: string;
  startPoint: {
    lat: number;
    lng: number;
  };
  endPoint: {
    lat: number;
    lng: number;
  };
  distance: number;
  duration: number;
  geometry: any;
  fare?: number;
  schedules?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutePayload {
  name: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  fare?: number;
  schedules?: string[];
}

export interface UpdateRoutePayload {
  name?: string;
  fare?: number;
  isActive?: boolean;
  schedules?: string[];
}

/**
 * Get all routes
 */
export async function getRoutes(): Promise<Route[]> {
  const response = await fetch(`${API_BASE_URL}/api/routes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Error fetching routes');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Create a new route
 */
export async function createRoute(route: CreateRoutePayload): Promise<Route> {
  const response = await fetch(`${API_BASE_URL}/api/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(route),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error creating route');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Update an existing route
 */
export async function updateRoute(id: string, updates: UpdateRoutePayload): Promise<Route> {
  const response = await fetch(`${API_BASE_URL}/api/routes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error updating route');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Soft delete (deactivate) a route
 */
export async function deactivateRoute(id: string): Promise<Route> {
  const response = await fetch(`${API_BASE_URL}/api/routes/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error deactivating route');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Hard delete (permanently delete) a route
 */
export async function deleteRoute(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/routes/${id}/permanent`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error deleting route');
  }
  
  const result = await response.json();
  return result;
}

/**
 * Calculate route using OSRM (fallback - backend should handle this)
 */
export async function calculateRoute(start: [number, number], end: [number, number]) {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
  );
  
  if (!response.ok) {
    throw new Error('Error calculating route');
  }
  
  return response.json();
}
