"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Wheat,
  Hop,
  Microscope,
  Gauge,
  Droplets,
  Star,
  BarChart3,
  CalendarDays,
  Settings,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UserButton, useUser } from "@clerk/nextjs";

const navMain = [
  { title: "Inicio", url: "/dashboard", icon: LayoutDashboard },
];

const navProduccion = [
  { title: "Lotes", url: "/dashboard/lotes", icon: FlaskConical },
  { title: "Planificación", url: "/dashboard/planificacion", icon: CalendarDays },
];

const navRecetas = [
  { title: "Estilos & Recetas", url: "/dashboard/recetas", icon: BookOpen },
];

const navIngredientes = [
  { title: "Maltas", url: "/dashboard/maltas", icon: Wheat },
  { title: "Lúpulos", url: "/dashboard/lupulos", icon: Hop },
  { title: "Levaduras", url: "/dashboard/levaduras", icon: Microscope },
];

const navOperaciones = [
  { title: "Fermentadores", url: "/dashboard/fermentadores", icon: Gauge },
  { title: "Reportes de Agua", url: "/dashboard/agua", icon: Droplets },
];

const navAnalisis = [
  { title: "Panel de Cata", url: "/dashboard/cata", icon: Star },
  { title: "Estadísticas", url: "/dashboard/estadisticas", icon: BarChart3 },
];

type NavItem = { title: string; url: string; icon: React.ElementType };

function NavItems({ items, isActive }: { items: NavItem[]; isActive: (url: string) => boolean }) {
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            isActive={isActive(item.url)}
            render={<Link href={item.url} />}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === url : pathname.startsWith(url);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm text-sidebar-foreground">Braumeister</span>
            <span className="text-xs text-muted-foreground">Bialystok Brewing Co</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems items={navMain} isActive={isActive} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Producción</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems items={navProduccion} isActive={isActive} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recetas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems items={navRecetas} isActive={isActive} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ingredientes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        isActive={navIngredientes.some((i) => isActive(i.url))}
                      />
                    }
                  >
                    <Wheat />
                    <span>Ingredientes</span>
                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {navIngredientes.map((item) => (
                        <SidebarMenuSubItem key={item.url}>
                          <SidebarMenuSubButton
                            isActive={isActive(item.url)}
                            render={<Link href={item.url} />}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems items={navOperaciones} isActive={isActive} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Análisis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems items={navAnalisis} isActive={isActive} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dashboard/configuracion")}
                  render={<Link href="/dashboard/configuracion" />}
                >
                  <Settings />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/sign-in" />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.fullName ?? user?.username}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
