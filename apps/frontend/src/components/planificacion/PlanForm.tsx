"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlanFormData, Tarea, TAREAS_PREDEFINIDAS, COLORES_PLAN, planVacio } from "./types";

interface CatItem { _id: string; nombre?: string; duracion_dias?: number; color?: string; }

interface Props {
  initial?: PlanFormData;
  initialFecha?: string;
  initialFermentadorId?: string;
  initialFermentadorNombre?: string;
  onSubmit: (d: PlanFormData) => Promise<void>;
  onCancel: () => void;
  estilos: CatItem[];
  fermentadores: CatItem[];
}

export function PlanForm({
  initial, initialFecha, initialFermentadorId, initialFermentadorNombre,
  onSubmit, onCancel, estilos, fermentadores,
}: Props) {
  const base = initial ?? {
    ...planVacio(),
    fecha_coccion: initialFecha ?? planVacio().fecha_coccion,
    fermentador_id: initialFermentadorId ?? '',
    fermentador_nombre: initialFermentadorNombre ?? '',
  };

  const [form, setForm] = useState<PlanFormData>(base);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nuevaTarea, setNuevaTarea] = useState("");

  const set = <K extends keyof PlanFormData>(k: K, v: PlanFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Recalcular fecha_fin cuando cambia fecha_coccion o duracion_dias
  useEffect(() => {
    if (!form.fecha_coccion) return;
    const d = new Date(form.fecha_coccion);
    d.setDate(d.getDate() + (form.duracion_dias || 21));
    set("fecha_fin", d.toISOString().split("T")[0]);
  }, [form.fecha_coccion, form.duracion_dias]);

  const pickEstilo = (id: string) => {
    const est = estilos.find((e) => e._id === id);
    setForm((f) => ({
      ...f,
      estilo_id:    id,
      estilo_nombre: est?.nombre ?? "",
      duracion_dias: est?.duracion_dias ?? f.duracion_dias,
      color:         est?.color ?? f.color,
    }));
  };

  const addTarea = (nombre: string) => {
    if (!nombre.trim()) return;
    const t: Tarea = { nombre: nombre.trim(), fecha_estimada: "", orden: form.tareas.length };
    set("tareas", [...form.tareas, t]);
    setNuevaTarea("");
  };

  const updTarea = (i: number, k: keyof Tarea, v: string | number) =>
    set("tareas", form.tareas.map((t, idx) => idx === i ? { ...t, [k]: v } : t));

  const remTarea = (i: number) =>
    set("tareas", form.tareas.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim())  { setError("El nombre es requerido"); return; }
    if (!form.fecha_coccion)  { setError("La fecha de cocción es requerida"); return; }
    setLoading(true); setError("");
    try { await onSubmit(form); }
    catch (err) { setError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Nombre */}
      <div className="space-y-1.5">
        <Label>Nombre *</Label>
        <Input value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
          placeholder="IPA Mayo, Stout Invierno…" autoFocus />
      </div>

      {/* Estilo + Fermentador */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Estilo</Label>
          <Select value={form.estilo_id} onValueChange={pickEstilo}>
            <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
            <SelectContent>
              {estilos.map((e) => <SelectItem key={e._id} value={e._id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Fermentador</Label>
          <Select value={form.fermentador_id || "_none"} onValueChange={(v) => {
            if (v === "_none") { set("fermentador_id", ""); set("fermentador_nombre", ""); return; }
            const f = fermentadores.find((f) => f._id === v);
            set("fermentador_id", v); set("fermentador_nombre", f?.nombre ?? "");
          }}>
            <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Sin asignar</SelectItem>
              {fermentadores.map((f) => <SelectItem key={f._id} value={f._id}>{f.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Cocción *</Label>
          <Input type="date" value={form.fecha_coccion} onChange={(e) => set("fecha_coccion", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Días</Label>
          <Input type="number" min="1" max="365" value={form.duracion_dias}
            onChange={(e) => set("duracion_dias", parseInt(e.target.value) || 21)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Fin estimado</Label>
          <Input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} />
        </div>
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label className="text-xs">Color</Label>
        <div className="flex gap-2 flex-wrap items-center">
          {COLORES_PLAN.map((c) => (
            <button key={c} type="button" onClick={() => set("color", c)}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: c, borderColor: form.color === c ? "white" : "transparent" }} />
          ))}
          <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label className="text-xs">Notas</Label>
        <Textarea rows={2} value={form.notas} onChange={(e) => set("notas", e.target.value)}
          placeholder="Observaciones…" />
      </div>

      {/* Tareas */}
      <div className="space-y-2">
        <Label className="text-xs">Tareas</Label>
        {form.tareas.map((t, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input className="h-8 text-xs flex-1" value={t.nombre}
              onChange={(e) => updTarea(i, "nombre", e.target.value)} />
            <Input type="date" className="h-8 text-xs w-36" value={t.fecha_estimada}
              onChange={(e) => updTarea(i, "fecha_estimada", e.target.value)} />
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
              onClick={() => remTarea(i)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {/* Atajos tareas predefinidas */}
        <div className="flex flex-wrap gap-1">
          {TAREAS_PREDEFINIDAS.map((t) => (
            <button key={t} type="button" onClick={() => addTarea(t)}
              className="px-2 h-6 text-xs rounded-full border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              + {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input className="h-8 text-xs" placeholder="Tarea personalizada…"
            value={nuevaTarea} onChange={(e) => setNuevaTarea(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTarea(nuevaTarea); } }} />
          <Button type="button" size="icon" variant="outline" className="h-8 w-8 shrink-0"
            onClick={() => addTarea(nuevaTarea)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
          <X className="h-3.5 w-3.5 mr-1.5" />Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Guardando…" : initial ? "Actualizar" : "Crear plan"}
        </Button>
      </div>
    </form>
  );
}
