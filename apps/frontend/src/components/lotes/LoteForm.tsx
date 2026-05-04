"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import {
  LoteFormData, MaltaLote, LupuloLote, LevaduraLote,
  AguaTratamiento, EstadoLote, loteVacio,
} from "./types";

interface CatItem { _id: string; nombre?: string; cepa?: string; marca?: string; }

function NumField({
  label, value, onChange, step = "0.1", unit, small,
}: {
  label: string; value: number; onChange: (v: number) => void;
  step?: string; unit?: string; small?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={small ? "text-xs" : undefined}>
        {label}{unit && <span className="text-muted-foreground ml-1 text-xs">({unit})</span>}
      </Label>
      <Input
        type="number" step={step} min="0" value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={small ? "h-8 text-sm" : undefined}
      />
    </div>
  );
}

function AguaSection({
  title, value, onChange,
}: {
  title: string; value: AguaTratamiento; onChange: (v: AguaTratamiento) => void;
}) {
  const set = <K extends keyof AguaTratamiento>(k: K, v: AguaTratamiento[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="grid grid-cols-3 gap-3">
        <NumField small label="Total agua" value={value.total_agua} onChange={(v) => set("total_agua", v)} unit="L" />
        <NumField small label="% RO" value={value.porcentaje_ro} onChange={(v) => set("porcentaje_ro", v)} unit="%" />
        <NumField small label="Temperatura" value={value.temperatura} onChange={(v) => set("temperatura", v)} unit="°C" />
        <NumField small label="pH" value={value.ph} onChange={(v) => set("ph", v)} step="0.01" />
        <NumField small label="Fosfórico" value={value.fosforico} onChange={(v) => set("fosforico", v)} unit="mL" />
        <NumField small label="CaSO₄" value={value.caso4} onChange={(v) => set("caso4", v)} unit="g" />
        <NumField small label="CaCl₂" value={value.cacl2} onChange={(v) => set("cacl2", v)} unit="g" />
        <NumField small label="MgCl" value={value.mgcl} onChange={(v) => set("mgcl", v)} unit="g" />
        <div className="space-y-1.5">
          <Label className="text-xs">Otro</Label>
          <Input className="h-8 text-sm" value={value.otro} onChange={(e) => set("otro", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export function LoteForm({
  initial, onSubmit, onCancel,
}: {
  initial?: LoteFormData;
  onSubmit: (d: LoteFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<LoteFormData>(initial ?? loteVacio());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("general");

  const [maltas, setMaltas] = useState<CatItem[]>([]);
  const [lupulos, setLupulos] = useState<CatItem[]>([]);
  const [levaduras, setLevaduras] = useState<CatItem[]>([]);
  const [estilos, setEstilos] = useState<CatItem[]>([]);
  const [fermentadores, setFermentadores] = useState<CatItem[]>([]);

  useEffect(() => {
    (async () => {
      const t = (await getToken()) ?? "";
      const [m, l, lev, est, fer] = await Promise.all([
        apiFetch<CatItem[]>("/maltas", t),
        apiFetch<CatItem[]>("/lupulos", t),
        apiFetch<CatItem[]>("/levaduras", t),
        apiFetch<CatItem[]>("/estilos", t),
        apiFetch<CatItem[]>("/fermentadores", t),
      ]);
      setMaltas(m);
      setLupulos(l);
      setLevaduras(lev);
      setEstilos(est);
      setFermentadores(fer);
    })();
  }, [getToken]);

  const set = <K extends keyof LoteFormData>(k: K, v: LoteFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  /* Maltas */
  const addMalta = () =>
    set("maltas", [...form.maltas, { malta_id: "", nombre: "", cantidad: 0, tiempo: "", lote_malta: "" }]);
  const updMalta = <K extends keyof MaltaLote>(i: number, k: K, v: MaltaLote[K]) =>
    set("maltas", form.maltas.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)));
  const remMalta = (i: number) => set("maltas", form.maltas.filter((_, idx) => idx !== i));
  const pickMalta = (i: number, id: string) => {
    const item = maltas.find((m) => m._id === id);
    if (item) updMalta(i, "malta_id", id);
    if (item) updMalta(i, "nombre", item.nombre ?? "");
  };

  /* Lúpulos */
  const addLupulo = () =>
    set("lupulos", [...form.lupulos, { lupulo_id: "", nombre: "", cantidad: 0, ibu: 0, tiempo: "", lote_lupulo: "" }]);
  const updLupulo = <K extends keyof LupuloLote>(i: number, k: K, v: LupuloLote[K]) =>
    set("lupulos", form.lupulos.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const remLupulo = (i: number) => set("lupulos", form.lupulos.filter((_, idx) => idx !== i));
  const pickLupulo = (i: number, id: string) => {
    const item = lupulos.find((l) => l._id === id);
    if (item) updLupulo(i, "lupulo_id", id);
    if (item) updLupulo(i, "nombre", item.nombre ?? "");
  };

  /* Levadura */
  const levaduraVacia = (): LevaduraLote => ({
    cepa_id: "", nombre: "", gen: 1, temp_inoculacion: 0,
    tasa_inoculacion: 0, viabilidad: 100, kilos_biomasa: 0, oxigenacion: 0,
  });
  const setLev = <K extends keyof LevaduraLote>(k: K, v: LevaduraLote[K]) =>
    set("levadura", { ...(form.levadura ?? levaduraVacia()), [k]: v });
  const pickLevadura = (id: string) => {
    const item = levaduras.find((l) => l._id === id);
    if (!item) return;
    setForm((f) => ({
      ...f,
      levadura: { ...(f.levadura ?? levaduraVacia()), cepa_id: id, nombre: item.cepa ?? item.nombre ?? "" },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.numero_lote.trim())   { setError("El número de lote es requerido"); setTab("general"); return; }
    if (!form.estilo_id)            { setError("El estilo es requerido"); setTab("general"); return; }
    if (!form.fermentador_id)       { setError("El fermentador es requerido"); setTab("general"); return; }
    if (!form.fecha_elaboracion)    { setError("La fecha de elaboración es requerida"); setTab("general"); return; }
    setLoading(true); setError("");
    try { await onSubmit(form); }
    catch (err) { setError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
          <TabsTrigger value="agua">Agua</TabsTrigger>
          <TabsTrigger value="parametros">Parámetros</TabsTrigger>
        </TabsList>

        {/* ── TAB GENERAL ── */}
        <TabsContent value="general" className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Número de lote *</Label>
              <Input value={form.numero_lote} onChange={(e) => set("numero_lote", e.target.value.toUpperCase())} placeholder="BLK-001" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de elaboración *</Label>
              <Input type="date" value={form.fecha_elaboracion} onChange={(e) => set("fecha_elaboracion", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Estilo *</Label>
              <Select value={form.estilo_id} onValueChange={(v) => {
                const est = estilos.find((e) => e._id === v);
                set("estilo_id", v);
                set("estilo_nombre", est?.nombre ?? "");
              }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estilo" /></SelectTrigger>
                <SelectContent>
                  {estilos.map((e) => <SelectItem key={e._id} value={e._id}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fermentador *</Label>
              <Select value={form.fermentador_id} onValueChange={(v) => {
                const fer = fermentadores.find((f) => f._id === v);
                set("fermentador_id", v);
                set("fermentador_nombre", fer?.nombre ?? "");
              }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar fermentador" /></SelectTrigger>
                <SelectContent>
                  {fermentadores.map((f) => <SelectItem key={f._id} value={f._id}>{f.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => set("estado", v as EstadoLote)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planificado">Planificado</SelectItem>
                  <SelectItem value="elaboracion">Elaboración</SelectItem>
                  <SelectItem value="fermentando">Fermentando</SelectItem>
                  <SelectItem value="envasado">Envasado</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Comentarios</Label>
            <Textarea rows={3} value={form.comentarios} onChange={(e) => set("comentarios", e.target.value)} placeholder="Observaciones del lote..." />
          </div>
        </TabsContent>

        {/* ── TAB INGREDIENTES ── */}
        <TabsContent value="ingredientes" className="space-y-5 pt-2">
          {/* Maltas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Maltas</p>
              <Button type="button" size="sm" variant="outline" onClick={addMalta}>
                <Plus className="h-3 w-3 mr-1" />Agregar malta
              </Button>
            </div>
            {form.maltas.map((m, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end rounded-md border border-border p-2">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Variedad</Label>
                  <Select value={m.malta_id} onValueChange={(v) => pickMalta(i, v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {maltas.map((mt) => <SelectItem key={mt._id} value={mt._id}>{mt.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kg</Label>
                  <Input className="h-8 text-sm" type="number" step="0.1" min="0" value={m.cantidad || ""} onChange={(e) => updMalta(i, "cantidad", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">N° lote malta</Label>
                  <Input className="h-8 text-sm" value={m.lote_malta} onChange={(e) => updMalta(i, "lote_malta", e.target.value)} />
                </div>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remMalta(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Lúpulos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Lúpulos</p>
              <Button type="button" size="sm" variant="outline" onClick={addLupulo}>
                <Plus className="h-3 w-3 mr-1" />Agregar lúpulo
              </Button>
            </div>
            {form.lupulos.map((l, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 items-end rounded-md border border-border p-2">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Variedad</Label>
                  <Select value={l.lupulo_id} onValueChange={(v) => pickLupulo(i, v)}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {lupulos.map((lp) => <SelectItem key={lp._id} value={lp._id}>{lp.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Gramos</Label>
                  <Input className="h-8 text-sm" type="number" step="1" min="0" value={l.cantidad || ""} onChange={(e) => updLupulo(i, "cantidad", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">IBU</Label>
                  <Input className="h-8 text-sm" type="number" step="0.1" min="0" value={l.ibu || ""} onChange={(e) => updLupulo(i, "ibu", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tiempo (min)</Label>
                  <Input className="h-8 text-sm" value={l.tiempo} onChange={(e) => updLupulo(i, "tiempo", e.target.value)} />
                </div>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remLupulo(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Levadura */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Levadura</p>
            <div className="rounded-md border border-border p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Cepa</Label>
                  <Select
                    value={form.levadura?.cepa_id ?? ""}
                    onValueChange={pickLevadura}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar cepa" /></SelectTrigger>
                    <SelectContent>
                      {levaduras.map((lv) => <SelectItem key={lv._id} value={lv._id}>{lv.cepa ?? lv.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Generación</Label>
                  <Input className="h-9" type="number" min="1" step="1" value={form.levadura?.gen ?? 1} onChange={(e) => setLev("gen", parseInt(e.target.value) || 1)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NumField small label="Temp. inoculación" value={form.levadura?.temp_inoculacion ?? 0} onChange={(v) => setLev("temp_inoculacion", v)} unit="°C" />
                <NumField small label="Tasa inoculación" value={form.levadura?.tasa_inoculacion ?? 0} onChange={(v) => setLev("tasa_inoculacion", v)} />
                <NumField small label="Viabilidad" value={form.levadura?.viabilidad ?? 100} onChange={(v) => setLev("viabilidad", v)} unit="%" />
                <NumField small label="Biomasa" value={form.levadura?.kilos_biomasa ?? 0} onChange={(v) => setLev("kilos_biomasa", v)} unit="kg" />
                <NumField small label="Oxigenación" value={form.levadura?.oxigenacion ?? 0} onChange={(v) => setLev("oxigenacion", v)} unit="ppm" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB AGUA ── */}
        <TabsContent value="agua" className="space-y-5 pt-2">
          <AguaSection title="Mash" value={form.agua_mash} onChange={(v) => set("agua_mash", v)} />
          <div className="border-t border-border" />
          <AguaSection title="Sparge" value={form.agua_sparge} onChange={(v) => set("agua_sparge", v)} />
        </TabsContent>

        {/* ── TAB PARÁMETROS ── */}
        <TabsContent value="parametros" className="space-y-5 pt-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Parámetros objetivo</p>
            <div className="grid grid-cols-3 gap-3">
              <NumField label="OG" value={form.parametros.og} onChange={(v) => set("parametros", { ...form.parametros, og: v })} step="0.001" />
              <NumField label="FG" value={form.parametros.fg} onChange={(v) => set("parametros", { ...form.parametros, fg: v })} step="0.001" />
              <NumField label="IBU" value={form.parametros.ibu} onChange={(v) => set("parametros", { ...form.parametros, ibu: v })} step="0.5" />
              <NumField label="ABV" value={form.parametros.abv} onChange={(v) => set("parametros", { ...form.parametros, abv: v })} unit="%" />
              <NumField label="CO₂" value={form.parametros.co2} onChange={(v) => set("parametros", { ...form.parametros, co2: v })} unit="vol" />
              <NumField label="Carb. level" value={form.parametros.carb_level} onChange={(v) => set("parametros", { ...form.parametros, carb_level: v })} step="0.1" />
            </div>
          </div>
          <div className="border-t border-border" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Lecturas & envasado</p>
            <div className="grid grid-cols-3 gap-3">
              <NumField label="pH mosto" value={form.lecturas.ph_mosto} onChange={(v) => set("lecturas", { ...form.lecturas, ph_mosto: v })} step="0.01" />
              <NumField label="pH fin ferm." value={form.lecturas.ph_fin_fermentacion} onChange={(v) => set("lecturas", { ...form.lecturas, ph_fin_fermentacion: v })} step="0.01" />
              <NumField label="Litros a ferm." value={form.lecturas.litros_a_fermentador} onChange={(v) => set("lecturas", { ...form.lecturas, litros_a_fermentador: v })} unit="L" />
              <div className="space-y-1.5">
                <Label className="text-xs">Día de envasado</Label>
                <Input type="date" value={form.lecturas.dia_envasado} onChange={(e) => set("lecturas", { ...form.lecturas, dia_envasado: e.target.value })} />
              </div>
              <NumField label="Litros envasados" value={form.lecturas.litros_envasados} onChange={(v) => set("lecturas", { ...form.lecturas, litros_envasados: v })} unit="L" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar lote"}</Button>
      </div>
    </form>
  );
}
