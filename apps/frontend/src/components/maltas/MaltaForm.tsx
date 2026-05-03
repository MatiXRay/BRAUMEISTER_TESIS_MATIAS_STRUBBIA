"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface MaltaFormData {
  nombre: string;
  marca: string;
}

interface Props {
  initial?: MaltaFormData;
  onSubmit: (data: MaltaFormData) => Promise<void>;
  onCancel: () => void;
}

export function MaltaForm({ initial, onSubmit, onCancel }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [marca, setMarca] = useState(initial?.marca ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !marca.trim()) {
      setError("Nombre y marca son requeridos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({ nombre: nombre.trim(), marca: marca.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Pale Ale"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="marca">Marca</Label>
        <Input
          id="marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          placeholder="Ej: Bestmalz"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
