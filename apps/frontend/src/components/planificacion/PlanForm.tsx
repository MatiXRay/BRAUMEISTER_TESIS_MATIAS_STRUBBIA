"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, Calendar, FlaskConical, Palette, ClipboardList, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlanFormData, Tarea, TAREAS_PREDEFINIDAS, COLORES_PLAN, planVacio } from "./types";
import { cn } from "@/lib/utils";

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

/* ─── Separador de sección ──────────────────────────────────────── */
function SeccionLabel({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" aria-hidden />
    </div>
  );
}

export function PlanForm({
  initial, initialFecha, initialFermentadorId, initialFermentadorNombre,
  onSubmit, onCancel, estilos, fermentadores,
}: Props) {
  const base = initial ?? {
    ...planVacio(),
    fecha_coccion:      initialFecha ?? planVacio().fecha_coccion,
    fermentador_id:     initialFermentadorId ?? "",
    fermentador_nombre: initialFermentadorNombre ?? "",
  };

  const [form, setForm]           = useState<PlanFormData>(base);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [nuevaTarea, setNuevaTarea] = useState("");

  const set = <K extends keyof PlanFormData>(k: K, v: PlanFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  /* Recalcular fecha_fin cuando cambia fecha_coccion o duracion_dias */
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
      estilo_id:     id,
      estilo_nombre: est?.nombre ?? "",
      duracion_dias: est?.duracion_dias ?? f.duracion_dias,
      color:         est?.color ?? f.color,
    }));
  };

  const addTarea = (nombre: string) => {
    if (!nombre.trim()) return;
    const t: Tarea = {
      nombre:         nombre.trim(),
      fecha_estimada: "",
      orden:          form.tareas.length,
    };
    set("tareas", [...form.tareas, t]);
    setNuevaTarea("");
  };

  const updTarea = (i: number, k: keyof Tarea, v: string | number) =>
    set("tareas", form.tareas.map((t, idx) => idx === i ? { ...t, [k]: v } : t));

  const remTarea = (i: number) =>
    set("tareas", form.tareas.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setError("El nombre es requerido"); return; }
    if (!form.fecha_coccion) { setError("La fecha de cocción es requerida"); return; }
    setLoading(true);
    setError("");
    try { await onSubmit(form); }
    catch (err) { setError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setLoading(false); }
  };

  /* ── render ── */
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

      {/* ── Nombre (campo prominente) ─────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="plan-nombre" className="text-sm font-semibold">
          Nombre del plan <span className="text-destructive" aria-hidden>*</span>
        </Label>
        <Input
          id="plan-nombre"
          value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Ej: IPA Mayo, Stout Invierno, Lager Verano…"
          autoFocus
          className="h-11 text-base"
          aria-required="true"
          aria-describedby={error && !form.nombre.trim() ? "plan-error" : undefined}
        />
      </div>

      {/* ── Clasificación ─────────────────────────────────────────── */}
      <div>
        <SeccionLabel icon={FlaskConical} label="Clasificación" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="plan-estilo" className="text-xs font-medium text-muted-foreground">
              Estilo de cerveza
            </Label>
            <Select value={form.estilo_id} onValueChange={pickEstilo}>
              <SelectTrigger id="plan-estilo">
                <SelectValue placeholder="Sin estilo" />
              </SelectTrigger>
              <SelectContent>
                {estilos.map((e) => (
                  <SelectItem key={e._id} value={e._id}>{e.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-fermentador" className="text-xs font-medium text-muted-foreground">
              Fermentador
            </Label>
            <Select
              value={form.fermentador_id || "_none"}
              onValueChange={(v) => {
                if (v === "_none") {
                  set("fermentador_id", "");
                  set("fermentador_nombre", "");
                  return;
                }
                const f = fermentadores.find((f) => f._id === v);
                set("fermentador_id", v);
                set("fermentador_nombre", f?.nombre ?? "");
              }}
            >
              <SelectTrigger id="plan-fermentador">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Sin asignar</SelectItem>
                {fermentadores.map((f) => (
                  <SelectItem key={f._id} value={f._id}>{f.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Fechas ────────────────────────────────────────────────── */}
      <div>
        <SeccionLabel icon={Calendar} label="Fechas y duración" />
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="plan-coccion" className="text-xs font-medium text-muted-foreground">
              Cocción <span className="text-destructive" aria-hidden>*</span>
            </Label>
            <Input
              id="plan-coccion"
              type="date"
              value={form.fecha_coccion}
              onChange={(e) => set("fecha_coccion", e.target.value)}
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-dias" className="text-xs font-medium text-muted-foreground">
              Duración (días)
            </Label>
            <Input
              id="plan-dias"
              type="number"
              min="1"
              max="365"
              value={form.duracion_dias}
              onChange={(e) => set("duracion_dias", parseInt(e.target.value) || 21)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-fin" className="text-xs font-medium text-muted-foreground">
              Fin estimado
            </Label>
            <Input
              id="plan-fin"
              type="date"
              value={form.fecha_fin}
              onChange={(e) => set("fecha_fin", e.target.value)}
            />
          </div>
        </div>

        {/* indicador visual de rango */}
        {form.fecha_coccion && form.fecha_fin && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: form.color }}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">
              {new Date(form.fecha_coccion).toLocaleDateString("es-AR", {
                day: "numeric", month: "long",
              })}
              {" "}→{" "}
              {new Date(form.fecha_fin).toLocaleDateString("es-AR", {
                day: "numeric", month: "long", year: "numeric",
              })}
              {" · "}
              <strong className="text-foreground">{form.duracion_dias} días</strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Color de identificación ──────────────────────────────── */}
      <div>
        <SeccionLabel icon={Palette} label="Color de identificación" />
        <div className="flex items-center gap-3 flex-wrap">
          {/* swatch preview grande */}
          <div
            className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-md shrink-0 transition-all"
            style={{ background: form.color }}
            aria-label={`Color seleccionado: ${form.color}`}
            role="img"
          />
          {/* paleta predefinida */}
          <div className="flex gap-2 flex-wrap items-center">
            {COLORES_PLAN.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("color", c)}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all duration-150",
                  "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  form.color === c
                    ? "border-white scale-110 shadow-md"
                    : "border-transparent hover:border-white/50"
                )}
                style={{ background: c }}
                aria-label={`Color ${c}`}
                aria-pressed={form.color === c}
              />
            ))}
            {/* color personalizado */}
            <label
              className="w-7 h-7 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors"
              title="Color personalizado"
              aria-label="Elegir color personalizado"
            >
              <span className="text-[10px] text-muted-foreground font-bold">+</span>
              <input
                type="color"
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className="sr-only"
                aria-label="Color personalizado"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── Notas ─────────────────────────────────────────────────── */}
      <div>
        <SeccionLabel icon={StickyNote} label="Notas" />
        <Textarea
          id="plan-notas"
          rows={2}
          value={form.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Observaciones, referencias de receta, notas del elaborador…"
          className="resize-none"
        />
      </div>

      {/* ── Tareas ────────────────────────────────────────────────── */}
      <div>
        <SeccionLabel icon={ClipboardList} label={`Tareas${form.tareas.length > 0 ? ` (${form.tareas.length})` : ""}`} />

        {/* lista de tareas existentes */}
        {form.tareas.length > 0 && (
          <ul className="space-y-2 mb-3" role="list" aria-label="Lista de tareas">
            {form.tareas.map((t, i) => (
              <li key={i} className="flex gap-2 items-center group/tarea">
                <div className="flex-1 flex gap-2 items-center bg-muted/30 rounded-lg px-2 py-1.5 border border-border/60">
                  <Input
                    className="h-7 text-xs flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={t.nombre}
                    onChange={(e) => updTarea(i, "nombre", e.target.value)}
                    aria-label={`Nombre de tarea ${i + 1}`}
                    placeholder="Nombre de la tarea"
                  />
                  <Input
                    type="date"
                    className="h-7 text-xs w-34 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-muted-foreground"
                    value={t.fecha_estimada}
                    onChange={(e) => updTarea(i, "fecha_estimada", e.target.value)}
                    aria-label={`Fecha estimada de tarea ${i + 1}`}
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover/tarea:opacity-100 transition-all"
                  onClick={() => remTarea(i)}
                  aria-label={`Eliminar tarea: ${t.nombre}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {/* atajos de tareas predefinidas */}
        <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Tareas predefinidas">
          {TAREAS_PREDEFINIDAS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => addTarea(t)}
              className={cn(
                "px-2.5 h-7 text-xs rounded-full",
                "border border-border bg-muted/20 hover:bg-muted/60",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                // evitar duplicados visualmente
                form.tareas.some((ta) => ta.nombre === t)
                  ? "opacity-40 cursor-default"
                  : ""
              )}
              aria-label={`Agregar tarea: ${t}`}
              aria-disabled={form.tareas.some((ta) => ta.nombre === t)}
            >
              + {t}
            </button>
          ))}
        </div>

        {/* tarea personalizada */}
        <div className="flex gap-2" role="group" aria-label="Agregar tarea personalizada">
          <Input
            className="h-8 text-xs"
            placeholder="Tarea personalizada…"
            value={nuevaTarea}
            onChange={(e) => setNuevaTarea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addTarea(nuevaTarea); }
            }}
            aria-label="Nombre de nueva tarea personalizada"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={() => addTarea(nuevaTarea)}
            aria-label="Agregar tarea personalizada"
            disabled={!nuevaTarea.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <p
          id="plan-error"
          role="alert"
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}

      {/* ── Acciones ──────────────────────────────────────────────── */}
      <div className="flex gap-2.5 pt-1">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-2 min-w-[140px]"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
                aria-hidden
              />
              Guardando…
            </span>
          ) : initial ? "Actualizar plan" : "Crear plan"}
        </Button>
      </div>
    </form>
  );
}
