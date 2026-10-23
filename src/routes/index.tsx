import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FilePlus2,
  Files,
  MapPin,
} from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AppShell } from "@/components/app-shell";
import { useAuditData } from "@/components/audit-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Audit Dashboard — AuditDesk" },
      {
        name: "description",
        content: "Monitor companies, audit visits, report status, and CA reviews.",
      },
      { property: "og:title", content: "Audit Dashboard — AuditDesk" },
      { property: "og:description", content: "Monitor company audit activity and report status." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data } = useAuditData();
  const pending = data.visits.filter((visit) => visit.status === "Pending").length;
  const completed = data.visits.filter((visit) => visit.status === "Completed").length;
  const inProgress = data.visits.filter((visit) => visit.status === "In Progress").length;
  const chartData = [
    { name: "Pending", value: pending, fill: "var(--warning)" },
    { name: "In Progress", value: inProgress, fill: "var(--primary)" },
    { name: "Completed", value: completed, fill: "var(--success)" },
  ];
  const companyName = (id: string) =>
    data.companies.find((company) => company.id === id)?.name ?? "Unknown company";

  return (
    <AppShell
      title="Dashboard"
      subtitle="Audit operations at a glance"
      actions={
        <Button asChild>
          <Link to="/audits/new">
            <FilePlus2 />
            New visit
          </Link>
        </Button>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total companies",
            value: data.companies.length,
            icon: Building2,
            note: "Active audit clients",
            tone: "bg-accent text-primary",
          },
          {
            label: "Total audits",
            value: data.visits.length,
            icon: Files,
            note: "Across all companies",
            tone: "bg-secondary text-secondary-foreground",
          },
          {
            label: "Pending audits",
            value: pending,
            icon: Clock3,
            note: "Requires scheduling",
            tone: "bg-warning/20 text-warning-foreground",
          },
          {
            label: "Completed audits",
            value: completed,
            icon: CheckCircle2,
            note: "Successfully submitted",
            tone: "bg-success/15 text-success-foreground",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 font-display text-3xl font-extrabold">{stat.value}</p>
                </div>
                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.tone}`}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-display font-bold">Recent company visits</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Current field assignments and priorities
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/reports">
                  View reports <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="divide-y">
              {data.visits.slice(0, 5).map((visit) => (
                <div
                  key={visit.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{companyName(visit.companyId)}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {visit.auditor} · {visit.bank || companyName(visit.companyId)} ·{" "}
                        {new Date(visit.visitDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${visit.priority === "High" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
                    >
                      {visit.priority}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${visit.status === "Completed" ? "bg-success/15 text-success-foreground" : visit.status === "In Progress" ? "bg-accent text-primary" : "bg-warning/20 text-warning-foreground"}`}
                    >
                      {visit.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-display font-bold">Audit status overview</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Distribution of current assignments
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={5}
                    stroke="none"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {chartData.map((item) => (
                <div className="flex items-center justify-between text-sm" key={item.name}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.name}
                  </span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
