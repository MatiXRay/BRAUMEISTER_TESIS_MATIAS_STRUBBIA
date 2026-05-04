import { auth } from "@clerk/nextjs/server";
import { EstilosTable } from "@/components/recetas/EstilosTable";
import type { Estilo } from "@/components/recetas/types";

async function getEstilos(token: string): Promise<Estilo[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estilos`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function RecetasPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const estilos = await getEstilos(token);
  return <EstilosTable initialData={estilos} />;
}
