"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Trash2, X } from "lucide-react";
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

const PX_DIA      = 32;
const ROW_H       = 52;
const HEADER_H    = 44;
const LABEL_ROW_H = 36;
const LABEL_W     = 140;
const DIAS_ATRAS  = 14;
const DIAS_TOTAL  = 150;

interface CatItem { _id: string; nombre?: string; duracion_dias?: number; color?: string; }

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

function PlanBloque({
  plan, baseDate, onClick, onDragEnd,
}: {
  plan: PlanItem; baseDate: Date;
  onClick: () => void;
  onDragEnd: (id: string, daysDelta: number) => void;
}) {
  const inicio = new Date(plan.fecha_coccion);
  const fin    = new Date(plan.fecha_fin);
  const x      = fechaToX(baseDate, inicio);
  const w      = Math.max(PX_DIA * 2, fechaToX(baseDate, fin) - x);

  const dragRef = useRef<{ startX: number } | null>(null);
  const [delta, setDelta] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragRef.current = { startX: e.clientX };
    setDragging(true);
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

  return (
    <div
      className={cn(
        "absolute top-1.5 rounded-md text-white text-[11px] font-medium",
        "flex items-center px-2 select-none shadow border border-white/15",
        "cursor-grab active:cursor-grabbing",
        dragging ? "opacity-70 z-20" : "z-10"
      )}
      style={{
        left: x + snappedDelta,
        width: w - 2,
        height: ROW_H - 12,
        background: plan.color,
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => { if (Math.abs(delta) < 5) { e.stopPropagation(); onClick(); } }}
      title={`${plan.nombre} · ${plan.duracion_dias}d · ${toISO(inicio)} → ${toISO(fin)}`}
    >
      <span className="truncate flex-1">{plan.nombre}</span>
      <span className="opacity-60 text-[9px] shrink-0 ml-1">{plan.duracion_dias}d</span>
    </div>
  );
}

export function PlanificacionTimeline({
  initialPlanes, estilos, fermentadores,
}: {
  initialPlanes: PlanItem[];
  estilos:       CatItem[];
  fermentadores: CatItem[];
}) {
  const { getToken } = useAuth();
  const [planes, setPlanes]         = useState<PlanItem[]>(initialPlanes);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editando, setEditando]     = useState<PlanItem | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevoFvId, setNuevoFvId]   = useState("");
  const [nuevoFvNombre, setNuevoFvNombre] = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const baseDate = addDias(today, -DIAS_ATRAS);
  const token    = async () => (await getToken()) ?? "";

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
      : x));
    try {
      await apiFetch<PlanItem>(`/planificacion/${id}/mover`, await token(), {
        method: "PATCH", body: JSON.stringify(payload),
      });
    } catch {
      setPlanes((p) => p.map((x) => x._id === id ? plan : x));
    }
  }, [planes]);

  const filas: { id: string; nombre: string }[] = [
    ...fermentadores.map((f) => ({ id: f._id!, nombre: f.nombre! })),
    { id: "", nombre: "Sin asignar" },
  ];

  const dias   = Array.from({ length: DIAS_TOTAL }, (_, i) => addDias(baseDate, i));
  const todayX = fechaToX(baseDate, today);
  const totalW = DIAS_TOTAL * PX_DIA;

  const modalTitle = editando ? editando.nombre : "Nuevo plan";

  return (
    <div className="flex flex-col gap-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planificación</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {planes.length} {planes.length === 1 ? "plan activo" : "planes activos"} · arrastrá los bloques para mover
          </p>
        </div>
        <Button onClick={() => abrirNuevo(toISO(today), "", "")}>
          <Plus className="h-4 w-4 mr-2" />Nuevo plan
        </Button>
      </div>

      {/* TIMELINE — ocupa todo el ancho siempre */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <div style={{ width: LABEL_W + totalW, minWidth: "100%" }}>

            {/* Fila de etiquetas de planes (sobre el calendario) */}
            <div className="flex border-b border-border bg-muted/20" style={{ height: LABEL_ROW_H }}>
              <div
                className="shrink-0 border-r border-border flex items-center px-3"
                style={{ width: LABEL_W }}
              >
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                  Planes
                </span>
              </div>
              <div className="relative" style={{ width: totalW, height: LABEL_ROW_H }}>
                {planes.map((plan) => {
                  const px = fechaToX(baseDate, new Date(plan.fecha_coccion));
                  const pw = Math.max(
                    PX_DIA * 2,
                    fechaToX(baseDate, new Date(plan.fecha_fin)) - px
                  );
                  return (
                    <button
                      key={plan._id}
                      className="absolute top-1.5 rounded-full text-white text-[10px] font-semibold px-2.5 flex items-center gap-1 border border-white/20 shadow-sm hover:brightness-110 transition-all cursor-pointer truncate"
                      style={{
                        left: px,
                        width: pw - 2,
                        height: LABEL_ROW_H - 12,
                        background: plan.color,
                      }}
                      onClick={() => abrirEdicion(plan)}
                      title={`${plan.nombre} · ${plan.duracion_dias}d`}
                    >
                      <span className="truncate">{plan.nombre}</span>
                      <span className="opacity-60 shrink-0 ml-auto">{plan.duracion_dias}d</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Header de fechas */}
            <div
              className="flex sticky top-0 z-10 bg-card border-b border-border"
              style={{ height: HEADER_H }}
            >
              <div
                className="shrink-0 border-r border-border flex items-end pb-2 px-3"
                style={{ width: LABEL_W }}
              >
                <span className="text-[10px] text-muted-foreground font-medium">Fermentador</span>
              </div>
              <div className="relative" style={{ width: totalW }}>
                {dias.map((d, i) => {
                  const isFirst  = i === 0 || d.getDate() === 1;
                  const isMonday = d.getDay() === 1;
                  if (!isFirst && !isMonday) return null;
                  return (
                    <div
                      key={i}
                      className="absolute bottom-0 text-[10px] text-muted-foreground pb-1.5 font-medium pointer-events-none"
                      style={{ left: i * PX_DIA + 2 }}
                    >
                      {d.getDate() === 1 || i === 0
                        ? d.toLocaleDateString("es", { month: "short", day: "numeric" })
                        : d.getDate()}
                    </div>
                  );
                })}
                <div
                  className="absolute top-0 bottom-0 w-px bg-emerald-500 z-10 pointer-events-none"
                  style={{ left: todayX }}
                >
                  <span className="absolute top-1 left-1.5 text-[9px] text-emerald-500 font-bold whitespace-nowrap">
                    HOY
                  </span>
                </div>
              </div>
            </div>

            {/* Filas por fermentador */}
            {filas.map((fila) => {
              const planesRow = planes.filter((p) =>
                fila.id ? p.fermentador_id === fila.id : !p.fermentador_id
              );
              return (
                <div
                  key={fila.id || "none"}
                  className="flex border-b border-border last:border-0 group hover:bg-muted/5 transition-colors"
                  style={{ height: ROW_H }}
                >
                  <div
                    className="shrink-0 border-r border-border flex items-center px-3"
                    style={{ width: LABEL_W }}
                  >
                    <span className="text-xs font-medium truncate text-muted-foreground">
                      {fila.nombre}
                    </span>
                  </div>
                  <div
                    className="relative flex-1 cursor-crosshair"
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
                    {/* Columnas de fondo */}
                    {dias.map((d, i) => (
                      <div
                        key={i}
                        className={cn(
                          "absolute top-0 bottom-0",
                          d.getDay() === 0 || d.getDay() === 6 ? "bg-muted/15" : "",
                          d.getDay() === 1 ? "border-l border-border/50" : "border-l border-border/15"
                        )}
                        style={{ left: i * PX_DIA, width: PX_DIA }}
                      />
                    ))}
                    {/* Línea hoy */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-emerald-500/20 z-10 pointer-events-none"
                      style={{ left: todayX }}
                    />
                    {/* Bloques */}
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
                        <span className="text-[11px] text-muted-foreground">+ click para agregar</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL de creación / edición */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) cerrar(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span>{modalTitle}</span>
              {editando && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive -mt-1"
                  disabled={eliminando === editando._id}
                  onClick={() => handleEliminar(editando._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
