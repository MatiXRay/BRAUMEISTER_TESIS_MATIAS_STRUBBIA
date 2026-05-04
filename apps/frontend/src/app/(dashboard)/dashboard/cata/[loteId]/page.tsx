import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlanillaCataForm } from "@/components/cata/PlanillaCataForm";
import type { NotaCata } from "@/components/cata/types";
import type { Lote } from "@/components/lotes/types";

async function getLote(token: string, id: string): Promise<Lote | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lotes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getNotasLote(token: string, loteId: string): Promise<NotaCata[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notas-cata/lote/${loteId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function PlanillaCataPage({
  params,
}: {
  params: Promise<{ loteId: string }>;
}) {
  const { loteId } = await params;
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";

  const [lote, notas] = await Promise.all([
    getLote(token, loteId),
    getNotasLote(token, loteId),
  ]);

  if (!lote) notFound();

  const ultimaNota = notas[0] ?? undefined;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/cata" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Planilla de cata — <span className="font-mono">{lote.numero_lote}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {lote.estilo_nombre} · {notas.length} planilla{notas.length !== 1 ? "s" : ""} guardada{notas.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {notas.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          Última evaluación registrada — puntaje: <strong className="text-foreground">{ultimaNota!.impresion_puntaje}/10</strong>
          {" "}· Podés completar una nueva planilla o continuar editando la última.
        </div>
      )}

      <PlanillaCataForm
        loteId={loteId}
        loteNumero={lote.numero_lote}
        initial={ultimaNota}
      />
    </div>
  );
}
