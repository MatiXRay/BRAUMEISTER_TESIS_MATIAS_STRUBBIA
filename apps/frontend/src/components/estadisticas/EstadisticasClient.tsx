"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";
import type { EstadisticasPayload, MesMes } from "./types";

// ── Paleta de colores para estilos (hex, funciona en SVG) ──
const PALETA = ["#4ade80", "#38bdf8", "#fbbf24", "#f97316", "#a78bfa"];

function getPaleta(idx: number) {
  return PALETA[idx % PALETA.length];
}

// ── KPI Card ────────────────────────────────────────────────
function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

// ── Barra horizontal simple ──────────────────────────────────
function HBar({
  label, value, max, unit = "", colorClass = "bg-primary",
}: {
  label: string; value: number; max: number; unit?: string; colorClass?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs text-muted-foreground w-36 truncate shrink-0" title={label}>{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono w-20 text-right shrink-0">{value}{unit}</span>
    </div>
  );
}

// ── Tooltip personalizado ────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-3 text-xs shadow-lg">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-medium">{p.value} L</span>
        </div>
      ))}
    </div>
  );
}

// ── Gráfico producción mensual (stacked) ─────────────────────
function ProduccionMensualChart({ data }: { data: MesMes[] }) {
  if (!data.length) return <p className="text-sm text-muted-foreground">Sin datos en los últimos 12 meses.</p>;

  // Obtener todos los estilos presentes
  const estilosSet = new Set<string>();
  data.forEach((m) => Object.keys(m.estilos).forEach((e) => estilosSet.add(e)));
  const estilos = Array.from(estilosSet);

  // Aplanar datos para recharts
  const chartData = data.map((m) => ({
    label: m.label,
    ...Object.fromEntries(estilos.map((e) => [e, m.estilos[e] ?? 0])),
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {estilos.map((est, i) => (
            <Bar key={est} dataKey={est} stackId="a" fill={getPaleta(i)} radius={i === estilos.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {estilos.map((est, i) => (
          <div key={est} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: getPaleta(i) }} />
            {est}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gráfico litros elaborados vs envasados ────────────────────
function LitrosChart({ data }: { data: EstadisticasPayload["litros"] }) {
  if (!data.length) return <p className="text-sm text-muted-foreground">Sin datos.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="nombre" width={100} tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(v: number, name: string) => [`${v} L`, name === "total_elaborados" ? "Elaborados" : "Envasados"]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        />
        <Legend formatter={(v) => v === "total_elaborados" ? "Elaborados" : "Envasados"} wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="total_elaborados" fill={PALETA[0]} radius={[0, 3, 3, 0]} name="total_elaborados" />
        <Bar dataKey="total_envasados"  fill={PALETA[2]} radius={[0, 3, 3, 0]} name="total_envasados" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Componente principal ─────────────────────────────────────
export function EstadisticasClient({ data }: { data: EstadisticasPayload }) {
  const { kpis, ocupacion, produccion_mensual, estilos, litros, merma, tiempos } = data;

  const maxEstilos  = Math.max(...estilos.map((e) => e.cantidad), 1);
  const maxMerma    = Math.max(...merma.map((m) => m.merma_pct), 1);
  const maxTiempos  = Math.max(...tiempos.map((t) => t.dias_promedio), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>
        <p className="text-sm text-muted-foreground mt-1">Producción · Calidad · Rendimiento</p>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Lotes elaborados"    value={kpis.total_lotes} />
          <KpiCard label="Litros elaborados"   value={`${kpis.total_lts_ferm.toLocaleString()} L`} />
          <KpiCard label="Litros envasados"    value={`${kpis.total_lts_env.toLocaleString()} L`} />
          <KpiCard label="Merma global"        value={kpis.merma_global_pct != null ? `${kpis.merma_global_pct}%` : "—"} />
          <KpiCard label="Prom. por lote"      value={`${kpis.avg_lts_lote} L`} />
          <KpiCard label="Días ferm. promedio" value={kpis.avg_dias_ferm != null ? `${kpis.avg_dias_ferm} días` : "—"} />
          <KpiCard label="Estilos distintos"   value={kpis.estilos_distintos} />
          <KpiCard label="Ocupación FVs"       value={`${ocupacion.pct}% (${ocupacion.ocupados}/${ocupacion.total})`} />
        </div>
      )}

      {/* ── Producción mensual ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Producción mensual · últimos 12 meses</h2>
        <ProduccionMensualChart data={produccion_mensual} />
      </div>

      {/* ── Grid 2 columnas ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Estilos más elaborados */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Estilos más elaborados</h2>
          {estilos.length ? estilos.map((e) => (
            <HBar key={e.nombre} label={e.nombre} value={e.cantidad} max={maxEstilos}
              unit=" lotes" colorClass="bg-primary" />
          )) : <p className="text-sm text-muted-foreground">Sin datos.</p>}
          {estilos.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left pb-1">Estilo</th>
                    <th className="text-right pb-1">ABV</th>
                    <th className="text-right pb-1">IBU</th>
                    <th className="text-right pb-1">L/mes</th>
                  </tr>
                </thead>
                <tbody>
                  {estilos.map((e) => (
                    <tr key={e.nombre} className="border-t border-border/50">
                      <td className="py-1 font-medium">{e.nombre}</td>
                      <td className="py-1 text-right font-mono">{e.avg_abv}%</td>
                      <td className="py-1 text-right font-mono">{e.avg_ibu}</td>
                      <td className="py-1 text-right font-mono text-primary">{e.avg_lts_mes}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Litros elaborados vs envasados */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Litros elaborados vs envasados</h2>
          <LitrosChart data={litros} />
        </div>

        {/* Merma por estilo */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Merma promedio por estilo</h2>
          {merma.length ? merma.map((m) => (
            <HBar key={m.nombre} label={m.nombre} value={m.merma_pct} max={maxMerma}
              unit="%" colorClass="bg-amber-500" />
          )) : <p className="text-sm text-muted-foreground">Sin datos de merma.</p>}
          {merma.length > 0 && (
            <div className="mt-3 border-t border-border pt-3 space-y-1">
              {merma.map((m) => (
                <div key={m.nombre} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{m.nombre}</span>
                  <span className="font-mono">{m.merma_avg_lts} L promedio perdidos</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tiempos elaboración → envasado */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Días elaboración → envasado</h2>
          {tiempos.length ? tiempos.map((t) => (
            <HBar key={t.nombre} label={t.nombre} value={t.dias_promedio} max={maxTiempos}
              unit=" días" colorClass="bg-sky-500" />
          )) : <p className="text-sm text-muted-foreground">Sin datos de envasado.</p>}
          {tiempos.length > 0 && (
            <div className="mt-3 border-t border-border pt-3 space-y-1">
              {tiempos.map((t) => (
                <div key={t.nombre} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.nombre}</span>
                  <span className="font-mono text-muted-foreground">rango: {t.dias_min}–{t.dias_max} días</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
