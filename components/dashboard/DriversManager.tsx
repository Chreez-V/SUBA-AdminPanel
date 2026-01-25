"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  IdCard, 
  Calendar, 
  Loader2, 
  Search, 
  Bus, 
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { 
  getDrivers, 
  createDriver, 
  updateDriver, 
  deleteDriver,
  type Driver,
  type CreateDriverPayload,
  type UpdateDriverPayload
} from "@/lib/api/drivers.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DriversManager() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<CreateDriverPayload>({
    name: "",
    email: "",
    password: "",
    licenseNumber: "",
    phone: "",
    status: "Active",
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDrivers(drivers);
    } else {
      const filtered = drivers.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDrivers(filtered);
    }
  }, [searchTerm, drivers]);

  const loadDrivers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDrivers();
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (error: any) {
      console.error("Error loading drivers:", error);
      setError(error.message || "Error al cargar los conductores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDriver = async () => {
    setIsSubmitting(true);
    try {
      await createDriver(formData);
      setIsCreateModalOpen(false);
      resetForm();
      await loadDrivers();
    } catch (error: any) {
      alert(error.message || "Error al crear conductor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDriver = async () => {
    if (!selectedDriver) return;
    setIsSubmitting(true);
    try {
      const updatePayload: UpdateDriverPayload = {
        name: formData.name,
        email: formData.email,
        licenseNumber: formData.licenseNumber,
        phone: formData.phone,
        status: formData.status,
      };
      await updateDriver(selectedDriver._id, updatePayload);
      setIsEditModalOpen(false);
      resetForm();
      await loadDrivers();
    } catch (error: any) {
      alert(error.message || "Error al actualizar conductor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDriver = async () => {
    if (!selectedDriver) return;
    setIsSubmitting(true);
    try {
      await deleteDriver(selectedDriver._id);
      setIsDeleteModalOpen(false);
      setSelectedDriver(null);
      await loadDrivers();
    } catch (error: any) {
      alert(error.message || "Error al eliminar conductor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: "", // No editamos password
      licenseNumber: driver.licenseNumber,
      phone: driver.phone,
      status: driver.status,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      licenseNumber: "",
      phone: "",
      status: "Active",
    });
    setSelectedDriver(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const activeDrivers = drivers.filter(d => d.status === 'Active').length;
  const inactiveDrivers = drivers.filter(d => d.status === 'Inactive').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00457C]">Conductores</h1>
              <p className="text-sm md:text-base text-gray-700 font-medium">
                {isLoading ? "Cargando..." : `${filteredDrivers.length} conductor${filteredDrivers.length !== 1 ? 'es' : ''} registrado${filteredDrivers.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-[#00457C] to-[#0066B3] hover:from-[#0066B3] hover:to-[#00457C] text-white shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Conductor
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {!isLoading && !error && drivers.length > 0 && (
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border-gray-200 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Conductores</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-900">{drivers.length}</p>
                </div>
                <Bus className="h-10 w-10 md:h-12 md:w-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Activos</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-900">{activeDrivers}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-md bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Inactivos</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-900">{inactiveDrivers}</p>
                </div>
                <XCircle className="h-10 w-10 md:h-12 md:w-12 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email o licencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00457C]" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? "No se encontraron conductores" : "No hay conductores registrados"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega el primer conductor para comenzar"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-[#00457C] to-[#0066B3] hover:from-[#0066B3] hover:to-[#00457C] text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Primer Conductor
            </Button>
          )}
        </div>
      )}

      {/* Drivers Grid */}
      {!isLoading && !error && filteredDrivers.length > 0 && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDrivers.map((driver) => (
            <Card 
              key={driver._id} 
              className="border-gray-200 shadow-md hover:shadow-xl transition-all duration-200 bg-white overflow-hidden"
            >
              <CardHeader className="pb-3 bg-gradient-to-br from-[#00457C]/5 to-[#0066B3]/5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00457C] to-[#0066B3] shadow-md flex-shrink-0">
                      <User className="h-6 w-6 md:h-7 md:w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg font-bold text-gray-900 truncate" title={driver.name}>
                        {driver.name}
                      </CardTitle>
                      <Badge 
                        variant={driver.status === 'Active' ? 'default' : 'destructive'}
                        className={driver.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}
                      >
                        {driver.status === 'Active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                {/* Email */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 rounded-lg p-2.5">
                  <Mail className="h-4 w-4 text-[#00457C] flex-shrink-0" />
                  <span className="truncate" title={driver.email}>{driver.email}</span>
                </div>

                {/* Teléfono */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 rounded-lg p-2.5">
                  <Phone className="h-4 w-4 text-[#00457C] flex-shrink-0" />
                  <span className="truncate">{driver.phone}</span>
                </div>

                {/* Licencia */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 rounded-lg p-2.5">
                  <IdCard className="h-4 w-4 text-[#00457C] flex-shrink-0" />
                  <span className="truncate font-mono">{driver.licenseNumber}</span>
                </div>

                {/* Fecha de registro */}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{formatDate(driver.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => openEditModal(driver)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#00457C] text-[#00457C] hover:bg-[#00457C] hover:text-white"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => openDeleteModal(driver)}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Driver Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#00457C] flex items-center gap-2">
              <Bus className="h-6 w-6" />
              Crear Nuevo Conductor
            </DialogTitle>
            <DialogDescription>
              Completa los datos del conductor. Todos los campos son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="conductor@ejemplo.com"
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Número de Licencia *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="ABC123456"
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+58 412 1234567"
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Active' | 'Inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Activo</SelectItem>
                  <SelectItem value="Inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateDriver}
              disabled={isSubmitting || !formData.name || !formData.email || !formData.password || !formData.licenseNumber || !formData.phone}
              className="bg-gradient-to-r from-[#00457C] to-[#0066B3] hover:from-[#0066B3] hover:to-[#00457C]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Conductor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#00457C] flex items-center gap-2">
              <Edit2 className="h-6 w-6" />
              Editar Conductor
            </DialogTitle>
            <DialogDescription>
              Actualiza los datos del conductor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-licenseNumber">Número de Licencia *</Label>
              <Input
                id="edit-licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Active' | 'Inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-gray-300 focus:border-[#00457C] focus:ring-[#00457C]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Activo</SelectItem>
                  <SelectItem value="Inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateDriver}
              disabled={isSubmitting || !formData.name || !formData.email || !formData.licenseNumber || !formData.phone}
              className="bg-gradient-to-r from-[#00457C] to-[#0066B3] hover:from-[#0066B3] hover:to-[#00457C]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Eliminar Conductor
            </DialogTitle>
            <DialogDescription className="text-base">
              ¿Estás seguro de que deseas eliminar a <span className="font-bold text-gray-900">{selectedDriver?.name}</span>?
              <br />
              <span className="text-red-600 font-semibold">Esta acción no se puede deshacer.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedDriver(null);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteDriver}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
