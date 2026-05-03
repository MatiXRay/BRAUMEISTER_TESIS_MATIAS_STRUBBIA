import { auth } from "@clerk/nextjs/server";
import { MaltasTable, type Malta } from "@/components/maltas/MaltasTable";

async function getMaltas(token: string): Promise<Malta[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/maltas`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function MaltasPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const maltas = await getMaltas(token);

  return <MaltasTable initialData={maltas} />;
}
