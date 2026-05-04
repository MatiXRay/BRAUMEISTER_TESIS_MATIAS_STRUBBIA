"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Trash2, CalendarPlus, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { PlanForm } from "./PlanForm";
import { PlanItem, PlanFormData } from "./types";
import { cn } from "@/lib/utils";

/* ─── Constantes de layout ─────────────────────────────────────── */
const PX_DIA      = 36;   // ancho en px por día
const ROW_H       = 64;   // altura de cada fila de fermentador
const HEADER_H    = 48;   // altura del header de fechas
const OVERVIEW_H  = 44;   // altura de la fila resumen de planes
const LABEL_W     = 160;  // ancho de la columna de etiquetas
const DIAS_ATRAS  = 14;   // días previos al hoy visibles al inicio
const DIAS_TOTAL  = 150;  // total de días en el timeline

interface CatItem { _id: string; nombre?: string; duracion_dias?: number; color?: string; }

/* ─── Utilidades de fecha ───────────────────────────────────────── */
function addDias(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function fechaToX(base: Date, fecha: Date) {
  return Math.round((fecha.getTime() - base.getTime()) / 86400000) * PX_DIA;
}
function xToFecha(base: Date, x: number) {
  return addDias(base, Math.round(x / PX_DIA));
}
function toISO(d: Date) { return d.toISOString().split("T")[0]; }
function formatFechaCorta(d: Date) {
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

/* ─── Tooltip de bloque ─────────────────────────────────────────── */
function BloqueTooltip({ plan, visible }: { plan: PlanItem; visible: boolean }) {
  const inicio = new Date(plan.fecha_coccion);
  const fin    = new Date(plan.fecha_fin);
  return (
    <div
      role="tooltip"
      className={cn(
        "absolute -top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none",
        "bg-popover border border-border rounded-lg shadow-xl px-3 py-2",
        "text-xs text-popover-foreground whitespace-nowrap transition-all duration-150",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      )}
    >
      <p className="font-semibold text-sm mb-0.5">{plan.nombre}</p>
      <p className="text-muted-foreground">
        {formatFechaCorta(inicio)} → {formatFechaCorta(fin)} · {plan.duracion_dias} días
      </p>
      {plan.estilo_nombre && (
        <p className="text-muted-foreground">{plan.estilo_nombre}</p>
      )}
      {/* triángulo */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 overflow-hidden">
        <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 translate-y-[-50%] mx-auto" />
      </div>
    </div>
  );
}

/* ─── Bloque arrastrable del Gantt ──────────────────────────────── */
function PlanBloque({
  plan, baseDate, onClick, onDragEnd,
}: {
  plan: PlanItem;
  baseDate: Date;
  onClick: () => void;
  onDragEnd: (id: string, daysDelta: number) => void;
}) {
  const inicio = new Date(plan.fecha_coccion);
  const fin    = new Date(plan.fecha_fin);
  const x      = fechaToX(baseDate, inicio);
  const w      = Math.max(PX_DIA * 2, fechaToX(baseDate, fin) - x);

  const dragRef        = useRef<{ startX: number } | null>(null);
  const [delta, setDelta]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered]   = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragRef.current = { startX: e.clientX };
    setDragging(true);
    setHovered(false);
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setDelta(ev.clientX - dragRef.current.startX);
    };
    const up = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const daysDelta = Math.round((ev.clientX - dragRef.current.startX) / PX_DIA);
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
  const showTooltip  = hovered && !dragging;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Plan ${plan.nombre}, ${plan.duracion_dias} días, desde ${toISO(inicio)} hasta ${toISO(fin)}`}
      className={cn(
        "absolute rounded-lg text-white text-xs font-semibold",
        "flex items-center gap-1.5 px-2.5 select-none",
        "border border-white/20 shadow-md",
        "cursor-grab active:cursor-grabbing",
        "transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        dragging ? "opacity-60 shadow-xl scale-[1.01] z-20" : "hover:shadow-lg z-10"
      )}
      style={{
        left:       x + snappedDelta,
        top:        10,
        width:      w - 3,
        height:     ROW_H - 20,
        background: plan.color,
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (Math.abs(delta) < 5) { e.stopPropagation(); onClick(); }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
      }}
    >
      {/* icono de arrastre */}
      <GripHorizontal className="h-3 w-3 opacity-50 shrink-0" aria-hidden />
      <span className="truncate flex-1 leading-none">{plan.nombre}</span>
      <span
        className="shrink-0 text-[10px] font-normal opacity-70 bg-black/20 rounded px-1 py-0.5"
        aria-hidden
      >
        {plan.duracion_dias}d
      </span>
      <BloqueTooltip plan={plan} visible={showTooltip} />
    </div>
  );
}

/* ─── Componente principal ──────────────────────────────────────── */
export function PlanificacionTimeline({
  initialPlanes, estilos, fermentadores,
}: {
  initialPlanes: PlanItem[];
  estilos:       CatItem[];
  fermentadores: CatItem[];
}) {
  const { getToken } = useAuth();
  const [planes, setPlanes]               = useState<PlanItem[]>(initialPlanes);
  const [modalOpen, setModalOpen]         = useState(false);
  const [editando, setEditando]           = useState<PlanItem | null>(null);
  const [nuevaFecha, setNuevaFecha]       = useState("");
  const [nuevoFvId, setNuevoFvId]         = useState("");
  const [nuevoFvNombre, setNuevoFvNombre] = useState("");
  const [eliminando, setEliminando]       = useState<string | null>(null);

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const baseDate = addDias(today, -DIAS_ATRAS);
  const token    = async () => (await getToken()) ?? "";

  /* ── acciones ── */
  const abrirNuevo = (fecha: string, fvId: string, fvNombre: string) => {
    setEditando(null);
    setNuevaFecha(fecha);
    setNuevoFvId(fvId);
    setNuevoFvNombre(fvNombre);
    setModalOpen(true);
  };

  const abrirEdicion = (plan: PlanItem) => {
    setEditando(plan);
    setModalOpen(true);
  };

  const cerrar = () => { setModalOpen(false); setEditando(null); };

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
      cerrar();
    } finally { setEliminando(null); }
  };

  const handleDragEnd = useCallback(async (id: string, daysDelta: number) => {
    const plan = planes.find((p) => p._id === id);
    if (!plan) return;
    const newInicio = addDias(new Date(plan.fecha_coccion), daysDelta);
    const newFin    = addDias(new Date(plan.fecha_fin), daysDelta);
    const payload = {
      fecha_coccion:      toISO(newInicio),
      fecha_fin:          toISO(newFin),
      duracion_dias:      plan.duracion_dias,
      fermentador_id:     plan.fermentador_id,
      fermentador_nombre: plan.fermentador_nombre,
    };
    setPlanes((p) => p.map((x) => x._id === id
      ? { ...x, fecha_coccion: newInicio.toISOString(), fecha_fin: newFin.toISOString() }
      : x
    ));
    try {
      await apiFetch<PlanItem>(`/planificacion/${id}/mover`, await token(), {
        method: "PATCH", body: JSON.stringify(payload),
      });
    } catch {
      setPlanes((p) => p.map((x) => x._id === id ? plan : x));
    }
  }, [planes]);

  /* ── datos derivados ── */
  const filas: { id: string; nombre: string }[] = [
    ...fermentadores.map((f) => ({ id: f._id!, nombre: f.nombre! })),
    { id: "", nombre: "Sin asignar" },
  ];

  const dias   = Array.from({ length: DIAS_TOTAL }, (_, i) => addDias(baseDate, i));
  const todayX = fechaToX(baseDate, today);
  const totalW = DIAS_TOTAL * PX_DIA;

  /* ── grupos de meses para el header ── */
  const monthGroups: { label: string; startX: number; endX: number }[] = [];
  let currentMonth = -1;
  dias.forEach((d, i) => {
    if (d.getMonth() !== currentMonth) {
      currentMonth = d.getMonth();
      monthGroups.push({
        label: d.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
        startX: i * PX_DIA,
        endX: 0,
      });
    }
    if (monthGroups.length > 0) {
      monthGroups[monthGroups.length - 1].endX = (i + 1) * PX_DIA;
    }
  });

  return (
    <div className="flex flex-col gap-5">
      {/* ── Cabecera de página ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planificación</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {planes.length === 0
              ? "Sin planes activos"
              : `${planes.length} ${planes.length === 1 ? "plan activo" : "planes activos"} · arrastrá los bloques para reprogramar`
            }
          </p>
        </div>
        <Button
          onClick={() => abrirNuevo(toISO(today), "", "")}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden />
          Nuevo plan
        </Button>
      </div>

      {/* ── Estado vacío ── */}
      {planes.length === 0 && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center py-20 gap-4 text-center"
        >
          <div className="rounded-full bg-muted/50 p-4">
            <CalendarPlus className="h-8 w-8 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-foreground">Sin planes de producción</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Creá tu primer plan para visualizarlo en el timeline Gantt
            </p>
          </div>
          <Button
            onClick={() => abrirNuevo(toISO(today), "", "")}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Crear primer plan
          </Button>
        </div>
      )}

      {/* ── Timeline Gantt ── */}
      {planes.length > 0 && (
        <div
          role="region"
          aria-label="Timeline de planificación"
          className="rounded-xl border border-border overflow-hidden bg-card shadow-sm"
        >
          <div className="overflow-x-auto">
            <div style={{ width: LABEL_W + totalW, minWidth: "100%" }}>

              {/* ── Fila resumen: barras de todos los planes ── */}
              <div
                className="flex border-b border-border bg-muted/30"
                style={{ height: OVERVIEW_H }}
              >
                <div
                  className="shrink-0 border-r border-border flex items-center px-4"
                  style={{ width: LABEL_W }}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Resumen
                  </span>
                </div>
                <div className="relative" style={{ width: totalW, height: OVERVIEW_H }}>
                  {planes.map((plan) => {
                    const px = fechaToX(baseDate, new Date(plan.fecha_coccion));
                    const pw = Math.max(
                      PX_DIA * 2,
                      fechaToX(baseDate, new Date(plan.fecha_fin)) - px
                    );
                    return (
                      <button
                        key={plan._id}
                        className={cn(
                          "absolute top-2 rounded-full text-white text-[10px] font-semibold",
                          "flex items-center gap-1 px-2.5 border border-white/20 shadow-sm",
                          "hover:brightness-110 hover:shadow-md transition-all duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                          "truncate"
                        )}
                        style={{
                          left:       px,
                          width:      pw - 2,
                          height:     OVERVIEW_H - 16,
                          background: plan.color,
                        }}
                        onClick={() => abrirEdicion(plan)}
                        aria-label={`Editar plan ${plan.nombre}`}
                        title={`${plan.nombre} · ${plan.duracion_dias}d`}
                      >
                        <span className="truncate">{plan.nombre}</span>
                        <span className="opacity-60 shrink-0 ml-auto">{plan.duracion_dias}d</span>
                      </button>
                    );
                  })}
                  {/* línea hoy en resumen */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-emerald-500/40 pointer-events-none"
                    style={{ left: todayX }}
                    aria-hidden
                  />
                </div>
              </div>

              {/* ── Header de fechas (sticky) ── */}
              <div
                className="flex sticky top-0 z-20 bg-card border-b border-border"
                style={{ height: HEADER_H }}
                role="rowgroup"
                aria-label="Escala de fechas"
              >
                <div
                  className="shrink-0 border-r border-border flex items-center px-4"
                  style={{ width: LABEL_W }}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Fermentador
                  </span>
                </div>
                <div className="relative" style={{ width: totalW }}>
                  {/* Nombres de mes */}
                  {monthGroups.map((g, i) => (
                    <div
                      key={i}
                      className="absolute top-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pointer-events-none capitalize"
                      style={{ left: g.startX + 4 }}
                      aria-hidden
                    >
                      {g.label}
                    </div>
                  ))}
                  {/* Números de día */}
                  {dias.map((d, i) => {
                    const isMonday  = d.getDay() === 1;
                    const isFirst   = i === 0 || d.getDate() === 1;
                    if (!isFirst && !isMonday) return null;
                    const isToday   = toISO(d) === toISO(today);
                    return (
                      <div
                        key={i}
                        className={cn(
                          "absolute bottom-2 text-[10px] font-semibold pointer-events-none",
                          isToday ? "text-emerald-500" : "text-muted-foreground/80"
                        )}
                        style={{ left: i * PX_DIA + 3 }}
                        aria-hidden
                      >
                        {d.getDate() === 1 || i === 0
                          ? d.toLocaleDateString("es-AR", { day: "numeric" })
                          : d.getDate()}
                      </div>
                    );
                  })}
                  {/* Línea + etiqueta HOY */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-10 pointer-events-none"
                    style={{ left: todayX }}
                    aria-hidden
                  >
                    <span className="absolute top-1.5 left-1.5 text-[9px] text-emerald-500 font-bold uppercase tracking-wider whitespace-nowrap">
                      Hoy
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Filas por fermentador ── */}
              {filas.map((fila, filaIdx) => {
                const planesRow = planes.filter((p) =>
                  fila.id ? p.fermentador_id === fila.id : !p.fermentador_id
                );
                return (
                  <div
                    key={fila.id || "none"}
                    role="row"
                    aria-label={`Fermentador: ${fila.nombre}`}
                    className={cn(
                      "flex border-b border-border last:border-0 group",
                      "hover:bg-muted/8 transition-colors duration-100",
                      filaIdx % 2 === 0 ? "" : "bg-muted/[0.03]"
                    )}
                    style={{ height: ROW_H }}
                  >
                    {/* etiqueta lateral */}
                    <div
                      className="shrink-0 border-r border-border flex items-center px-4 gap-2.5"
                      style={{ width: LABEL_W }}
                    >
                      {/* indicador de color si tiene planes */}
                      {planesRow.length > 0 && (
                        <div
                          className="w-1.5 h-6 rounded-full shrink-0"
                          style={{ background: planesRow[0].color }}
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate leading-tight",
                          fila.id ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {fila.nombre}
                        </p>
                        {planesRow.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {planesRow.length} {planesRow.length === 1 ? "plan" : "planes"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* área del gantt */}
                    <div
                      role="gridcell"
                      className="relative flex-1 cursor-crosshair overflow-visible"
                      style={{ width: totalW }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        abrirNuevo(
                          toISO(xToFecha(baseDate, e.clientX - rect.left)),
                          fila.id,
                          fila.nombre
                        );
                      }}
                    >
                      {/* columnas de fondo */}
                      {dias.map((d, i) => (
                        <div
                          key={i}
                          className={cn(
                            "absolute top-0 bottom-0",
                            d.getDay() === 0 || d.getDay() === 6
                              ? "bg-muted/20"
                              : "",
                            d.getDay() === 1
                              ? "border-l border-border/60"
                              : "border-l border-border/20"
                          )}
                          style={{ left: i * PX_DIA, width: PX_DIA }}
                          aria-hidden
                        />
                      ))}

                      {/* línea hoy */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-emerald-500/25 z-10 pointer-events-none"
                        style={{ left: todayX }}
                        aria-hidden
                      />

                      {/* bloques de plan */}
                      {planesRow.map((plan) => (
                        <PlanBloque
                          key={plan._id}
                          plan={plan}
                          baseDate={baseDate}
                          onClick={() => abrirEdicion(plan)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}

                      {/* hint en filas vacías */}
                      {planesRow.length === 0 && (
                        <div
                          className="absolute inset-0 flex items-center pl-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                          aria-hidden
                        >
                          <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            Clic para agregar plan
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de creación / edición ── */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) cerrar(); }}>
        <DialogContent
          className="max-w-xl w-full max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden"
          aria-modal="true"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-lg font-bold">
                {editando ? editando.nombre : "Nuevo plan de producción"}
              </span>
              {editando && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  disabled={eliminando === editando._id}
                  onClick={() => handleEliminar(editando._id)}
                  aria-label="Eliminar plan"
                  title="Eliminar plan"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
            {editando && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Editando plan · los cambios se guardan al confirmar
              </p>
            )}
          </DialogHeader>

          {/* PlanForm con scroll interno */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <PlanForm
              initial={editando ? {
                ...editando,
                fecha_coccion: new Date(editando.fecha_coccion).toISOString().split("T")[0],
                fecha_fin:     new Date(editando.fecha_fin).toISOString().split("T")[0],
                tareas: editando.tareas.map((t) => ({
                  ...t,
                  fecha_estimada: t.fecha_estimada
                    ? new Date(t.fecha_estimada).toISOString().split("T")[0]
                    : "",
                })),
              } : undefined}
              initialFecha={nuevaFecha}
              initialFermentadorId={nuevoFvId}
              initialFermentadorNombre={nuevoFvNombre}
              onSubmit={handleGuardar}
              onCancel={cerrar}
              estilos={estilos}
              fermentadores={fermentadores}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
