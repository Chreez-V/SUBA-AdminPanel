/**
 * API Module - Main Export File
 * 
 * This file re-exports all API functions from modularized files.
 * The API has been refactored into separate modules for better organization:
 * 
 * - api/config.ts       -> API configuration and helpers
 * - api/auth.api.ts     -> Authentication (login/logout)
 * - api/routes.api.ts   -> Routes CRUD operations
 * - api/drivers.api.ts  -> Drivers/Buses CRUD operations
 * - api/passengers.api.ts -> Passengers CRUD operations
 */

export * from './api';
