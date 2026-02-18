/**
 * Routes API
 * Handles CRUD operations for bus routes
 */

import { API_BASE_URL } from './config';

// Backend route interface (what the API returns)
interface BackendRoute {
  _id: string;
  name: string;
  startPoint?: {
    lat: number;
    lng: number;
  };
  endPoint?: {
    lat: number;
    lng: number;
  };
  stops?: any[];
  edges?: any[];
  distance: number;
  estimatedTime: number;
  geometry: any;
  routeType?: 'circular' | 'bidirectional';
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

// Frontend route interface (what the components use)
export interface Route {
  _id: string;
  name: string;
  startPoint?: {
    lat: number;
    lng: number;
  };
  endPoint?: {
    lat: number;
    lng: number;
  };
  stops?: any[];
  edges?: any[];
  distance: number;
  duration: number;
  geometry: any;
  routeType: 'circular' | 'bidirectional';
  fare?: number;
  schedules?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper function to map backend route to frontend route
function mapBackendToFrontend(backendRoute: BackendRoute): Route {
  return {
    _id: backendRoute._id,
    name: backendRoute.name,
    startPoint: backendRoute.startPoint,
    endPoint: backendRoute.endPoint,
    stops: backendRoute.stops,
    edges: backendRoute.edges,
    distance: backendRoute.distance,
    duration: backendRoute.estimatedTime,
    geometry: backendRoute.geometry,
    routeType: backendRoute.routeType || 'bidirectional',
    isActive: backendRoute.status === 'Active',
    createdAt: backendRoute.createdAt,
    updatedAt: backendRoute.updatedAt,
  };
}

export interface CreateRoutePayload {
  name: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  fare?: number;
  schedules?: string[];
}

export interface CreateRouteFromStopsPayload {
  name: string;
  stopIds: string[];
  edges: EdgePayload[];
  routeType: 'circular' | 'bidirectional';
}

export interface EdgePayload {
  fromStop: string;
  toStop: string;
  geometry: { type: string; coordinates: number[][] };
  distance: number;
  duration: number;
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
  const response = await fetch(`${API_BASE_URL}/api/rutas`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Error fetching routes');
  }
  
  const result = await response.json();
  // Map backend routes to frontend format
  return result.data.map(mapBackendToFrontend);
}

/**
 * Create a new route (legacy: start/end)
 */
export async function createRoute(route: CreateRoutePayload): Promise<Route> {
  const response = await fetch(`${API_BASE_URL}/api/rutas/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(route),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error creating route');
  }
  
  const result = await response.json();
  return mapBackendToFrontend(result.data);
}

/**
 * Create a route from ordered stops (new flow)
 */
export async function createRouteFromStops(payload: CreateRouteFromStopsPayload): Promise<Route> {
  const response = await fetch(`${API_BASE_URL}/api/rutas/crear-desde-paradas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error creating route from stops');
  }

  const result = await response.json();
  return mapBackendToFrontend(result.data);
}

/**
 * Calculate a single OSRM edge between two stops
 */
export async function calculateEdge(
  fromStopId: string,
  toStopId: string
): Promise<EdgePayload> {
  const response = await fetch(`${API_BASE_URL}/api/rutas/calcular-arista`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromStopId, toStopId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error calculating edge');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update an existing route
 */
export async function updateRoute(id: string, updates: UpdateRoutePayload): Promise<Route> {
  const response = await fetch(`${API_BASE_URL}/api/rutas/actualizar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error updating route');
  }
  
  const result = await response.json();
  return mapBackendToFrontend(result.data);
}

/**
 * Soft delete (deactivate) a route
 */
export async function deactivateRoute(id: string): Promise<Route> {
  const response = await fetch(`${API_BASE_URL}/api/rutas/desactivar/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error deactivating route');
  }
  
  const result = await response.json();
  return mapBackendToFrontend(result.data);
}

/**
 * Hard delete (permanently delete) a route
 */
export async function deleteRoute(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/rutas/eliminar/${id}`, {
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
