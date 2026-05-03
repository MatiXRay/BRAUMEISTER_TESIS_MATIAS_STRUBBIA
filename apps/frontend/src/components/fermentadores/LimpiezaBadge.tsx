"use client";

import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const UMBRALES: Record<string, number> = {
  alcalina:  7,
  acida:     30,
  oxidativa: 30,
  exterior:  7,
};

function getEstado(tipo: string, fecha: string | null) {
  if (!fecha) return "sin-registro";
  const dias = differenceInDays(new Date(), new Date(fecha));
  const umbral = UMBRALES[tipo] ?? 14;
  if (dias <= umbral) return "ok";
  if (dias <= umbral * 2) return "advertencia";
  return "vencida";
}

const estilos = {
  "sin-registro": "bg-muted text-muted-foreground",
  ok:             "bg-green-500/15 text-green-600 dark:text-green-400",
  advertencia:    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  vencida:        "bg-red-500/15 text-red-600 dark:text-red-400",
};

interface Props {
  tipo: string;
  fecha: string | null;
  label: string;
}

export function LimpiezaBadge({ tipo, fecha, label }: Props) {
  const estado = getEstado(tipo, fecha);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium w-fit", estilos[estado])}>
        {fecha
          ? format(new Date(fecha), "dd/MM/yy", { locale: es })
          : "Sin registro"}
      </span>
    </div>
  );
}
