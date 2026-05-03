import { auth } from "@clerk/nextjs/server";
import { LevaduraTable, type Levadura } from "@/components/levaduras/LevaduraTable";

async function getLevaduras(token: string): Promise<Levadura[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/levaduras`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function LevaduraPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const levaduras = await getLevaduras(token);
  return <LevaduraTable initialData={levaduras} />;
}
