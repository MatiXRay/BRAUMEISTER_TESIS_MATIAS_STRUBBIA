"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { NotaCata, NotaCataForm, notaCataVacia, PUNTAJE_LABEL } from "./types";
import { cn } from "@/lib/utils";

// ── Scale 1-5 ──────────────────────────────────────────────
function Scale({
  label, value, onChange, max = 5, labels,
}: {
  label: string; value: number; onChange: (v: number) => void;
  max?: number; labels?: string[];
}) {
  const steps = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1">
        {steps.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "flex-1 h-8 rounded text-xs font-medium border transition-colors",
              value === v
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
            )}
          >
            {labels ? labels[v] ?? v : v}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Pills (radio) ────────────────────────────────────────────
function Pills({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "px-3 h-7 rounded-full text-xs font-medium border transition-colors",
              value === opt
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Score global (1-10) ──────────────────────────────────────
function ScoreGlobal({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const colors = [
    "", "bg-red-600", "bg-red-500", "bg-orange-500",
    "bg-amber-500", "bg-amber-400",
    "bg-yellow-400", "bg-lime-400",
    "bg-green-400", "bg-green-500", "bg-emerald-500",
  ];
  return (
    <div className="space-y-2">
      <Label className="text-xs">Puntaje global (1–10)</Label>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "flex-1 h-10 rounded text-sm font-bold border transition-all",
              value === v
                ? `${colors[v]} text-white border-transparent scale-105`
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
            )}
          >
            {v}
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          {value} / 10 — <span className="text-foreground font-medium">{PUNTAJE_LABEL[value]}</span>
        </p>
      )}
    </div>
  );
}

// ── Sección wrapper ──────────────────────────────────────────
function Seccion({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h3>
      {children}
    </div>
  );
}

// ── Defecto (0-3) ────────────────────────────────────────────
function Defecto({
  label, subtitle, value, onChange,
}: {
  label: string; subtitle: string; value: number; onChange: (v: number) => void;
}) {
  const labels = ["Ninguno", "Leve", "Moderado", "Marcado"];
  const colors = ["bg-muted/30", "bg-yellow-500/20 border-yellow-500/50 text-yellow-400", "bg-orange-500/20 border-orange-500/50 text-orange-400", "bg-red-500/20 border-red-500/50 text-red-400"];
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium">{label} <span className="text-muted-foreground font-normal">— {subtitle}</span></p>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "flex-1 h-7 rounded text-xs font-medium border transition-colors",
              value === v ? colors[v] : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
            )}
          >
            {labels[v]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Formulario principal ─────────────────────────────────────
export function PlanillaCataForm({
  loteId, loteNumero, initial, onGuardado,
}: {
  loteId: string; loteNumero: string;
  initial?: NotaCata;
  onGuardado?: (nota: NotaCata) => void;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<NotaCataForm>(
    initial
      ? (({ _id, creadoEn, ...rest }) => rest)(initial as NotaCata & { _id: string; creadoEn: string })
      : notaCataVacia(loteId, loteNumero)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [guardado, setGuardado] = useState(false);

  const set = <K extends keyof NotaCataForm>(k: K, v: NotaCataForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const t = (await getToken()) ?? "";
      let nota: NotaCata;
      if (initial) {
        nota = await apiFetch<NotaCata>(`/notas-cata/${initial._id}`, t, { method: "PUT", body: JSON.stringify(form) });
      } else {
        nota = await apiFetch<NotaCata>("/notas-cata", t, { method: "POST", body: JSON.stringify(form) });
      }
      setGuardado(true);
      onGuardado?.(nota);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (guardado) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
        <p className="text-4xl">🍺</p>
        <p className="text-lg font-semibold">Planilla guardada</p>
        <p className="text-sm text-muted-foreground">Puntaje global: <strong>{form.impresion_puntaje}/10</strong> — {PUNTAJE_LABEL[form.impresion_puntaje]}</p>
        <Button variant="outline" onClick={() => setGuardado(false)}>Editar planilla</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── APARIENCIA ─────────────────────────────────────── */}
      <Seccion title="Apariencia" emoji="👁️">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Color de la cerveza</Label>
            <Input value={form.color_cerveza} onChange={(e) => set("color_cerveza", e.target.value)} placeholder="Dorado brillante, ámbar…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Color de la espuma</Label>
            <Input value={form.color_espuma} onChange={(e) => set("color_espuma", e.target.value)} placeholder="Blanca, crema…" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Scale label="Turbidez" value={form.claridad_intensidad} onChange={(v) => set("claridad_intensidad", v)}
            labels={["", "Brillante", "Leve velo", "Turbia", "Muy turbia", "Opaca"]} />
          <Scale label="Retención de espuma" value={form.retencion_intensidad} onChange={(v) => set("retencion_intensidad", v)}
            labels={["", "Pobre", "Regular", "Buena", "Muy buena", "Excelente"]} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Comentarios</Label>
          <Textarea rows={2} value={form.apariencia_comentario} onChange={(e) => set("apariencia_comentario", e.target.value)} />
        </div>
        <Scale label="Puntaje apariencia" value={form.apariencia_puntaje} onChange={(v) => set("apariencia_puntaje", v)} max={10} />
      </Seccion>

      {/* ── AROMA ──────────────────────────────────────────── */}
      <Seccion title="Aroma" emoji="👃">
        <div className="grid grid-cols-2 gap-3">
          <Scale label="Malta"    value={form.malta_intensidad}   onChange={(v) => set("malta_intensidad", v)} />
          <Scale label="Lúpulo"   value={form.lupulo_intensidad}  onChange={(v) => set("lupulo_intensidad", v)} />
          <Scale label="Ésteres"  value={form.esteres_intensidad} onChange={(v) => set("esteres_intensidad", v)} />
          <Scale label="Fenoles"  value={form.fenoles_intensidad} onChange={(v) => set("fenoles_intensidad", v)} />
          <Scale label="Alcohol"  value={form.alcohol_intensidad} onChange={(v) => set("alcohol_intensidad", v)} />
          <Scale label="Dulzor"   value={form.dulzor_intensidad}  onChange={(v) => set("dulzor_intensidad", v)} />
          <Scale label="Acidez"   value={form.acidez_intensidad}  onChange={(v) => set("acidez_intensidad", v)} />
          <Scale label="Otros"    value={form.otros_intensidad}   onChange={(v) => set("otros_intensidad", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Atributos malta</Label>
            <Input value={form.maltas_atributos} onChange={(e) => set("maltas_atributos", e.target.value)} placeholder="Tostado, galleta, caramelo…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Atributos lúpulo</Label>
            <Input value={form.lupulo_atributos} onChange={(e) => set("lupulo_atributos", e.target.value)} placeholder="Cítrico, pino, floral…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Atributos ésteres</Label>
            <Input value={form.esteres_atributos} onChange={(e) => set("esteres_atributos", e.target.value)} placeholder="Frutal, banana, pera…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Otros atributos</Label>
            <Input value={form.otros_atributos} onChange={(e) => set("otros_atributos", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Comentarios de aroma</Label>
          <Textarea rows={2} value={form.aroma_comentario} onChange={(e) => set("aroma_comentario", e.target.value)} />
        </div>
        <Scale label="Puntaje aroma" value={form.aroma_puntaje} onChange={(v) => set("aroma_puntaje", v)} max={10} />
      </Seccion>

      {/* ── SABOR ───────────────────────────────────────────── */}
      <Seccion title="Sabor" emoji="👅">
        <div className="grid grid-cols-2 gap-3">
          <Scale label="Malta"   value={form.sabor_malta_intensidad}   onChange={(v) => set("sabor_malta_intensidad", v)} />
          <Scale label="Lúpulo"  value={form.sabor_lupulo_intensidad}  onChange={(v) => set("sabor_lupulo_intensidad", v)} />
          <Scale label="Ésteres" value={form.sabor_esteres_intensidad} onChange={(v) => set("sabor_esteres_intensidad", v)} />
          <Scale label="Fenoles" value={form.sabor_fenoles_intensidad} onChange={(v) => set("sabor_fenoles_intensidad", v)} />
          <Scale label="Alcohol" value={form.sabor_alcohol_intensidad} onChange={(v) => set("sabor_alcohol_intensidad", v)} />
          <Scale label="Dulzor"  value={form.sabor_dulzor_intensidad}  onChange={(v) => set("sabor_dulzor_intensidad", v)} />
          <Scale label="Acidez"  value={form.sabor_acidez_intensidad}  onChange={(v) => set("sabor_acidez_intensidad", v)} />
          <Scale label="Otros"   value={form.sabor_otros_intensidad}   onChange={(v) => set("sabor_otros_intensidad", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Atributos malta</Label>
            <Input value={form.sabor_malta_atributos} onChange={(e) => set("sabor_malta_atributos", e.target.value)} placeholder="Pan, caramelo, tostado…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Atributos lúpulo</Label>
            <Input value={form.sabor_lupulo_atributos} onChange={(e) => set("sabor_lupulo_atributos", e.target.value)} placeholder="Resina, cítrico, amargo…" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Atributos ésteres</Label>
            <Input value={form.sabor_esteres_atributos} onChange={(e) => set("sabor_esteres_atributos", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Otros atributos</Label>
            <Input value={form.sabor_otros_atributos} onChange={(e) => set("sabor_otros_atributos", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Pills label="Balance" value={form.balance} options={["Malta", "Balanceado", "Lúpulo"]} onChange={(v) => set("balance", v)} />
          <Pills label="Final" value={form.mouthfeel_final} options={["Seco", "Medio", "Dulce"]} onChange={(v) => set("mouthfeel_final", v)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Comentarios de sabor</Label>
          <Textarea rows={2} value={form.sabor_comentario} onChange={(e) => set("sabor_comentario", e.target.value)} />
        </div>
        <Scale label="Puntaje sabor" value={form.sabor_puntaje} onChange={(v) => set("sabor_puntaje", v)} max={10} />
      </Seccion>

      {/* ── SENSACIÓN EN BOCA ───────────────────────────────── */}
      <Seccion title="Sensación en boca" emoji="💧">
        <div className="grid grid-cols-2 gap-3">
          <Scale label="Cuerpo" value={form.cuerpo_intensidad} onChange={(v) => set("cuerpo_intensidad", v)}
            labels={["", "Muy liviano", "Liviano", "Medio", "Lleno", "Muy lleno"]} />
          <Scale label="Carbonatación" value={form.carbonatacion_intensidad} onChange={(v) => set("carbonatacion_intensidad", v)}
            labels={["", "Muy baja", "Baja", "OK", "Alta", "Muy alta"]} />
          <Scale label="Calentamiento alcohólico" value={form.calentamiento_intensidad} onChange={(v) => set("calentamiento_intensidad", v)} />
          <Scale label="Cremosidad" value={form.cremosidad_intensidad} onChange={(v) => set("cremosidad_intensidad", v)}
            labels={["", "Muy seca", "Seca", "Normal", "Cremosa", "Muy cremosa"]} />
          <Scale label="Astringencia" value={form.astringencia_intensidad} onChange={(v) => set("astringencia_intensidad", v)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Fallas en mouthfeel</Label>
          <Input value={form.mouthfeel_fallas} onChange={(e) => set("mouthfeel_fallas", e.target.value)} placeholder="Tanicidad, calor excesivo…" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Comentarios</Label>
          <Textarea rows={2} value={form.mouthfeel_comentario} onChange={(e) => set("mouthfeel_comentario", e.target.value)} />
        </div>
        <Scale label="Puntaje sensación en boca" value={form.mouthfeel_puntaje} onChange={(v) => set("mouthfeel_puntaje", v)} max={10} />
      </Seccion>

      {/* ── DEFECTOS ────────────────────────────────────────── */}
      <Seccion title="Defectos" emoji="⚠️">
        <div className="grid grid-cols-1 gap-3">
          <Defecto label="Diacetilo"    subtitle="Manteca / margarina"       value={form.def_diacetilo}    onChange={(v) => set("def_diacetilo", v)} />
          <Defecto label="Acetaldehído" subtitle="Manzana verde"             value={form.def_acetaldehido} onChange={(v) => set("def_acetaldehido", v)} />
          <Defecto label="DMS"          subtitle="Maíz / vegetales cocidos"  value={form.def_dms}          onChange={(v) => set("def_dms", v)} />
          <Defecto label="Oxidación"    subtitle="Cartón / papel / miel vieja" value={form.def_oxidacion} onChange={(v) => set("def_oxidacion", v)} />
          <Defecto label="Fenoles"      subtitle="Plástico / medicinal / clavo" value={form.def_fenoles}   onChange={(v) => set("def_fenoles", v)} />
          <Defecto label="Astringencia" subtitle="Polifenoles / taninos"     value={form.def_astringencia} onChange={(v) => set("def_astringencia", v)} />
          <Defecto label="Alcohol"      subtitle="Fusel / quemante"          value={form.def_alcohol}      onChange={(v) => set("def_alcohol", v)} />
          <Defecto label="Hop burn"     subtitle="Lúpulo crudo / quemante"   value={form.def_hopburn}      onChange={(v) => set("def_hopburn", v)} />
        </div>
      </Seccion>

      {/* ── IMPRESIÓN FINAL ─────────────────────────────────── */}
      <Seccion title="Impresión general" emoji="📋">
        <div className="grid grid-cols-2 gap-3">
          <Pills
            label="¿Dentro del perfil esperado?"
            value={form.desvio_perfil ? "No" : "Sí"}
            options={["Sí", "No"]}
            onChange={(v) => set("desvio_perfil", v === "No")}
          />
        </div>
        {form.desvio_perfil && (
          <div className="space-y-1.5">
            <Label className="text-xs">¿Qué está fuera de perfil?</Label>
            <Textarea rows={2} value={form.desvio_desc} onChange={(e) => set("desvio_desc", e.target.value)} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">🔍 Posible causa</Label>
            <Textarea rows={2} value={form.causa} onChange={(e) => set("causa", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">🛠 Acción para el próximo lote</Label>
            <Textarea rows={2} value={form.accion} onChange={(e) => set("accion", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Impresión libre</Label>
          <Textarea rows={3} value={form.impresion_libre} onChange={(e) => set("impresion_libre", e.target.value)} placeholder="Resumen general, comparaciones, destacados…" />
        </div>
        <ScoreGlobal value={form.impresion_puntaje} onChange={(v) => set("impresion_puntaje", v)} />
      </Seccion>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Guardando…" : initial ? "Actualizar planilla" : "Guardar planilla de cata"}
      </Button>
    </form>
  );
}
