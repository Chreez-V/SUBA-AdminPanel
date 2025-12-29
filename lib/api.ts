// API Base URL
const API_BASE_URL = 'https://subapp-api.onrender.com';

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
  // const response = await fetch(`${API_BASE_URL}/api/drivers`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(driver),
  // });
  // return response.json();
  
  return { ...driver, id: Date.now().toString() };
}

export async function updateDriver(id: string, driver: any) {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/drivers/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(driver),
  // });
  // return response.json();
  
  return { ...driver, id };
}

export async function deleteDriver(id: string) {
  // TODO: Conectar con tu backend
  // await fetch(`${API_BASE_URL}/api/drivers/${id}`, { method: 'DELETE' });
  
  return { success: true };
}

// Passengers API (Mock endpoints)
export async function getPassengers() {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/passengers`);
  // return response.json();
  
  return [
    { id: '1', nombre: 'Ana Silva', email: 'ana@example.com', viajes: 45 },
    { id: '2', nombre: 'Pedro Martínez', email: 'pedro@example.com', viajes: 32 },
    { id: '3', nombre: 'Luisa Fernández', email: 'luisa@example.com', viajes: 28 },
  ];
}

// Routes API (Mock endpoints)
export async function getRoutes() {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/routes`);
  // return response.json();
  
  return [
    { 
      id: '1', 
      nombre: 'Ruta Centro - Unare', 
      distancia: '12.5 km',
      tiempoEstimado: '25 min',
      estado: 'Activa'
    },
  ];
}

export async function createRoute(route: any) {
  // TODO: Conectar con tu backend
  // const response = await fetch(`${API_BASE_URL}/api/routes`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(route),
  // });
  // return response.json();
  
  return { ...route, id: Date.now().toString() };
}

// OSRM API para calcular rutas
export async function calculateRoute(start: [number, number], end: [number, number]) {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
  );
  
  if (!response.ok) {
    throw new Error('Error al calcular la ruta');
  }
  
  return response.json();
}
