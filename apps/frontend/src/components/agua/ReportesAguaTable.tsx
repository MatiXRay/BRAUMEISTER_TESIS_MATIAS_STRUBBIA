"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

export interface ReporteAgua {
  _id:              string;
  fecha:            string;
  origen:           "RED" | "OSMOSIS";
  laboratorio:      string;
  ca:               number;
  mg:               number;
  na:               number;
  cl:               number;
  so4:              number;
  ph:               number;
  dureza_total:     number;
  dureza_carbonato: number;
  alcalinidad:      number;
}

type FormData = Omit<ReporteAgua, "_id">;

const formVacio = (): FormData => ({
  fecha: new Date().toISOString().split("T")[0],
  origen: "RED",
  laboratorio: "",
  ca: 0, mg: 0, na: 0, cl: 0, so4: 0, ph: 0,
  dureza_total: 0, dureza_carbonato: 0, alcalinidad: 0,
});

function NumField({ label, value, onChange, step = "0.1", unit }: {
  label: string; value: number; onChange: (v: number) => void; step?: string; unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}{unit && <span className="text-muted-foreground ml-1">({unit})</span>}</Label>
      <Input type="number" step={step} min="0" value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
    </div>
  );
}

function ReporteForm({ initial, onSubmit, onCancel }: {
  initial?: FormData;
  onSubmit: (d: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormData>(initial ?? formVacio());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.laboratorio.trim()) { setError("El laboratorio es requerido"); return; }
    if (!form.fecha) { setError("La fecha es requerida"); return; }
    setLoading(true); setError("");
    try { await onSubmit(form); }
    catch (err) { setError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Datos generales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Fecha *</Label>
          <Input type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Origen *</Label>
          <Select value={form.origen} onValueChange={(v) => set("origen", v as "RED" | "OSMOSIS")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="RED">Red</SelectItem>
              <SelectItem value="OSMOSIS">Ósmosis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Laboratorio *</Label>
          <Input value={form.laboratorio} onChange={(e) => set("laboratorio", e.target.value)} placeholder="Nombre del laboratorio" autoFocus />
        </div>
      </div>

      {/* Parámetros fisicoquímicos */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Parámetros</p>
        <div className="grid grid-cols-3 gap-3">
          <NumField label="Ca²⁺"  value={form.ca}  onChange={(v) => set("ca", v)}  unit="mg/L" />
          <NumField label="Mg²⁺"  value={form.mg}  onChange={(v) => set("mg", v)}  unit="mg/L" />
          <NumField label="Na⁺"   value={form.na}  onChange={(v) => set("na", v)}  unit="mg/L" />
          <NumField label="Cl⁻"   value={form.cl}  onChange={(v) => set("cl", v)}  unit="mg/L" />
          <NumField label="SO₄²⁻" value={form.so4} onChange={(v) => set("so4", v)} unit="mg/L" />
          <NumField label="pH"    value={form.ph}  onChange={(v) => set("ph", v)}  step="0.01" />
          <NumField label="Dureza total"     value={form.dureza_total}     onChange={(v) => set("dureza_total", v)}     unit="mg/L CaCO₃" />
          <NumField label="Dureza carbonato" value={form.dureza_carbonato} onChange={(v) => set("dureza_carbonato", v)} unit="mg/L CaCO₃" />
          <NumField label="Alcalinidad"      value={form.alcalinidad}      onChange={(v) => set("alcalinidad", v)}      unit="mg/L CaCO₃" />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  );
}

export function ReportesAguaTable({ initialData }: { initialData: ReporteAgua[] }) {
  const { getToken } = useAuth();
  const [reportes, setReportes] = useState<ReporteAgua[]>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ReporteAgua | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const token = async () => (await getToken()) ?? "";
  const cerrar = () => setDialogOpen(false);

  const handleGuardar = async (data: FormData) => {
    const t = await token();
    if (editando) {
      const updated = await apiFetch<ReporteAgua>(`/reportes-agua/${editando._id}`, t, {
        method: "PUT", body: JSON.stringify(data),
      });
      setReportes((prev) => prev.map((r) => (r._id === editando._id ? updated : r)));
    } else {
      const nuevo = await apiFetch<ReporteAgua>("/reportes-agua", t, {
        method: "POST", body: JSON.stringify(data),
      });
      setReportes((prev) => [nuevo, ...prev]);
    }
    cerrar();
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este reporte?")) return;
    setEliminando(id);
    try {
      await apiFetch(`/reportes-agua/${id}`, await token(), { method: "DELETE" });
      setReportes((prev) => prev.filter((r) => r._id !== id));
    } finally { setEliminando(null); }
  };

  const initialForm = (r: ReporteAgua): FormData => ({
    ...r,
    fecha: new Date(r.fecha).toISOString().split("T")[0],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes de Agua</h1>
          <p className="text-sm text-muted-foreground mt-1">{reportes.length} reportes registrados</p>
        </div>
        <Button onClick={() => { setEditando(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nuevo reporte
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Laboratorio</TableHead>
              <TableHead>Ca²⁺</TableHead>
              <TableHead>Mg²⁺</TableHead>
              <TableHead>Na⁺</TableHead>
              <TableHead>Cl⁻</TableHead>
              <TableHead>SO₄²⁻</TableHead>
              <TableHead>pH</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                  No hay reportes registrados
                </TableCell>
              </TableRow>
            ) : reportes.map((r) => (
              <TableRow key={r._id}>
                <TableCell className="font-medium">
                  {format(new Date(r.fecha), "dd/MM/yyyy", { locale: es })}
                </TableCell>
                <TableCell>
                  <Badge variant={r.origen === "OSMOSIS" ? "default" : "secondary"}>
                    {r.origen === "OSMOSIS" ? "Ósmosis" : "Red"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.laboratorio}</TableCell>
                <TableCell>{r.ca}</TableCell>
                <TableCell>{r.mg}</TableCell>
                <TableCell>{r.na}</TableCell>
                <TableCell>{r.cl}</TableCell>
                <TableCell>{r.so4}</TableCell>
                <TableCell>{r.ph}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditando(r); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                      onClick={() => handleEliminar(r._id)} disabled={eliminando === r._id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar reporte" : "Nuevo reporte de agua"}</DialogTitle>
          </DialogHeader>
          <ReporteForm
            initial={editando ? initialForm(editando) : undefined}
            onSubmit={handleGuardar}
            onCancel={cerrar}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
