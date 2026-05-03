import { auth } from "@clerk/nextjs/server";
import { FermentadoresTable, type Fermentador } from "@/components/fermentadores/FermentadoresTable";

async function getFermentadores(token: string): Promise<Fermentador[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fermentadores`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function FermentadoresPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const fermentadores = await getFermentadores(token);
  return <FermentadoresTable initialData={fermentadores} />;
}
