// Detect environment and set API Base URL
const isDevelopment = process.env.NODE_ENV === 'development' || 
                      typeof window !== 'undefined' && 
                      (window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1');

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3500'  // Local backend
  : 'https://subapp-api.onrender.com';  // Production backend

// Log para debugging
if (typeof window !== 'undefined') {
  console.log('🌐 API Environment:', isDevelopment ? 'Development (Local)' : 'Production');
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Auth API
export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en el inicio de sesión');
  }

  const data = await response.json();
  
  // Validar que el usuario sea admin
  if (data.user?.role !== 'admin') {
    throw new Error('Acceso denegado: Solo administradores pueden acceder');
  }

  return data;
}

// Drivers/Buses API (Mock endpoints - conectar con tu backend)
export async function getDrivers() {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/drivers`);
  // return response.json();
  
  // Mock data temporal
  return [
    { id: '1', nombre: 'Carlos Pérez', unidad: '101', placa: 'ABC-123', estado: 'Activo' },
    { id: '2', nombre: 'María González', unidad: '102', placa: 'DEF-456', estado: 'Activo' },
    { id: '3', nombre: 'Juan Rodríguez', unidad: '103', placa: 'GHI-789', estado: 'Inactivo' },
  ];
}

export async function createDriver(driver: any) {
  // TODO: Conectar con tu backend
  return { ...driver, id: Date.now().toString() };
}

export async function updateDriver(id: string, driver: any) {
  // TODO: Conectar con tu backend
  return { ...driver, id };
}

export async function deleteDriver(id: string) {
  // TODO: Conectar con tu backend
  return { success: true };
}

// Passengers API (Mock endpoints)
export async function getPassengers() {
  // TODO: Conectar con tu backend
  return [
    { id: '1', nombre: 'Ana Silva', email: 'ana@example.com', viajes: 45 },
    { id: '2', nombre: 'Pedro Martínez', email: 'pedro@example.com', viajes: 32 },
    { id: '3', nombre: 'Luisa Fernández', email: 'luisa@example.com', viajes: 28 },
  ];
}

// ✅ Routes API - Updated to English
export async function getRoutes() {
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

export async function createRoute(route: {
  name: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  fare?: number;
  schedules?: string[];
}) {
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

export async function updateRoute(id: string, updates: {
  name?: string;
  fare?: number;
  isActive?: boolean;
  schedules?: string[];
}) {
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

export async function deleteRoute(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/routes/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error deleting route');
  }
  
  const result = await response.json();
  return result.data;
}

// OSRM API para calcular rutas (no se usa más, el backend lo hace)
export async function calculateRoute(start: [number, number], end: [number, number]) {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
  );
  
  if (!response.ok) {
    throw new Error('Error calculating route');
  }
  
  return response.json();
}

// Export API_BASE_URL for debugging purposes
export { API_BASE_URL };
