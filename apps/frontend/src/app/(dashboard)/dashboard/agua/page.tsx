import { auth } from "@clerk/nextjs/server";
import { ReportesAguaTable, type ReporteAgua } from "@/components/agua/ReportesAguaTable";

async function getReportes(token: string): Promise<ReporteAgua[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reportes-agua`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AguaPage() {
  const { getToken } = await auth();
  const token = (await getToken()) ?? "";
  const reportes = await getReportes(token);
  return <ReportesAguaTable initialData={reportes} />;
}
