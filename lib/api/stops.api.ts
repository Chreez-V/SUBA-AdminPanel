/**
 * Stops API
 * CRUD operations for bus stops (paradas)
 */

import { API_BASE_URL } from './config';

// ── Types ───────────────────────────────────────────────
export interface StopLocation {
  lat: number;
  lng: number;
}

export interface Stop {
  _id: string;
  name: string;
  description?: string;
  location: StopLocation;
  address?: string;
  referenceLabel?: string;
  status: 'Active' | 'Inactive';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendStop {
  _id: string;
  name: string;
  description?: string;
  location: StopLocation;
  address?: string;
  referenceLabel?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

function mapStop(s: BackendStop): Stop {
  return { ...s, isActive: s.status === 'Active' };
}

export interface CreateStopPayload {
  name: string;
  description?: string;
  location: StopLocation;
  address?: string;
  referenceLabel?: string;
}

export interface UpdateStopPayload {
  name?: string;
  description?: string;
  address?: string;
  referenceLabel?: string;
  isActive?: boolean;
}

// ── API calls ───────────────────────────────────────────

export async function getStops(): Promise<Stop[]> {
  const res = await fetch(`${API_BASE_URL}/api/paradas`);
  if (!res.ok) throw new Error('Error fetching stops');
  const json = await res.json();
  return json.data.map(mapStop);
}

export async function getActiveStops(): Promise<Stop[]> {
  const res = await fetch(`${API_BASE_URL}/api/paradas/activas`);
  if (!res.ok) throw new Error('Error fetching active stops');
  const json = await res.json();
  return json.data.map(mapStop);
}

export async function createStop(payload: CreateStopPayload): Promise<Stop> {
  const res = await fetch(`${API_BASE_URL}/api/paradas/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error creating stop');
  }
  const json = await res.json();
  return mapStop(json.data);
}

export async function updateStop(id: string, payload: UpdateStopPayload): Promise<Stop> {
  const res = await fetch(`${API_BASE_URL}/api/paradas/actualizar/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error updating stop');
  }
  const json = await res.json();
  return mapStop(json.data);
}

export async function deactivateStop(id: string): Promise<Stop> {
  const res = await fetch(`${API_BASE_URL}/api/paradas/desactivar/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error deactivating stop');
  }
  const json = await res.json();
  return mapStop(json.data);
}

export async function deleteStop(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/paradas/eliminar/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error deleting stop');
  }
  return res.json();
}
