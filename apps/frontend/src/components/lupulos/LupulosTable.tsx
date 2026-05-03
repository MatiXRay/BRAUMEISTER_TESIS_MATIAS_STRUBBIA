"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

export interface Lupulo { _id: string; nombre: string; marca: string; }

function LupuloForm({ initial, onSubmit, onCancel }: {
  initial?: { nombre: string; marca: string };
  onSubmit: (d: { nombre: string; marca: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [marca, setMarca] = useState(initial?.marca ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !marca.trim()) { setError("Nombre y marca son requeridos"); return; }
    setLoading(true); setError("");
    try { await onSubmit({ nombre: nombre.trim(), marca: marca.trim() }); }
    catch (err) { setError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Cascade" autoFocus />
      </div>
      <div className="space-y-2">
        <Label htmlFor="marca">Marca</Label>
        <Input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ej: Yakima Chief" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  );
}

export function LupulosTable({ initialData }: { initialData: Lupulo[] }) {
  const { getToken } = useAuth();
  const [lupulos, setLupulos] = useState<Lupulo[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Lupulo | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const token = async () => (await getToken()) ?? "";
  const cerrar = () => setDialogOpen(false);

  const handleGuardar = async (data: { nombre: string; marca: string }) => {
    const t = await token();
    if (editando) {
      const updated = await apiFetch<Lupulo>(`/lupulos/${editando._id}`, t, { method: "PUT", body: JSON.stringify(data) });
      setLupulos((prev) => prev.map((l) => (l._id === editando._id ? updated : l)));
    } else {
      const nuevo = await apiFetch<Lupulo>("/lupulos", t, { method: "POST", body: JSON.stringify(data) });
      setLupulos((prev) => [...prev, nuevo]);
    }
    cerrar();
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este lúpulo?")) return;
    setEliminando(id);
    try {
      await apiFetch(`/lupulos/${id}`, await token(), { method: "DELETE" });
      setLupulos((prev) => prev.filter((l) => l._id !== id));
    } finally { setEliminando(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Variedades de Lúpulo</h1>
          <p className="text-sm text-muted-foreground mt-1">{lupulos.length} variedades registradas</p>
        </div>
        <Button onClick={() => { setEditando(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nuevo lúpulo
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
            {lupulos.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-10">No hay lúpulos registrados</TableCell></TableRow>
            ) : lupulos.map((lupulo) => (
              <TableRow key={lupulo._id}>
                <TableCell className="font-medium">{lupulo.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{lupulo.marca}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditando(lupulo); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleEliminar(lupulo._id)} disabled={eliminando === lupulo._id}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editando ? "Editar lúpulo" : "Nuevo lúpulo"}</DialogTitle></DialogHeader>
          <LupuloForm initial={editando ?? undefined} onSubmit={handleGuardar} onCancel={cerrar} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
