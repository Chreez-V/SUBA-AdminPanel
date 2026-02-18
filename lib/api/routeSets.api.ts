/**
 * Route Sets (Conjuntos) API
 * CRUD operations for route sets — groups of alternative routes
 */

import { API_BASE_URL } from './config';

// ── Types ───────────────────────────────────────────────

export interface RouteSet {
  _id: string;
  name: string;
  description?: string;
  routes: any[]; // populated Route objects
  activeRoute: any | null; // populated Route object or null
  status: 'Active' | 'Inactive';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendRouteSet {
  _id: string;
  name: string;
  description?: string;
  routes: any[];
  activeRoute: any | null;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

function mapRouteSet(s: BackendRouteSet): RouteSet {
  return { ...s, isActive: s.status === 'Active' };
}

export interface CreateRouteSetPayload {
  name: string;
  description?: string;
  routeIds?: string[];
}

export interface UpdateRouteSetPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// ── API calls ───────────────────────────────────────────

export async function getRouteSets(): Promise<RouteSet[]> {
  const res = await fetch(`${API_BASE_URL}/api/conjuntos`);
  if (!res.ok) throw new Error('Error fetching route sets');
  const json = await res.json();
  return json.data.map(mapRouteSet);
}

export async function getRouteSetById(id: string): Promise<RouteSet> {
  const res = await fetch(`${API_BASE_URL}/api/conjuntos/buscar/${id}`);
  if (!res.ok) throw new Error('Error fetching route set');
  const json = await res.json();
  return mapRouteSet(json.data);
}

export async function createRouteSet(payload: CreateRouteSetPayload): Promise<RouteSet> {
  const res = await fetch(`${API_BASE_URL}/api/conjuntos/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error creating route set');
  }
  const json = await res.json();
  return mapRouteSet(json.data);
}

export async function updateRouteSet(id: string, payload: UpdateRouteSetPayload): Promise<RouteSet> {
  const res = await fetch(`${API_BASE_URL}/api/conjuntos/actualizar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error updating route set');
  }
  const json = await res.json();
  return mapRouteSet(json.data);
}

export async function addRouteToSet(setId: string, routeId: string): Promise<RouteSet> {
  const res = await fetch(`${API_BASE_URL}/api/conjuntos/${setId}/agregar-ruta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routeId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error adding route to set');
  }
  const json = await res.json();
  return mapRouteSet(json.data);
}

export async function removeRouteFromSet(setId: string, routeId: string): Promise<RouteSet> {
  const res = await fetch(`${API_BASE_URL}/api/conjuntos/${setId}/quitar-ruta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routeId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error removing route from set');
  }
  const json = await res.json();
  return mapRouteSet(json.data);
}

export async function setActiveRouteInSet(setId: string, routeId: string): Promise<RouteSet> {
  const res = await fetch(`${API_BASE_URL}/api/conjuntos/${setId}/activar-ruta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routeId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error setting active route');
  }
  const json = await res.json();
  return mapRouteSet(json.data);
}

export async function deleteRouteSet(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/conjuntos/eliminar/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error deleting route set');
  }
  return res.json();
}
