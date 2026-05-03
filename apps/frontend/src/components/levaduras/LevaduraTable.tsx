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

export interface Levadura { _id: string; cepa: string; marca: string; }

function LevaduraForm({ initial, onSubmit, onCancel }: {
  initial?: { cepa: string; marca: string };
  onSubmit: (d: { cepa: string; marca: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [cepa, setCepa] = useState(initial?.cepa ?? "");
  const [marca, setMarca] = useState(initial?.marca ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepa.trim() || !marca.trim()) { setError("Cepa y marca son requeridas"); return; }
    setLoading(true); setError("");
    try { await onSubmit({ cepa: cepa.trim(), marca: marca.trim() }); }
    catch (err) { setError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cepa">Cepa</Label>
        <Input id="cepa" value={cepa} onChange={(e) => setCepa(e.target.value)} placeholder="Ej: US-05" autoFocus />
      </div>
      <div className="space-y-2">
        <Label htmlFor="marca">Marca</Label>
        <Input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ej: Fermentis" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  );
}

export function LevaduraTable({ initialData }: { initialData: Levadura[] }) {
  const { getToken } = useAuth();
  const [levaduras, setLevaduras] = useState<Levadura[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Levadura | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const token = async () => (await getToken()) ?? "";
  const cerrar = () => setDialogOpen(false);

  const handleGuardar = async (data: { cepa: string; marca: string }) => {
    const t = await token();
    if (editando) {
      const updated = await apiFetch<Levadura>(`/levaduras/${editando._id}`, t, { method: "PUT", body: JSON.stringify(data) });
      setLevaduras((prev) => prev.map((l) => (l._id === editando._id ? updated : l)));
    } else {
      const nueva = await apiFetch<Levadura>("/levaduras", t, { method: "POST", body: JSON.stringify(data) });
      setLevaduras((prev) => [...prev, nueva]);
    }
    cerrar();
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta levadura?")) return;
    setEliminando(id);
    try {
      await apiFetch(`/levaduras/${id}`, await token(), { method: "DELETE" });
      setLevaduras((prev) => prev.filter((l) => l._id !== id));
    } finally { setEliminando(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cepas de Levadura</h1>
          <p className="text-sm text-muted-foreground mt-1">{levaduras.length} cepas registradas</p>
        </div>
        <Button onClick={() => { setEditando(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nueva levadura
        </Button>
      </div>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cepa</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levaduras.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-10">No hay levaduras registradas</TableCell></TableRow>
            ) : levaduras.map((lev) => (
              <TableRow key={lev._id}>
                <TableCell className="font-medium">{lev.cepa}</TableCell>
                <TableCell className="text-muted-foreground">{lev.marca}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditando(lev); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleEliminar(lev._id)} disabled={eliminando === lev._id}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editando ? "Editar levadura" : "Nueva levadura"}</DialogTitle></DialogHeader>
          <LevaduraForm initial={editando ?? undefined} onSubmit={handleGuardar} onCancel={cerrar} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
