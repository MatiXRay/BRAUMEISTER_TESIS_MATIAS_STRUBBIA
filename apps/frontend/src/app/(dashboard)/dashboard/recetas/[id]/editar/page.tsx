import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { EstiloForm } from "@/components/recetas/EstiloForm";
import type { Estilo } from "@/components/recetas/types";

async function get(endpoint: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditarEstiloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";

  const [estilo, maltas, lupulos, levaduras] = await Promise.all([
    get(`estilos/${id}`, token),
    get("maltas", token),
    get("lupulos", token),
    get("levaduras", token),
  ]);

  if (!estilo) notFound();

  const initial = {
    ...estilo,
    maltas: estilo.maltas.map((m: { malta: { _id: string }; nombre: string; cantidad: number; tiempo: number }) => ({
      malta_id: m.malta?._id ?? m.malta, nombre: m.nombre, cantidad: m.cantidad, tiempo: m.tiempo,
    })),
    lupulos: estilo.lupulos.map((l: { lupulo: { _id: string }; nombre: string; cantidad: number; tiempo: number; ibu_aporte: number }) => ({
      lupulo_id: l.lupulo?._id ?? l.lupulo, nombre: l.nombre, cantidad: l.cantidad, tiempo: l.tiempo, ibu_aporte: l.ibu_aporte,
    })),
    levadura: estilo.levadura?.levadura ? {
      levadura_id: estilo.levadura.levadura?._id ?? estilo.levadura.levadura,
      cepa: estilo.levadura.cepa,
      temp_inoculacion: estilo.levadura.temp_inoculacion,
      tasa_inoculacion: estilo.levadura.tasa_inoculacion,
      viabilidad: estilo.levadura.viabilidad,
      kilos_biomasa: estilo.levadura.kilos_biomasa,
      oxigenacion: estilo.levadura.oxigenacion,
    } : null,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar estilo</h1>
        <p className="text-sm text-muted-foreground mt-1">{estilo.nombre}</p>
      </div>
      <EstiloForm initial={initial} maltas={maltas ?? []} lupulos={lupulos ?? []} levaduras={levaduras ?? []} />
    </div>
  );
}
