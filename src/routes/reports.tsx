import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, FileText, Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { AppShell, PageEmpty } from "@/components/app-shell";
import { useAuditData } from "@/components/audit-data-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditReport } from "@/lib/audit-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Audit Reports — AuditDesk" },
      { name: "description", content: "Search, review, print, and export company audit reports." },
      { property: "og:title", content: "Audit Reports — AuditDesk" },
      { property: "og:description", content: "Company audit report management." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useAuditData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<AuditReport | null>(null);
  const company = (id: string) => data.companies.find((item) => item.id === id);
  const reports = useMemo(
    () =>
      data.reports.filter((report) => {
        const companyName = data.companies.find((item) => item.id === report.companyId)?.name ?? "";
        return (
          (filter === "All" || report.reviewStatus === filter) &&
          `${companyName} ${report.auditor}`.toLowerCase().includes(search.toLowerCase())
        );
      }),
    [data.reports, data.companies, filter, search],
  );
  const exportPdf = (report: AuditReport) => {
    const name = company(report.companyId)?.name ?? "Company";
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Company Audit Visit Report", 18, 20);
    pdf.setFontSize(11);
    const lines = [
      `Company: ${name}`,
      `Assigning bank: ${report.bank || company(report.companyId)?.bank || "Not provided"}`,
      `Auditor: ${report.auditor}`,
      `Submitted: ${new Date(report.submittedAt).toLocaleString("en-IN")}`,
      `Review status: ${report.reviewStatus}`,
      `Overall verification: ${report.overallStatus}`,
      `Stock per records: ${report.recordStock}`,
      `Physical stock: ${report.physicalStock}`,
      `Difference: ${report.physicalStock - report.recordStock}`,
      `Warehouse: ${report.warehouseCondition}`,
      `Business activity: ${report.businessStatus}`,
      `Premises: ${report.premisesCondition}`,
      `Compliance issues: ${report.complianceIssues || "None recorded"}`,
      `Auditor remarks: ${report.auditorRemarks || "None"}`,
      `CA remarks: ${report.caRemarks || "Pending review"}`,
    ];
    pdf.text(pdf.splitTextToSize(lines.join("\n\n"), 170), 18, 34);
    pdf.save(`${name.replaceAll(" ", "-")}-audit-report.pdf`);
  };
  const statusClass = (status: string) =>
    status === "Approved"
      ? "bg-success/15 text-success-foreground"
      : status === "Rejected"
        ? "bg-destructive/10 text-destructive"
        : status === "Correction Required"
          ? "bg-warning/20 text-warning-foreground"
          : "bg-accent text-primary";

  return (
    <AppShell
      title="Audit Reports"
      subtitle="Submitted audit findings, evidence, and review status"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 bg-card pl-10"
            placeholder="Search company or auditor..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-11 bg-card sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["All", "Pending Review", "Approved", "Rejected", "Correction Required"].map(
              (item) => (
                <SelectItem value={item} key={item}>
                  {item}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
      {reports.length === 0 ? (
        <PageEmpty
          icon={FileText}
          title="No reports found"
          description="Completed audit reports will appear here for printing and export."
        />
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-bold">
                      {company(report.companyId)?.name ?? "Removed company"}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(report.reviewStatus)}`}
                    >
                      {report.reviewStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Audited by {report.auditor} for {report.bank || company(report.companyId)?.bank || "Bank not provided"} ·{" "}
                    {new Date(report.submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 text-xs">
                    Verification: <strong>{report.overallStatus}</strong> · Stock variance:{" "}
                    <strong>{report.physicalStock - report.recordStock}</strong>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelected(report)}>
                  <Eye />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer />
                  Print
                </Button>
                <Button size="sm" onClick={() => exportPdf(report)}>
                  <Download />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{company(selected.companyId)?.name} — Audit Report</DialogTitle>
                <DialogDescription>
                  Submitted by {selected.auditor} on{" "}
                  {new Date(selected.submittedAt).toLocaleString("en-IN")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-3 sm:grid-cols-2">
                {[
                  ["Assigning bank", selected.bank || company(selected.companyId)?.bank || "Not provided"],
                  ["Review status", selected.reviewStatus],
                  ["Overall status", selected.overallStatus],
                  ["Stock available", selected.stockAvailable ? "Yes" : "No"],
                  ["Stock variance", String(selected.physicalStock - selected.recordStock)],
                  ["Warehouse condition", selected.warehouseCondition],
                  ["Business activity", selected.businessStatus],
                  ["Premises condition", selected.premisesCondition],
                  ["Compliance issues", selected.complianceIssues || "None recorded"],
                ].map(([label, value]) => (
                  <div className="rounded-lg bg-muted/60 p-3" key={label}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold">Verification items</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(selected.checks).map(([key, value]) => (
                    <span
                      key={key}
                      className={`rounded-full px-2.5 py-1 text-xs ${value ? "bg-success/15 text-success-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {key.replace(/([A-Z])/g, " $1")}: {value ? "Yes" : "No"}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2 rounded-lg border p-4">
                <p className="text-xs font-semibold text-muted-foreground">AUDITOR REMARKS</p>
                <p className="mt-2 text-sm leading-6">{selected.auditorRemarks || "No remarks"}</p>
                {selected.caRemarks && (
                  <>
                    <p className="mt-4 text-xs font-semibold text-muted-foreground">CA REMARKS</p>
                    <p className="mt-2 text-sm leading-6">{selected.caRemarks}</p>
                  </>
                )}
              </div>
              <Button onClick={() => exportPdf(selected)}>
                <Download />
                Export as PDF
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
