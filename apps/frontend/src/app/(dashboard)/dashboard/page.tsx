import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido, {user?.firstName ?? "Elaborador"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sistema de gestión de producción — Bialystok Brewing Co
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Lotes activos", value: "—" },
          { label: "Litros en fermentación", value: "—" },
          { label: "Recetas", value: "—" },
          { label: "Fermentadores", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-1 text-primary">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
