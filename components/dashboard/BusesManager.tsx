"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, Loader2 } from "lucide-react";
import { getDrivers, createDriver, updateDriver, deleteDriver, type Driver, type CreateDriverPayload, type UpdateDriverPayload } from "@/lib/api/drivers.api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BusesManager() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<CreateDriverPayload>({
    nombre: "",
    unidad: "",
    placa: "",
    estado: "Activo",
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error("Error loading drivers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        nombre: driver.nombre,
        unidad: driver.unidad,
        placa: driver.placa,
        estado: driver.estado,
      });
    } else {
      setEditingDriver(null);
      setFormData({ nombre: "", unidad: "", placa: "", estado: "Activo" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData as UpdateDriverPayload);
      } else {
        await createDriver(formData);
      }
      await loadDrivers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving driver:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este conductor?")) {
      try {
        await deleteDriver(id);
        await loadDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00457C]">Gestión de Buses</h1>
          <p className="text-sm md:text-base text-gray-700 font-medium mt-1">Administrar conductores y unidades</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-5 w-5" />
          Nuevo Conductor
        </Button>
      </div>

      <Card className="border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl font-bold text-[#00457C]">Lista de Conductores</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#00457C]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-gray-800 text-xs md:text-sm">Nombre</TableHead>
                    <TableHead className="font-bold text-gray-800 text-xs md:text-sm">Unidad</TableHead>
                    <TableHead className="font-bold text-gray-800 text-xs md:text-sm hidden sm:table-cell">Placa</TableHead>
                    <TableHead className="font-bold text-gray-800 text-xs md:text-sm">Estado</TableHead>
                    <TableHead className="text-right font-bold text-gray-800 text-xs md:text-sm">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-semibold text-gray-900 text-xs md:text-sm">{driver.nombre}</TableCell>
                      <TableCell className="font-medium text-gray-700 text-xs md:text-sm">{driver.unidad}</TableCell>
                      <TableCell className="font-medium text-gray-700 text-xs md:text-sm hidden sm:table-cell">{driver.placa}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 md:px-3 py-1 text-xs font-bold ${
                            driver.estado === "Activo"
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {driver.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(driver)}
                            className="h-8 w-8 p-0 md:h-9 md:w-9"
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(driver.id)}
                            className="h-8 w-8 p-0 md:h-9 md:w-9"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)} className="max-w-md mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-[#00457C]">
              {editingDriver ? "Editar Conductor" : "Nuevo Conductor"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad (Nro de Bus)</Label>
              <Input
                id="unidad"
                value={formData.unidad}
                onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as "Activo" | "Inactivo" })}
                className="flex h-11 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00457C] focus-visible:border-[#00457C]"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingDriver ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
