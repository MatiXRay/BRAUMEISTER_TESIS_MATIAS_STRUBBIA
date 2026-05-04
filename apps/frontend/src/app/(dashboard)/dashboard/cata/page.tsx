import { auth } from "@clerk/nextjs/server";
import { PanelSensorialClient } from "@/components/cata/PanelSensorialClient";
import type { LoteConCata } from "@/components/cata/types";

async function getLotesConCata(token: string): Promise<LoteConCata[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notas-cata/lotes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function PanelCataPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const lotes = await getLotesConCata(token);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel de Cata</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lotes.length} lotes disponibles para evaluación sensorial
        </p>
      </div>
      <PanelSensorialClient lotes={lotes} />
    </div>
  );
}
