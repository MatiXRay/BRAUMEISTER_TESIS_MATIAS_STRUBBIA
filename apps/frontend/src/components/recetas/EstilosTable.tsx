"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import type { Estilo } from "./types";

export function EstilosTable({ initialData }: { initialData: Estilo[] }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [estilos, setEstilos] = useState<Estilo[]>(initialData);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este estilo? Esta acción no se puede deshacer.")) return;
    setEliminando(id);
    try {
      const t = (await getToken()) ?? "";
      await apiFetch(`/estilos/${id}`, t, { method: "DELETE" });
      setEstilos((prev) => prev.filter((e) => e._id !== id));
    } finally {
      setEliminando(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estilos & Recetas</h1>
          <p className="text-sm text-muted-foreground mt-1">{estilos.length} estilos registrados</p>
        </div>
        <Button onClick={() => router.push("/dashboard/recetas/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />Nuevo estilo
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>OG</TableHead>
              <TableHead>FG</TableHead>
              <TableHead>IBU</TableHead>
              <TableHead>ABV</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Maltas</TableHead>
              <TableHead className="w-28 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estilos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  No hay estilos registrados
                </TableCell>
              </TableRow>
            ) : estilos.map((e) => (
              <TableRow key={e._id}>
                <TableCell className="font-medium">{e.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{e.parametros.og || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{e.parametros.fg || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{e.parametros.ibu || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{e.parametros.abv ? `${e.parametros.abv}%` : "—"}</TableCell>
                <TableCell className="text-muted-foreground">{e.duracion_dias} días</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {e.maltas.slice(0, 2).map((m, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{m.nombre}</Badge>
                    ))}
                    {e.maltas.length > 2 && (
                      <Badge variant="outline" className="text-xs">+{e.maltas.length - 2}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" render={<Link href={`/dashboard/recetas/${e._id}/editar`} />}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                      onClick={() => handleEliminar(e._id)} disabled={eliminando === e._id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
