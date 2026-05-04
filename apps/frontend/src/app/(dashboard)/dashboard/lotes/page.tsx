import { auth } from "@clerk/nextjs/server";
import { LotesTable } from "@/components/lotes/LotesTable";
import type { Lote } from "@/components/lotes/types";

async function getLotes(token: string): Promise<Lote[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lotes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function LotesPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const lotes = await getLotes(token);
  return <LotesTable initialData={lotes} />;
}
