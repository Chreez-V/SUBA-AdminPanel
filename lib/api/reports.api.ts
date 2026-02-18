/**
 * Reports API
 * CRUD operations for route reports (reportes de ruta)
 */

import { API_BASE_URL } from './config';

// ── Types ───────────────────────────────────────────────

export interface ReportReason {
  value: string;
  label: string;
}

export interface Report {
  _id: string;
  route: {
    _id: string;
    name: string;
    distance?: number;
    status?: string;
    routeType?: string;
  };
  driver: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  reason: string;
  customReason?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  switchedToRoute?: {
    _id: string;
    name: string;
  } | null;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportPayload {
  routeId: string;
  driverId: string;
  reason: string;
  customReason?: string;
  notes?: string;
}

export interface ResolveReportPayload {
  status: 'approved' | 'rejected' | 'resolved';
  switchToRouteId?: string;
  resolutionNotes?: string;
}

// ── API calls ───────────────────────────────────────────

export async function getReportReasons(): Promise<ReportReason[]> {
  const res = await fetch(`${API_BASE_URL}/api/reportes/motivos`);
  if (!res.ok) throw new Error('Error fetching report reasons');
  const json = await res.json();
  return json.data;
}

export async function getReports(): Promise<Report[]> {
  const res = await fetch(`${API_BASE_URL}/api/reportes`);
  if (!res.ok) throw new Error('Error fetching reports');
  const json = await res.json();
  return json.data;
}

export async function getPendingReports(): Promise<Report[]> {
  const res = await fetch(`${API_BASE_URL}/api/reportes/pendientes`);
  if (!res.ok) throw new Error('Error fetching pending reports');
  const json = await res.json();
  return json.data;
}

export async function getReportById(id: string): Promise<Report> {
  const res = await fetch(`${API_BASE_URL}/api/reportes/buscar/${id}`);
  if (!res.ok) throw new Error('Error fetching report');
  const json = await res.json();
  return json.data;
}

export async function createReport(payload: CreateReportPayload): Promise<Report> {
  const res = await fetch(`${API_BASE_URL}/api/reportes/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error creating report');
  }
  const json = await res.json();
  return json.data;
}

export async function resolveReport(id: string, payload: ResolveReportPayload): Promise<Report> {
  const res = await fetch(`${API_BASE_URL}/api/reportes/resolver/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error resolving report');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteReport(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/reportes/eliminar/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error deleting report');
  }
  return res.json();
}
