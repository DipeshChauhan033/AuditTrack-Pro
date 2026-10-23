import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageEmpty } from "@/components/app-shell";
import { useAuditData } from "@/components/audit-data-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AuditReport } from "@/lib/audit-data";

export const Route = createFileRoute("/ca-review")({
  head: () => ({
    meta: [
      { title: "CA Review — AuditDesk" },
      {
        name: "description",
        content: "Approve, reject, or request corrections on submitted audit reports.",
      },
      { property: "og:title", content: "CA Review — AuditDesk" },
      { property: "og:description", content: "CA audit report review workspace." },
    ],
  }),
  component: CAReviewPage,
});

function CAReviewPage() {
  const { data, updateData } = useAuditData();
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const company = (id: string) =>
    data.companies.find((item) => item.id === id)?.name ?? "Removed company";
  const review = (report: AuditReport, status: AuditReport["reviewStatus"]) => {
    updateData((current) => ({
      ...current,
      reports: current.reports.map((item) =>
        item.id === report.id
          ? { ...item, reviewStatus: status, caRemarks: remarks[report.id] ?? item.caRemarks }
          : item,
      ),
    }));
    toast.success(`Report marked ${status.toLowerCase()}`);
  };
  return (
    <AppShell title="CA Review" subtitle="Validate field findings and close the audit review loop">
      {data.reports.length === 0 ? (
        <PageEmpty
          icon={ClipboardCheck}
          title="No reports awaiting review"
          description="Submitted audit reports will appear here for the CA team."
        />
      ) : (
        <div className="grid gap-5">
          {data.reports.map((report) => (
            <article key={report.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold">{company(report.companyId)}</h2>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {report.reviewStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.auditor} · {new Date(report.submittedAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2 text-right">
                  <p className="text-[10px] uppercase text-muted-foreground">Stock variance</p>
                  <p className="font-display text-lg font-bold">
                    {report.physicalStock - report.recordStock}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 py-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Overall verification</p>
                  <p className="mt-1 text-sm font-semibold">{report.overallStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warehouse</p>
                  <p className="mt-1 text-sm font-semibold">
                    {report.warehouseCondition || "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Compliance</p>
                  <p className="mt-1 text-sm font-semibold">
                    {report.complianceIssues || "No issue recorded"}
                  </p>
                </div>
              </div>
              <Textarea
                className="min-h-20"
                placeholder="Add CA review remarks, corrections, or approval notes..."
                value={remarks[report.id] ?? report.caRemarks}
                onChange={(event) =>
                  setRemarks((current) => ({ ...current, [report.id]: event.target.value }))
                }
              />
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => review(report, "Correction Required")}>
                  <RotateCcw />
                  Request correction
                </Button>
                <Button variant="destructive" onClick={() => review(report, "Rejected")}>
                  <XCircle />
                  Reject
                </Button>
                <Button onClick={() => review(report, "Approved")}>
                  <CheckCircle2 />
                  Approve
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
