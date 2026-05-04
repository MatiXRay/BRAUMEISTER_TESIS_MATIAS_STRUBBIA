import { auth } from "@clerk/nextjs/server";
import { EstiloForm } from "@/components/recetas/EstiloForm";

async function getCatalogo(endpoint: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function NuevoEstiloPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const [maltas, lupulos, levaduras] = await Promise.all([
    getCatalogo("maltas", token),
    getCatalogo("lupulos", token),
    getCatalogo("levaduras", token),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo estilo</h1>
        <p className="text-sm text-muted-foreground mt-1">Definí los parámetros y la receta base</p>
      </div>
      <EstiloForm maltas={maltas} lupulos={lupulos} levaduras={levaduras} />
    </div>
  );
}
