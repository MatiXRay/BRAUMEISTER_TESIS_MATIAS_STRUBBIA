"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import {
  type EstiloFormData, type MaltaItem, type LupuloItem,
  type LevaduraItem, type AguaParams, estiloVacio,
} from "./types";

interface CatalogoItem { _id: string; nombre?: string; cepa?: string; marca: string; }

interface Props {
  initial?: EstiloFormData & { _id?: string };
  maltas:    CatalogoItem[];
  lupulos:   CatalogoItem[];
  levaduras: CatalogoItem[];
}

function NumInput({ label, value, onChange, step = "0.1", min = "0", unit }: {
  label: string; value: number; onChange: (v: number) => void;
  step?: string; min?: string; unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{unit && <span className="text-muted-foreground ml-1 text-xs">({unit})</span>}</Label>
      <Input type="number" step={step} min={min} value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
    </div>
  );
}

function AguaSection({ titulo, data, onChange }: {
  titulo: string; data: AguaParams; onChange: (d: AguaParams) => void;
}) {
  const set = (k: keyof AguaParams) => (v: number) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{titulo}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <NumInput label="Volumen total" value={data.total} onChange={set("total")} step="1" unit="L" />
        <NumInput label="% RO" value={data.porcentaje_ro} onChange={set("porcentaje_ro")} unit="%" />
        <NumInput label="Temperatura" value={data.temperatura} onChange={set("temperatura")} unit="°C" />
        <NumInput label="pH" value={data.ph} onChange={set("ph")} step="0.01" />
        <NumInput label="CaSO₄" value={data.caso4} onChange={set("caso4")} step="0.1" unit="g" />
        <NumInput label="CaCl₂" value={data.cacl2} onChange={set("cacl2")} step="0.1" unit="g" />
        <NumInput label="MgCl" value={data.mgcl} onChange={set("mgcl")} step="0.1" unit="g" />
        <NumInput label="Fosfórico" value={data.fosforico} onChange={set("fosforico")} step="0.1" unit="mL" />
        <NumInput label="Otro" value={data.otro} onChange={set("otro")} step="0.1" unit="g" />
      </div>
    </div>
  );
}

export function EstiloForm({ initial, maltas, lupulos, levaduras }: Props) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [data, setData] = useState<EstiloFormData>(initial ?? estiloVacio());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof EstiloFormData>(k: K, v: EstiloFormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const setParam = (k: keyof EstiloFormData["parametros"], v: number) =>
    setData((d) => ({ ...d, parametros: { ...d.parametros, [k]: v } }));

  // ── Maltas ──
  const addMalta = () => {
    if (!maltas.length) return;
    const m = maltas[0];
    setData((d) => ({
      ...d,
      maltas: [...d.maltas, { malta_id: m._id, nombre: m.nombre!, cantidad: 0, tiempo: 60 }],
    }));
  };
  const updateMalta = (i: number, patch: Partial<MaltaItem>) =>
    setData((d) => ({ ...d, maltas: d.maltas.map((m, idx) => idx === i ? { ...m, ...patch } : m) }));
  const removeMalta = (i: number) =>
    setData((d) => ({ ...d, maltas: d.maltas.filter((_, idx) => idx !== i) }));

  // ── Lúpulos ──
  const addLupulo = () => {
    if (!lupulos.length) return;
    const l = lupulos[0];
    setData((d) => ({
      ...d,
      lupulos: [...d.lupulos, { lupulo_id: l._id, nombre: l.nombre!, cantidad: 0, tiempo: 60, ibu_aporte: 0 }],
    }));
  };
  const updateLupulo = (i: number, patch: Partial<LupuloItem>) =>
    setData((d) => ({ ...d, lupulos: d.lupulos.map((l, idx) => idx === i ? { ...l, ...patch } : l) }));
  const removeLupulo = (i: number) =>
    setData((d) => ({ ...d, lupulos: d.lupulos.filter((_, idx) => idx !== i) }));

  // ── Levadura ──
  const setLevadura = (id: string) => {
    const lev = levaduras.find((l) => l._id === id);
    if (!lev) return;
    setData((d) => ({
      ...d,
      levadura: {
        levadura_id: lev._id, cepa: lev.cepa ?? lev.nombre ?? "",
        temp_inoculacion: 0, tasa_inoculacion: 0,
        viabilidad: 0, kilos_biomasa: 0, oxigenacion: 0,
      },
    }));
  };
  const updateLev = (patch: Partial<LevaduraItem>) =>
    setData((d) => ({ ...d, levadura: d.levadura ? { ...d.levadura, ...patch } : null }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.nombre.trim()) { setError("El nombre es requerido"); return; }
    setLoading(true); setError("");
    try {
      const t = (await getToken()) ?? "";
      const payload = {
        ...data,
        maltas: data.maltas.map((m) => ({ malta: m.malta_id, nombre: m.nombre, cantidad: m.cantidad, tiempo: m.tiempo })),
        lupulos: data.lupulos.map((l) => ({ lupulo: l.lupulo_id, nombre: l.nombre, cantidad: l.cantidad, tiempo: l.tiempo, ibu_aporte: l.ibu_aporte })),
        levadura: data.levadura ? { levadura: data.levadura.levadura_id, cepa: data.levadura.cepa, temp_inoculacion: data.levadura.temp_inoculacion, tasa_inoculacion: data.levadura.tasa_inoculacion, viabilidad: data.levadura.viabilidad, kilos_biomasa: data.levadura.kilos_biomasa, oxigenacion: data.levadura.oxigenacion } : null,
      };
      if (initial?._id) {
        await apiFetch(`/estilos/${initial._id}`, t, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/estilos", t, { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/dashboard/recetas");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general"   className="flex-1">General</TabsTrigger>
          <TabsTrigger value="parametros" className="flex-1">Parámetros</TabsTrigger>
          <TabsTrigger value="ingredientes" className="flex-1">Ingredientes</TabsTrigger>
          <TabsTrigger value="agua"      className="flex-1">Agua</TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del estilo *</Label>
            <Input id="nombre" value={data.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: American IPA" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" rows={3} value={data.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Descripción del estilo..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duracion">Duración estimada (días) *</Label>
            <Input id="duracion" type="number" min="1" value={data.duracion_dias || ""} onChange={(e) => set("duracion_dias", parseInt(e.target.value) || 0)} />
          </div>
        </TabsContent>

        {/* ── Parámetros objetivo ── */}
        <TabsContent value="parametros" className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <NumInput label="OG" value={data.parametros.og} onChange={(v) => setParam("og", v)} step="0.001" />
            <NumInput label="FG" value={data.parametros.fg} onChange={(v) => setParam("fg", v)} step="0.001" />
            <NumInput label="IBU" value={data.parametros.ibu} onChange={(v) => setParam("ibu", v)} step="1" />
            <NumInput label="ABV" value={data.parametros.abv} onChange={(v) => setParam("abv", v)} unit="%" />
            <NumInput label="Carbonatación" value={data.parametros.carb_level} onChange={(v) => setParam("carb_level", v)} unit="vol CO₂" />
          </div>
        </TabsContent>

        {/* ── Ingredientes ── */}
        <TabsContent value="ingredientes" className="space-y-6 pt-4">
          {/* Maltas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Maltas</h3>
              <Button type="button" variant="outline" size="sm" onClick={addMalta} disabled={!maltas.length}>
                <Plus className="h-3.5 w-3.5 mr-1" />Agregar
              </Button>
            </div>
            {data.maltas.length === 0 && <p className="text-sm text-muted-foreground">Sin maltas agregadas</p>}
            {data.maltas.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end rounded-lg border border-border p-3">
                <div className="col-span-5 space-y-1">
                  <Label className="text-xs">Malta</Label>
                  <Select value={item.malta_id} onValueChange={(v) => {
                    const m = maltas.find((x) => x._id === v);
                    if (m) updateMalta(i, { malta_id: v, nombre: m.nombre! });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {maltas.map((m) => <SelectItem key={m._id} value={m._id}>{m.nombre} — {m.marca}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">Cantidad (kg)</Label>
                  <Input type="number" step="0.1" min="0" value={item.cantidad || ""} onChange={(e) => updateMalta(i, { cantidad: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">Tiempo (min)</Label>
                  <Input type="number" step="1" min="0" value={item.tiempo || ""} onChange={(e) => updateMalta(i, { tiempo: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeMalta(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Lúpulos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Lúpulos</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLupulo} disabled={!lupulos.length}>
                <Plus className="h-3.5 w-3.5 mr-1" />Agregar
              </Button>
            </div>
            {data.lupulos.length === 0 && <p className="text-sm text-muted-foreground">Sin lúpulos agregados</p>}
            {data.lupulos.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end rounded-lg border border-border p-3">
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs">Lúpulo</Label>
                  <Select value={item.lupulo_id} onValueChange={(v) => {
                    const l = lupulos.find((x) => x._id === v);
                    if (l) updateLupulo(i, { lupulo_id: v, nombre: l.nombre! });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {lupulos.map((l) => <SelectItem key={l._id} value={l._id}>{l.nombre} — {l.marca}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Cantidad (g)</Label>
                  <Input type="number" step="1" min="0" value={item.cantidad || ""} onChange={(e) => updateLupulo(i, { cantidad: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Tiempo (min)</Label>
                  <Input type="number" step="1" min="0" value={item.tiempo || ""} onChange={(e) => updateLupulo(i, { tiempo: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">IBU aporte</Label>
                  <Input type="number" step="0.1" min="0" value={item.ibu_aporte || ""} onChange={(e) => updateLupulo(i, { ibu_aporte: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeLupulo(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Levadura */}
          <div className="space-y-3">
            <h3 className="font-medium">Levadura</h3>
            <div className="rounded-lg border border-border p-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Cepa</Label>
                <Select value={data.levadura?.levadura_id ?? ""} onValueChange={setLevadura}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar levadura..." /></SelectTrigger>
                  <SelectContent>
                    {levaduras.map((l) => <SelectItem key={l._id} value={l._id}>{l.cepa} — {l.marca}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {data.levadura && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <NumInput label="Temp. inoculación" value={data.levadura.temp_inoculacion} onChange={(v) => updateLev({ temp_inoculacion: v })} unit="°C" />
                  <NumInput label="Tasa inoculación" value={data.levadura.tasa_inoculacion} onChange={(v) => updateLev({ tasa_inoculacion: v })} step="0.01" />
                  <NumInput label="Viabilidad" value={data.levadura.viabilidad} onChange={(v) => updateLev({ viabilidad: v })} unit="%" />
                  <NumInput label="Kilos biomasa" value={data.levadura.kilos_biomasa} onChange={(v) => updateLev({ kilos_biomasa: v })} unit="kg" />
                  <NumInput label="Oxigenación" value={data.levadura.oxigenacion} onChange={(v) => updateLev({ oxigenacion: v })} unit="ppm" />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Agua ── */}
        <TabsContent value="agua" className="space-y-8 pt-4">
          <AguaSection titulo="Mash" data={data.agua_mash} onChange={(v) => set("agua_mash", v)} />
          <div className="border-t border-border" />
          <AguaSection titulo="Sparge" data={data.agua_sparge} onChange={(v) => set("agua_sparge", v)} />
        </TabsContent>
      </Tabs>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar estilo"}</Button>
      </div>
    </form>
  );
}
