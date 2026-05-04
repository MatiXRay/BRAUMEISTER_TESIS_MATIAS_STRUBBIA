import { auth } from "@clerk/nextjs/server";
import { EstadisticasClient } from "@/components/estadisticas/EstadisticasClient";
import type { EstadisticasPayload } from "@/components/estadisticas/types";

async function getEstadisticas(token: string): Promise<EstadisticasPayload> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estadisticas`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return {
    kpis: null,
    ocupacion: { total: 0, ocupados: 0, pct: 0 },
    produccion_mensual: [],
    estilos: [],
    litros: [],
    merma: [],
    tiempos: [],
  };
  return res.json();
}

export default async function EstadisticasPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const data = await getEstadisticas(token);
  return <EstadisticasClient data={data} />;
}
