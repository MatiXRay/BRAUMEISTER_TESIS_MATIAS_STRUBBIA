"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClipboardList, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LoteConCata } from "./types";
import { ESTADO_CONFIG } from "@/components/lotes/types";

function PuntajeBadge({ avg }: { avg: number | null }) {
  if (avg === null) return <span className="text-xs text-muted-foreground">Sin catas</span>;
  const color =
    avg >= 8 ? "text-emerald-400" :
    avg >= 6 ? "text-amber-400"  :
               "text-red-400";
  return (
    <span className={`text-sm font-bold font-mono ${color}`}>
      ⭐ {avg}/10
    </span>
  );
}

export function PanelSensorialClient({ lotes }: { lotes: LoteConCata[] }) {
  if (!lotes.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground text-sm">No hay lotes disponibles para cata.</p>
        <p className="text-muted-foreground text-xs mt-1">Los lotes en estado <strong>Fermentando</strong>, <strong>Envasado</strong> o <strong>Finalizado</strong> aparecen aquí.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {lotes.map((lote) => {
        const estadoCfg = ESTADO_CONFIG[lote.estado as keyof typeof ESTADO_CONFIG];
        return (
          <div key={lote._id} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono font-semibold text-base">{lote.numero_lote}</p>
                <p className="text-sm text-muted-foreground">{lote.estilo_nombre}</p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${estadoCfg?.color ?? ""}`}>
                {estadoCfg?.label ?? lote.estado}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{format(new Date(lote.fecha_elaboracion), "dd MMM yyyy", { locale: es })}</span>
              <span className="font-mono">
                OG {lote.parametros?.og ? lote.parametros.og.toFixed(3) : "—"}
                &nbsp;·&nbsp;
                ABV {lote.parametros?.abv ? `${lote.parametros.abv}%` : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{lote.catas.total} planilla{lote.catas.total !== 1 ? "s" : ""}</span>
                <PuntajeBadge avg={lote.catas.avg_puntaje} />
              </div>
              <Button asChild size="sm">
                <Link href={`/dashboard/cata/${lote._id}`}>
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  Catar
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
