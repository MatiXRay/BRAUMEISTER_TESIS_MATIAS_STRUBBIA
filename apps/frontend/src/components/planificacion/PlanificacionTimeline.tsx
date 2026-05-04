"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { PlanForm } from "./PlanForm";
import { PlanItem, PlanFormData } from "./types";
import { cn } from "@/lib/utils";

const PX_DIA    = 30;
const ROW_H     = 56;
const HEADER_H  = 52;
const LABEL_W   = 120;
const DIAS_ATRAS  = 30;
const DIAS_TOTAL  = 180;

interface CatItem { _id: string; nombre?: string; duracion_dias?: number; color?: string; }

function addDias(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function fechaToX(base: Date, fecha: Date) {
  return Math.round((fecha.getTime() - base.getTime()) / 86400000) * PX_DIA;
}

function xToFecha(base: Date, x: number) {
  const dias = Math.round(x / PX_DIA);
  return addDias(base, dias);
}

function toISO(d: Date) { return d.toISOString().split("T")[0]; }

// ── Bloque en el timeline ────────────────────────────────────
function PlanBloque({
  plan, baseDate, onClick, onDragEnd,
}: {
  plan: PlanItem; baseDate: Date;
  onClick: () => void;
  onDragEnd: (id: string, deltaX: number) => void;
}) {
  const inicio  = new Date(plan.fecha_coccion);
  const fin     = new Date(plan.fecha_fin);
  const x       = fechaToX(baseDate, inicio);
  const w       = Math.max(PX_DIA, fechaToX(baseDate, fin) - x);

  const dragRef   = useRef<{ startX: number } | null>(null);
  const [delta, setDelta] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragRef.current = { startX: e.clientX };
    setDragging(true);

    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const d = ev.clientX - dragRef.current.startX;
      setDelta(d);
    };
    const up = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const rawDelta = ev.clientX - dragRef.current.startX;
      const daysDelta = Math.round(rawDelta / PX_DIA);
      dragRef.current = null;
      setDelta(0);
      setDragging(false);
      if (daysDelta !== 0) onDragEnd(plan._id, daysDelta);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const snappedDelta = Math.round(delta / PX_DIA) * PX_DIA;

  return (
    <div
      className={cn(
        "absolute top-2 rounded-md text-white text-xs font-medium flex items-center px-2 gap-1 select-none",
        "shadow-md border border-white/20 cursor-grab active:cursor-grabbing transition-opacity",
        dragging && "opacity-75 z-20"
      )}
      style={{
        left: x + snappedDelta,
        width: w - 4,
        height: ROW_H - 16,
        background: plan.color,
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => { if (Math.abs(delta) < 5) { e.stopPropagation(); onClick(); } }}
      title={`${plan.nombre} · ${plan.duracion_dias}d`}
    >
      <span className="truncate flex-1">{plan.nombre}</span>
      <span className="opacity-60 text-[10px] shrink-0">{plan.duracion_dias}d</span>
      {plan.tareas.length > 0 && (
        <span className="opacity-70 text-[10px] shrink-0">·{plan.tareas.length}✓</span>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export function PlanificacionTimeline({
  initialPlanes, estilos, fermentadores,
}: {
  initialPlanes: PlanItem[];
  estilos:       CatItem[];
  fermentadores: CatItem[];
}) {
  const { getToken } = useAuth();
  const [planes, setPlanes] = useState<PlanItem[]>(initialPlanes);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editando, setEditando] = useState<PlanItem | null>(null);
  const [nuevaFecha, setNuevaFecha]  = useState("");
  const [nuevoFvId, setNuevoFvId]   = useState("");
  const [nuevoFvNombre, setNuevoFvNombre] = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const baseDate = addDias(today, -DIAS_ATRAS);

  const token = async () => (await getToken()) ?? "";

  const abrirNuevo = (fecha: string, fvId: string, fvNombre: string) => {
    setEditando(null);
    setNuevaFecha(fecha);
    setNuevoFvId(fvId);
    setNuevoFvNombre(fvNombre);
    setPanelOpen(true);
  };

  const abrirEdicion = (plan: PlanItem) => {
    setEditando(plan);
    setPanelOpen(true);
  };

  const cerrar = () => { setPanelOpen(false); setEditando(null); };

  const handleGuardar = async (data: PlanFormData) => {
    const t = await token();
    if (editando) {
      const updated = await apiFetch<PlanItem>(`/planificacion/${editando._id}`, t, {
        method: "PUT", body: JSON.stringify(data),
      });
      setPlanes((p) => p.map((x) => x._id === editando._id ? updated : x));
    } else {
      const nuevo = await apiFetch<PlanItem>("/planificacion", t, {
        method: "POST", body: JSON.stringify(data),
      });
      setPlanes((p) => [...p, nuevo]);
    }
    cerrar();
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este plan?")) return;
    setEliminando(id);
    try {
      await apiFetch(`/planificacion/${id}`, await token(), { method: "DELETE" });
      setPlanes((p) => p.filter((x) => x._id !== id));
    } finally { setEliminando(null); }
  };

  const handleDragEnd = useCallback(async (id: string, daysDelta: number) => {
    const plan = planes.find((p) => p._id === id);
    if (!plan) return;
    const newInicio = addDias(new Date(plan.fecha_coccion), daysDelta);
    const newFin    = addDias(new Date(plan.fecha_fin),     daysDelta);
    const payload = {
      fecha_coccion:     toISO(newInicio),
      fecha_fin:         toISO(newFin),
      duracion_dias:     plan.duracion_dias,
      fermentador_id:    plan.fermentador_id,
      fermentador_nombre: plan.fermentador_nombre,
    };
    setPlanes((p) => p.map((x) => x._id === id
      ? { ...x, fecha_coccion: newInicio.toISOString(), fecha_fin: newFin.toISOString() }
      : x
    ));
    try {
      const t = await token();
      await apiFetch<PlanItem>(`/planificacion/${id}/mover`, t, {
        method: "PATCH", body: JSON.stringify(payload),
      });
    } catch {
      setPlanes((p) => p.map((x) => x._id === id ? plan : x));
    }
  }, [planes]);

  // Filas del timeline: fermentadores + "Sin asignar"
  const filas: { id: string; nombre: string }[] = [
    ...fermentadores.map((f) => ({ id: f._id!, nombre: f.nombre! })),
    { id: "", nombre: "Sin asignar" },
  ];

  const dias = Array.from({ length: DIAS_TOTAL }, (_, i) => addDias(baseDate, i));
  const todayX = fechaToX(baseDate, today);
  const totalW = DIAS_TOTAL * PX_DIA;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planificación</h1>
          <p className="text-sm text-muted-foreground mt-1">{planes.length} planes activos · arrastrá para mover</p>
        </div>
        <Button onClick={() => abrirNuevo(toISO(today), "", "")}>
          <Plus className="h-4 w-4 mr-2" />Nuevo plan
        </Button>
      </div>

      <div className="flex gap-4 items-start">
        {/* ── TIMELINE ────────────────────────────────────────── */}
        <div className="flex-1 rounded-xl border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <div style={{ width: LABEL_W + totalW, minWidth: "100%" }}>
              {/* Header de fechas */}
              <div className="flex sticky top-0 z-10 bg-card border-b border-border" style={{ height: HEADER_H }}>
                <div className="shrink-0 border-r border-border flex items-end pb-2 px-3"
                  style={{ width: LABEL_W }}>
                  <span className="text-xs text-muted-foreground font-medium">Fermentador</span>
                </div>
                <div className="relative" style={{ width: totalW }}>
                  {dias.map((d, i) => {
                    const isFirst = i === 0 || d.getDate() === 1;
                    const isMonday = d.getDay() === 1;
                    const isSunday = d.getDay() === 0;
                    if (!isFirst && !isMonday) return null;
                    return (
                      <div key={i} className="absolute bottom-0 text-[10px] text-muted-foreground pb-1"
                        style={{ left: i * PX_DIA + 2 }}>
                        {d.getDate() === 1 || i === 0
                          ? d.toLocaleDateString("es", { month: "short", day: "numeric" })
                          : d.getDate()}
                      </div>
                    );
                  })}
                  {/* Línea de hoy */}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-emerald-500 z-20"
                    style={{ left: todayX }}>
                    <span className="absolute -top-1 left-1 text-[9px] text-emerald-400 font-bold whitespace-nowrap">HOY</span>
                  </div>
                </div>
              </div>

              {/* Filas por fermentador */}
              {filas.map((fila) => {
                const planesRow = planes.filter((p) =>
                  fila.id ? p.fermentador_id === fila.id : !p.fermentador_id
                );
                return (
                  <div key={fila.id || "none"} className="flex border-b border-border last:border-0"
                    style={{ height: ROW_H }}>
                    {/* Etiqueta fila */}
                    <div className="shrink-0 border-r border-border flex items-center px-3"
                      style={{ width: LABEL_W }}>
                      <span className="text-xs font-medium truncate">{fila.nombre}</span>
                    </div>
                    {/* Celdas del timeline */}
                    <div className="relative flex-1 cursor-pointer group"
                      style={{ width: totalW }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const d = xToFecha(baseDate, x);
                        abrirNuevo(toISO(d), fila.id, fila.nombre);
                      }}>
                      {/* Fondo de días */}
                      {dias.map((d, i) => (
                        <div key={i}
                          className={cn(
                            "absolute top-0 bottom-0 border-r border-border/30",
                            d.getDay() === 0 || d.getDay() === 6 ? "bg-muted/20" : "",
                            d.getDay() === 1 ? "border-r border-border/60" : ""
                          )}
                          style={{ left: i * PX_DIA, width: PX_DIA }}
                        />
                      ))}
                      {/* Línea de hoy */}
                      <div className="absolute top-0 bottom-0 w-[2px] bg-emerald-500/30 z-10 pointer-events-none"
                        style={{ left: todayX }} />
                      {/* Bloques de planes */}
                      {planesRow.map((plan) => (
                        <PlanBloque
                          key={plan._id}
                          plan={plan}
                          baseDate={baseDate}
                          onClick={() => abrirEdicion(plan)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                      {/* Hint vacío */}
                      {planesRow.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-xs text-muted-foreground">Click para agregar</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── PANEL LATERAL ────────────────────────────────────── */}
        {panelOpen && (
          <div className="w-80 shrink-0 rounded-xl border border-border bg-card p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">
                {editando ? `Editar: ${editando.nombre}` : "Nuevo plan"}
              </h3>
              {editando && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  disabled={eliminando === editando._id}
                  onClick={() => handleEliminar(editando._id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <PlanForm
              initial={editando
                ? {
                    ...editando,
                    fecha_coccion: new Date(editando.fecha_coccion).toISOString().split("T")[0],
                    fecha_fin:     new Date(editando.fecha_fin).toISOString().split("T")[0],
                    tareas: editando.tareas.map((t) => ({
                      ...t, fecha_estimada: t.fecha_estimada ? new Date(t.fecha_estimada).toISOString().split("T")[0] : "",
                    })),
                  }
                : undefined}
              initialFecha={nuevaFecha}
              initialFermentadorId={nuevoFvId}
              initialFermentadorNombre={nuevoFvNombre}
              onSubmit={handleGuardar}
              onCancel={cerrar}
              estilos={estilos}
              fermentadores={fermentadores}
            />
          </div>
        )}
      </div>

      {/* Leyenda */}
      {planes.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {planes.map((p) => (
            <div key={p._id} className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={() => abrirEdicion(p)}>
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: p.color }} />
              <span>{p.nombre}</span>
              <Pencil className="h-2.5 w-2.5 opacity-40" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
