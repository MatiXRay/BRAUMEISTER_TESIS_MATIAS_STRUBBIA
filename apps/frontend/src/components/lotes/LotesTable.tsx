"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { LoteForm } from "./LoteForm";
import { Lote, LoteFormData, ESTADO_CONFIG } from "./types";

function EstadoBadge({ estado }: { estado: Lote["estado"] }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export function LotesTable({ initialData }: { initialData: Lote[] }) {
  const { getToken } = useAuth();
  const [lotes, setLotes] = useState<Lote[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Lote | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const token = async () => (await getToken()) ?? "";
  const cerrar = () => { setDialogOpen(false); setEditando(null); };

  const handleGuardar = async (data: LoteFormData) => {
    const t = await token();
    if (editando) {
      const updated = await apiFetch<Lote>(`/lotes/${editando._id}`, t, {
        method: "PUT", body: JSON.stringify(data),
      });
      setLotes((prev) => prev.map((l) => (l._id === editando._id ? updated : l)));
    } else {
      const nuevo = await apiFetch<Lote>("/lotes", t, {
        method: "POST", body: JSON.stringify(data),
      });
      setLotes((prev) => [nuevo, ...prev]);
    }
    cerrar();
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este lote? Esta acción no se puede deshacer.")) return;
    setEliminando(id);
    try {
      await apiFetch(`/lotes/${id}`, await token(), { method: "DELETE" });
      setLotes((prev) => prev.filter((l) => l._id !== id));
    } finally { setEliminando(null); }
  };

  const initialForm = (l: Lote): LoteFormData => ({
    ...l,
    fecha_elaboracion: new Date(l.fecha_elaboracion).toISOString().split("T")[0],
    lecturas: {
      ...l.lecturas,
      dia_envasado: l.lecturas.dia_envasado
        ? new Date(l.lecturas.dia_envasado).toISOString().split("T")[0]
        : "",
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lotes</h1>
          <p className="text-sm text-muted-foreground mt-1">{lotes.length} lotes registrados</p>
        </div>
        <Button onClick={() => { setEditando(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nuevo lote
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Lote</TableHead>
              <TableHead>Estilo</TableHead>
              <TableHead>Fermentador</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>OG</TableHead>
              <TableHead>FG</TableHead>
              <TableHead>ABV</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                  No hay lotes registrados
                </TableCell>
              </TableRow>
            ) : lotes.map((l) => (
              <TableRow key={l._id}>
                <TableCell className="font-mono font-medium">{l.numero_lote}</TableCell>
                <TableCell>{l.estilo_nombre}</TableCell>
                <TableCell className="text-muted-foreground">{l.fermentador_nombre}</TableCell>
                <TableCell>{format(new Date(l.fecha_elaboracion), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell>{l.parametros?.og ? l.parametros.og.toFixed(3) : "—"}</TableCell>
                <TableCell>{l.parametros?.fg ? l.parametros.fg.toFixed(3) : "—"}</TableCell>
                <TableCell>{l.parametros?.abv ? `${l.parametros.abv}%` : "—"}</TableCell>
                <TableCell><EstadoBadge estado={l.estado} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditando(l); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                      onClick={() => handleEliminar(l._id)} disabled={eliminando === l._id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) cerrar(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar lote ${editando.numero_lote}` : "Nuevo lote"}</DialogTitle>
          </DialogHeader>
          {dialogOpen && (
            <LoteForm
              initial={editando ? initialForm(editando) : undefined}
              onSubmit={handleGuardar}
              onCancel={cerrar}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
