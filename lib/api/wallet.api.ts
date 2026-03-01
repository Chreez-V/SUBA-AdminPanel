/**
 * Wallet API Module
 * Functions for managing wallet recharges (payment validations) and transfers
 */

import { API_BASE_URL, getAuthHeaders } from './config';

// ── Types ──────────────────────────────────────────────────────────────

export interface PaymentValidation {
  _id: string;
  userId: string | { _id: string; fullName?: string; email?: string };
  type: 'recarga' | 'pago_tarjeta_nfc';
  referenciaPago: string;
  monto: number;
  banco?: string;
  fechaPago?: string;
  comprobanteUrl?: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string | { _id: string; fullName?: string; email?: string };
  type:
    | 'recarga'
    | 'pago_pasaje_nfc'
    | 'pago_pasaje_qr'
    | 'pago_pasaje_movil'
    | 'transferencia_enviada'
    | 'transferencia_recibida'
    | 'retiro'
    | 'reembolso'
    | 'cobro_pasaje';
  amount: number;
  previousBalance: number;
  newBalance: number;
  targetUserId?: string | { _id: string; fullName?: string; email?: string };
  sourceUserId?: string | { _id: string; fullName?: string; email?: string };
  paymentValidationId?: string;
  routeId?: string;
  driverId?: string;
  tripId?: string;
  fareType?: string;
  discountApplied?: number;
  cardUid?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Payment Validations (Admin) ────────────────────────────────────────

/**
 * Get all payment validation requests
 */
export async function getPaymentValidations(): Promise<PaymentValidation[]> {
  const response = await fetch(`${API_BASE_URL}/api/billetera/validaciones`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al obtener validaciones de pago');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.data || data.validations || []);
}

/**
 * Get a single payment validation by ID
 */
export async function getPaymentValidationById(id: string): Promise<PaymentValidation> {
  const response = await fetch(`${API_BASE_URL}/api/billetera/validaciones/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al obtener validación de pago');
  }

  const data = await response.json();
  return data.validation || data;
}

/**
 * Approve a pending recharge request
 */
export async function approveRecharge(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/billetera/validaciones/${id}/aprobar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al aprobar la recarga');
  }

  return response.json();
}

/**
 * Reject a pending recharge request with a reason
 */
export async function rejectRecharge(id: string, rejectionReason: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/billetera/validaciones/${id}/rechazar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ rejectionReason }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al rechazar la recarga');
  }

  return response.json();
}

// ── Transactions (read-only for admin) ─────────────────────────────────

/**
 * Get transaction history for a specific user
 */
export async function getUserTransactions(userId: string, page: number = 1, limit: number = 20): Promise<{ transactions: Transaction[]; total: number }> {
  const response = await fetch(
    `${API_BASE_URL}/api/billetera/historial?userId=${userId}&page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al obtener historial de transacciones');
  }

  return response.json();
}
