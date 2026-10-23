import { createFileRoute } from "@tanstack/react-router";
import { Building2, ClipboardList, RefreshCcw, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { useAuditData } from "@/components/audit-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AuditDesk" },
      {
        name: "description",
        content: "Configure CA team members, banks, categories, and audit checklist defaults.",
      },
      { property: "og:title", content: "Settings — AuditDesk" },
      { property: "og:description", content: "Configure your local audit workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, updateData, resetDemo } = useAuditData();
  const [caTeam, setCaTeam] = useState("");
  const [banks, setBanks] = useState("");
  const [categories, setCategories] = useState("");
  const [checklist, setChecklist] = useState("");
  useEffect(() => {
    setCaTeam(data.settings.caTeam.join("\n"));
    setBanks(data.settings.banks.join("\n"));
    setCategories(data.settings.categories.join("\n"));
    setChecklist(data.settings.checklist.join("\n"));
  }, [data.settings]);
  const lines = (text: string) =>
    text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  const save = () => {
    updateData((current) => ({
      ...current,
      settings: {
        caTeam: lines(caTeam),
        banks: lines(banks),
        categories: lines(categories),
        checklist: lines(checklist),
      },
    }));
    toast.success("Settings saved locally");
  };
  const fields = [
    {
      title: "CA team names",
      note: "One reviewer per line",
      icon: Users,
      value: caTeam,
      set: setCaTeam,
    },
    {
      title: "Bank names",
      note: "Available in company records",
      icon: Building2,
      value: banks,
      set: setBanks,
    },
    {
      title: "Company categories",
      note: "Business type options",
      icon: Building2,
      value: categories,
      set: setCategories,
    },
    {
      title: "Default audit checklist",
      note: "One audit requirement per line",
      icon: ClipboardList,
      value: checklist,
      set: setChecklist,
    },
  ];
  return (
    <AppShell
      title="Settings"
      subtitle="Configure local lists and default audit standards"
      actions={
        <Button onClick={save}>
          <Save />
          Save settings
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {fields.map((field) => (
          <Card key={field.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <field.icon className="size-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold">{field.title}</h2>
                  <p className="text-xs text-muted-foreground">{field.note}</p>
                </div>
              </div>
              <Label className="sr-only">{field.title}</Label>
              <Textarea
                className="mt-5 min-h-44 leading-7"
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-dashed bg-card p-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">Reset demonstration workspace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Restore sample companies, visits, reports, and default settings.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (window.confirm("Replace all local data with the demo workspace?")) {
              resetDemo();
              toast.success("Demo workspace restored");
            }
          }}
        >
          <RefreshCcw />
          Reset demo data
        </Button>
      </div>
    </AppShell>
  );
}
