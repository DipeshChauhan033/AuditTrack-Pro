import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FilePlus2,
  Files,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/audits/new", label: "Create Audit Visit", icon: FilePlus2 },
  { to: "/reports", label: "Audit Reports", icon: Files },
  { to: "/gallery", label: "Photo Gallery", icon: Camera },
  { to: "/ca-review", label: "CA Review", icon: ClipboardCheck },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-[76px]" : "w-[264px]",
      )}
    >
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display text-lg font-bold tracking-tight">AuditDesk</p>
            <p className="text-[11px] text-sidebar-foreground/55">Assurance & Compliance</p>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
        {!collapsed && (
          <p className="mb-3 px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
            Workspace
          </p>
        )}
        {links.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/68 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="hidden w-full justify-center text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:flex"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? (
            <ChevronRight />
          ) : (
            <>
              <ChevronLeft />
              <span>Collapse</span>
            </>
          )}
        </Button>
        {!collapsed && (
          <div className="mt-2 rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs font-semibold">Local & secure</p>
            <p className="mt-1 text-[11px] leading-4 text-sidebar-foreground/50">
              Data stays in this browser.
            </p>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-overlay" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[264px]">
            {sidebar}
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-3 top-3 text-sidebar-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X />
            </Button>
          </div>
        </div>
      )}
      <div
        className={cn(
          "transition-[margin] duration-300",
          collapsed ? "lg:ml-[76px]" : "lg:ml-[264px]",
        )}
      >
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
              <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <div className="hidden items-center gap-3 border-l pl-4 sm:flex">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                CA
              </div>
              <div>
                <p className="text-xs font-semibold">CA Team</p>
                <p className="text-[11px] text-muted-foreground">Review desk</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Files;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center border border-dashed p-8 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <Icon className="size-6" />
      </div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
