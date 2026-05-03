import { auth } from "@clerk/nextjs/server";
import { LupulosTable, type Lupulo } from "@/components/lupulos/LupulosTable";

async function getLupulos(token: string): Promise<Lupulo[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lupulos`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function LupulosPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const lupulos = await getLupulos(token);
  return <LupulosTable initialData={lupulos} />;
}
