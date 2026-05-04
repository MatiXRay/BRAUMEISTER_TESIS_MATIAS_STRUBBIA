import { auth } from "@clerk/nextjs/server";
import { PlanificacionTimeline } from "@/components/planificacion/PlanificacionTimeline";
import type { PlanItem } from "@/components/planificacion/types";

interface CatItem { _id: string; nombre?: string; duracion_dias?: number; color?: string; }

async function fetcher<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [] as unknown as T;
  return res.json();
}

export default async function PlanificacionPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";

  const [planes, estilos, fermentadores] = await Promise.all([
    fetcher<PlanItem[]>(token, "/planificacion"),
    fetcher<CatItem[]>(token, "/estilos"),
    fetcher<CatItem[]>(token, "/fermentadores"),
  ]);

  return (
    <PlanificacionTimeline
      initialPlanes={planes}
      estilos={estilos}
      fermentadores={fermentadores}
    />
  );
}
