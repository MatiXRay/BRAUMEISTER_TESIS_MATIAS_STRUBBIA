"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { MaltaForm, type MaltaFormData } from "./MaltaForm";
import { apiFetch } from "@/lib/api";

export interface Malta {
  _id: string;
  nombre: string;
  marca: string;
}

interface Props {
  initialData: Malta[];
}

export function MaltasTable({ initialData }: Props) {
  const { getToken } = useAuth();
  const [maltas, setMaltas] = useState<Malta[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Malta | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const token = async () => (await getToken()) ?? "";

  const abrirCrear = () => { setEditando(null); setDialogOpen(true); };
  const abrirEditar = (m: Malta) => { setEditando(m); setDialogOpen(true); };
  const cerrar = () => setDialogOpen(false);

  const handleGuardar = async (data: MaltaFormData) => {
    const t = await token();
    if (editando) {
      const actualizada = await apiFetch<Malta>(`/maltas/${editando._id}`, t, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setMaltas((prev) => prev.map((m) => (m._id === editando._id ? actualizada : m)));
    } else {
      const nueva = await apiFetch<Malta>("/maltas", t, {
        method: "POST",
        body: JSON.stringify(data),
      });
      setMaltas((prev) => [...prev, nueva]);
    }
    cerrar();
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta malta?")) return;
    setEliminando(id);
    try {
      await apiFetch(`/maltas/${id}`, await token(), { method: "DELETE" });
      setMaltas((prev) => prev.filter((m) => m._id !== id));
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Variedades de Malta</h1>
          <p className="text-sm text-muted-foreground mt-1">{maltas.length} variedades registradas</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva malta
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maltas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  No hay maltas registradas
                </TableCell>
              </TableRow>
            ) : (
              maltas.map((malta) => (
                <TableRow key={malta._id}>
                  <TableCell className="font-medium">{malta.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{malta.marca}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(malta)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleEliminar(malta._id)}
                        disabled={eliminando === malta._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar malta" : "Nueva malta"}</DialogTitle>
          </DialogHeader>
          <MaltaForm
            initial={editando ?? undefined}
            onSubmit={handleGuardar}
            onCancel={cerrar}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
