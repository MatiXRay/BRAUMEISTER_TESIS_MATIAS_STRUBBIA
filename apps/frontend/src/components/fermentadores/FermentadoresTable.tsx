"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Plus, Droplets } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LimpiezaBadge } from "./LimpiezaBadge";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface Limpiezas {
  alcalina:  string | null;
  acida:     string | null;
  oxidativa: string | null;
  exterior:  string | null;
}

export interface Fermentador {
  _id: string;
  nombre: string;
  capacidad: number;
  limpiezas: Limpiezas;
}

type TipoLimpieza = keyof Limpiezas;

const TIPOS_LIMPIEZA: { key: TipoLimpieza; label: string }[] = [
  { key: "alcalina",  label: "Alcalina" },
  { key: "acida",     label: "Ácida" },
  { key: "oxidativa", label: "Oxidativa" },
  { key: "exterior",  label: "Exterior" },
];

function FermentadorForm({ initial, onSubmit, onCancel }: {
  initial?: { nombre: string; capacidad: number };
  onSubmit: (d: { nombre: string; capacidad: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [capacidad, setCapacidad] = useState(initial?.capacidad?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    if (!capacidad || isNaN(Number(capacidad)) || Number(capacidad) < 1) {
      setError("La capacidad debe ser un número mayor a 0"); return;
    }
    setLoading(true); setError("");
    try { await onSubmit({ nombre: nombre.trim(), capacidad: Number(capacidad) }); }
    catch (err) { setError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Fermentador 1" autoFocus />
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacidad">Capacidad (litros)</Label>
        <Input id="capacidad" type="number" min="1" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} placeholder="Ej: 500" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
      </div>
    </form>
  );
}

function LimpiezaDialog({ fermentador, onUpdate, onClose }: {
  fermentador: Fermentador;
  onUpdate: (updated: Fermentador) => void;
  onClose: () => void;
}) {
  const { getToken } = useAuth();
  const [fechas, setFechas] = useState<Record<TipoLimpieza, Date | undefined>>({
    alcalina:  fermentador.limpiezas.alcalina  ? new Date(fermentador.limpiezas.alcalina)  : undefined,
    acida:     fermentador.limpiezas.acida     ? new Date(fermentador.limpiezas.acida)     : undefined,
    oxidativa: fermentador.limpiezas.oxidativa ? new Date(fermentador.limpiezas.oxidativa) : undefined,
    exterior:  fermentador.limpiezas.exterior  ? new Date(fermentador.limpiezas.exterior)  : undefined,
  });
  const [loading, setLoading] = useState<TipoLimpieza | null>(null);

  const registrar = async (tipo: TipoLimpieza, fecha: Date) => {
    setLoading(tipo);
    try {
      const t = (await getToken()) ?? "";
      const updated = await apiFetch<Fermentador>(
        `/fermentadores/${fermentador._id}/limpieza/${tipo}`, t,
        { method: "PATCH", body: JSON.stringify({ fecha: fecha.toISOString() }) }
      );
      setFechas((prev) => ({ ...prev, [tipo]: fecha }));
      onUpdate(updated);
    } finally {
      setLoading(null);
    }
  };

  const marcarHoy = async (tipo: TipoLimpieza) => {
    await registrar(tipo, new Date());
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Fermentador: <span className="font-medium text-foreground">{fermentador.nombre}</span>
      </p>
      <div className="space-y-3">
        {TIPOS_LIMPIEZA.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {fechas[key]
                  ? `Última: ${format(fechas[key]!, "dd/MM/yyyy")}`
                  : "Sin registro"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    Elegir fecha
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={fechas[key]}
                    onSelect={(date) => date && registrar(key, date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                size="sm"
                onClick={() => marcarHoy(key)}
                disabled={loading === key}
                className={cn("text-xs", loading === key && "opacity-50")}
              >
                {loading === key ? "..." : "Hoy"}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
}

export function FermentadoresTable({ initialData }: { initialData: Fermentador[] }) {
  const { getToken } = useAuth();
  const [fermentadores, setFermentadores] = useState<Fermentador[]>(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [limpiezaOpen, setLimpiezaOpen] = useState(false);
  const [editando, setEditando] = useState<Fermentador | null>(null);
  const [gestionando, setGestionando] = useState<Fermentador | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const token = async () => (await getToken()) ?? "";

  const handleGuardar = async (data: { nombre: string; capacidad: number }) => {
    const t = await token();
    if (editando) {
      const updated = await apiFetch<Fermentador>(`/fermentadores/${editando._id}`, t, {
        method: "PUT", body: JSON.stringify(data),
      });
      setFermentadores((prev) => prev.map((f) => (f._id === editando._id ? updated : f)));
    } else {
      const nuevo = await apiFetch<Fermentador>("/fermentadores", t, {
        method: "POST", body: JSON.stringify(data),
      });
      setFermentadores((prev) => [...prev, nuevo]);
    }
    setFormOpen(false);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este fermentador?")) return;
    setEliminando(id);
    try {
      await apiFetch(`/fermentadores/${id}`, await token(), { method: "DELETE" });
      setFermentadores((prev) => prev.filter((f) => f._id !== id));
    } finally { setEliminando(null); }
  };

  const handleUpdateLimpieza = (updated: Fermentador) => {
    setFermentadores((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    setGestionando(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fermentadores</h1>
          <p className="text-sm text-muted-foreground mt-1">{fermentadores.length} fermentadores registrados</p>
        </div>
        <Button onClick={() => { setEditando(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Nuevo fermentador
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Alcalina</TableHead>
              <TableHead>Ácida</TableHead>
              <TableHead>Oxidativa</TableHead>
              <TableHead>Exterior</TableHead>
              <TableHead className="w-28 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fermentadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No hay fermentadores registrados
                </TableCell>
              </TableRow>
            ) : fermentadores.map((f) => (
              <TableRow key={f._id}>
                <TableCell className="font-medium">{f.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{f.capacidad} L</TableCell>
                {TIPOS_LIMPIEZA.map(({ key, label }) => (
                  <TableCell key={key}>
                    <LimpiezaBadge tipo={key} fecha={f.limpiezas[key]} label={label} />
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost" size="icon"
                      title="Gestionar limpiezas"
                      onClick={() => { setGestionando(f); setLimpiezaOpen(true); }}
                    >
                      <Droplets className="h-4 w-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditando(f); setFormOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleEliminar(f._id)}
                      disabled={eliminando === f._id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog crear/editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar fermentador" : "Nuevo fermentador"}</DialogTitle>
          </DialogHeader>
          <FermentadorForm
            initial={editando ? { nombre: editando.nombre, capacidad: editando.capacidad } : undefined}
            onSubmit={handleGuardar}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog limpiezas */}
      <Dialog open={limpiezaOpen} onOpenChange={setLimpiezaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="h-4 w-4" /> Registro de limpiezas
            </DialogTitle>
          </DialogHeader>
          {gestionando && (
            <LimpiezaDialog
              fermentador={gestionando}
              onUpdate={handleUpdateLimpieza}
              onClose={() => setLimpiezaOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
