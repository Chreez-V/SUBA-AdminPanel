/**
 * NFC API
 * Handles NFC card request operations for the admin panel
 */

import { API_BASE_URL, getAuthHeaders } from './config';

// ── Interfaces ─────────────────────────────────────────────────────────

export interface NfcSolicitud {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  } | string;
  status: 'pendiente_pago' | 'pendiente_revision' | 'aprobada' | 'vinculada' | 'rechazada';
  emissionAmount: number;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  linkedCardUid?: string;
  linkedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NfcUsuario {
  _id: string;
  fullName: string;
  email: string;
  nfcStatus: 'none' | 'pending_payment' | 'pending_review' | 'approved' | 'active' | 'rejected';
  cedula?: string;
  phone?: string;
  createdAt: string;
}

// ── Solicitudes ────────────────────────────────────────────────────────

/**
 * Get all NFC card requests
 */
export async function getNfcSolicitudes(): Promise<NfcSolicitud[]> {
  const response = await fetch(`${API_BASE_URL}/api/nfc/solicitudes`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error fetching NFC requests' }));
    throw new Error(error.message || 'Error al obtener solicitudes NFC');
  }

  const result = await response.json();
  return result.solicitudes;
}

/**
 * Get a single NFC card request by ID
 */
export async function getNfcSolicitudById(id: string): Promise<NfcSolicitud> {
  const response = await fetch(`${API_BASE_URL}/api/nfc/solicitudes/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error fetching NFC request' }));
    throw new Error(error.message || 'Error al obtener solicitud NFC');
  }

  const result = await response.json();
  return result.solicitud;
}

/**
 * Approve an NFC card request
 */
export async function aprobarNfcSolicitud(id: string): Promise<NfcSolicitud> {
  const response = await fetch(`${API_BASE_URL}/api/nfc/solicitudes/${id}/aprobar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error approving NFC request' }));
    throw new Error(error.message || 'Error al aprobar solicitud NFC');
  }

  const result = await response.json();
  return result.solicitud;
}

/**
 * Reject an NFC card request
 */
export async function rechazarNfcSolicitud(id: string, rejectionReason: string): Promise<NfcSolicitud> {
  const response = await fetch(`${API_BASE_URL}/api/nfc/solicitudes/${id}/rechazar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ rejectionReason }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error rejecting NFC request' }));
    throw new Error(error.message || 'Error al rechazar solicitud NFC');
  }

  const result = await response.json();
  return result.solicitud;
}

/**
 * Block an NFC card by UID (admin)
 */
export async function bloquearTarjetaNfc(cardUid: string, blockedReason?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/nfc/admin/bloquear/${cardUid}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ blockedReason }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error blocking NFC card' }));
    throw new Error(error.message || 'Error al bloquear tarjeta NFC');
  }
}

// ── Usuarios ───────────────────────────────────────────────────────────

/**
 * Get all users with their NFC status
 */
export async function getNfcUsuarios(): Promise<NfcUsuario[]> {
  const response = await fetch(`${API_BASE_URL}/api/nfc/usuarios`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error fetching NFC users' }));
    throw new Error(error.message || 'Error al obtener usuarios NFC');
  }

  const result = await response.json();
  return result.usuarios;
}
