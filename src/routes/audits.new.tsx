import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Camera, ClipboardCheck, MapPin, Save } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { useAuditData } from "@/components/audit-data-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { newId, type AuditPhoto, type AuditReport, type AuditVisit } from "@/lib/audit-data";

export const Route = createFileRoute("/audits/new")({
  head: () => ({
    meta: [
      { title: "Create Audit Visit — AuditDesk" },
      {
        name: "description",
        content: "Create an audit assignment and complete its verification checklist.",
      },
      { property: "og:title", content: "Create Audit Visit — AuditDesk" },
      { property: "og:description", content: "Create a company audit visit." },
    ],
  }),
  component: NewAuditPage,
});

const checks = [
  ["rawMaterial", "Raw material checked"],
  ["finishedGoods", "Finished goods checked"],
  ["semiFinished", "Semi-finished goods checked"],
  ["debtors", "Debtors verified"],
  ["creditors", "Creditors verified"],
  ["purchaseRegister", "Purchase register checked"],
  ["salesRegister", "Sales register checked"],
  ["stockStatement", "Stock statement verified"],
  ["machinery", "Machinery verified"],
  ["equipment", "Equipment verified"],
  ["vehicles", "Vehicle verification"],
] as const;

function NewAuditPage() {
  const { data, updateData } = useAuditData();
  const [companyId, setCompanyId] = useState("");
  const [auditor, setAuditor] = useState("");
  const [bank, setBank] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<AuditVisit["status"]>("Pending");
  const [priority, setPriority] = useState<AuditVisit["priority"]>("Medium");
  const [remarks, setRemarks] = useState("");
  const [reportMode, setReportMode] = useState(false);
  const [stockAvailable, setStockAvailable] = useState("yes");
  const [recordStock, setRecordStock] = useState("");
  const [physicalStock, setPhysicalStock] = useState("");
  const [warehouseCondition, setWarehouseCondition] = useState("");
  const [selectedChecks, setSelectedChecks] = useState<Record<string, boolean>>({});
  const [businessStatus, setBusinessStatus] = useState("Operational");
  const [premisesCondition, setPremisesCondition] = useState("");
  const [complianceIssues, setComplianceIssues] = useState("");
  const [overallStatus, setOverallStatus] = useState("Satisfactory");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidenceLocation, setEvidenceLocation] = useState("");
  const selectCompany = (value: string) => {
    setCompanyId(value);
    setBank(data.companies.find((company) => company.id === value)?.bank ?? "");
  };
  const selectEvidence = (event: ChangeEvent<HTMLInputElement>) =>
    setEvidenceFiles(Array.from(event.target.files ?? []));
  const captureGps = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation is unavailable. Enter the location manually.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setEvidenceLocation(
          `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        );
        toast.success("GPS coordinates captured");
      },
      () => toast.error("GPS permission denied. Enter the location manually."),
    );
  };
  const readFile = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid image"));
      reader.onerror = () => reject(reader.error ?? new Error("Unable to read image"));
      reader.readAsDataURL(file);
    });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!companyId || !auditor || !bank || !visitDate)
      return toast.error("Select a company, bank, auditor, and visit date.");
    if (evidenceFiles.some((file) => file.size > 1_500_000))
      return toast.error("Each evidence photo must be under 1.5 MB for browser storage.");
    const visitId = newId("visit");
    const visit: AuditVisit = {
      id: visitId,
      companyId,
      auditor,
      bank,
      visitDate,
      status: reportMode ? "Completed" : status,
      priority,
      remarks,
    };
    let report: AuditReport | null = null;
    if (reportMode)
      report = {
        id: newId("report"),
        visitId,
        companyId,
        auditor,
        bank,
        submittedAt: new Date().toISOString(),
        stockAvailable: stockAvailable === "yes",
        recordStock: Number(recordStock) || 0,
        physicalStock: Number(physicalStock) || 0,
        warehouseCondition,
        checks: selectedChecks,
        businessStatus,
        premisesCondition,
        complianceIssues,
        auditorRemarks: remarks,
        overallStatus,
        reviewStatus: "Pending Review",
        caRemarks: "",
      };
    const evidencePhotos: AuditPhoto[] = await Promise.all(
      evidenceFiles.map(async (file) => ({
        id: newId("photo"),
        companyId,
        auditId: visitId,
        category: "Evidence",
        name: file.name,
        dataUrl: await readFile(file),
        takenAt: new Date().toISOString(),
        auditor,
        location: evidenceLocation || "Not provided",
      })),
    );
    updateData((current) => ({
      ...current,
      visits: [visit, ...current.visits],
      reports: report ? [report, ...current.reports] : current.reports,
      photos: [...evidencePhotos, ...current.photos],
    }));
    toast.success(reportMode ? "Audit report submitted for CA review" : "Audit visit created");
    setCompanyId("");
    setAuditor("");
    setBank("");
    setRemarks("");
    setEvidenceFiles([]);
    setEvidenceLocation("");
    setReportMode(false);
  };

  return (
    <AppShell
      title="Create Audit Visit"
      subtitle="Assign a field visit or submit a complete verification report"
    >
      <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <h2 className="font-display font-bold">Visit assignment</h2>
                <p className="text-xs text-muted-foreground">
                  Core details for the auditor's field visit
                </p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Company *</Label>
                <Select value={companyId} onValueChange={selectCompany}>
                  <SelectTrigger className="mt-2 h-10">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.companies.map((company) => (
                      <SelectItem value={company.id} key={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigning bank *</Label>
                <Select value={bank} onValueChange={setBank}>
                  <SelectTrigger className="mt-2 h-10">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.settings.banks.map((item) => (
                      <SelectItem value={item} key={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="auditor">Auditor name *</Label>
                <Input
                  id="auditor"
                  className="mt-2 h-10"
                  value={auditor}
                  onChange={(event) => setAuditor(event.target.value)}
                  placeholder="Name of field auditor"
                />
              </div>
              <div>
                <Label htmlFor="date">Visit date *</Label>
                <Input
                  id="date"
                  type="date"
                  className="mt-2 h-10"
                  value={visitDate}
                  onChange={(event) => setVisitDate(event.target.value)}
                />
              </div>
              <div>
                <Label>Visit status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as AuditVisit["status"])}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Pending", "In Progress", "Completed"].map((item) => (
                      <SelectItem value={item} key={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as AuditVisit["priority"])}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High"].map((item) => (
                      <SelectItem value={item} key={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm">
                  <Checkbox
                    checked={reportMode}
                    onCheckedChange={(value) => setReportMode(Boolean(value))}
                  />
                  <span>Complete report now</span>
                </label>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="remarks">Assignment / auditor remarks</Label>
                <Textarea
                  id="remarks"
                  className="mt-2 min-h-24"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Scope, visit notes, observations, and exceptions..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {reportMode && (
          <>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <ClipboardCheck className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold">Stock & inventory verification</h2>
                    <p className="text-xs text-muted-foreground">
                      Reconcile recorded and physical stock
                    </p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label>Stock available</Label>
                    <Select value={stockAvailable} onValueChange={setStockAvailable}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Stock as per records</Label>
                    <Input
                      className="mt-2"
                      type="number"
                      value={recordStock}
                      onChange={(event) => setRecordStock(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Physical stock</Label>
                    <Input
                      className="mt-2"
                      type="number"
                      value={physicalStock}
                      onChange={(event) => setPhysicalStock(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Difference</Label>
                    <Input
                      className="mt-2 bg-muted"
                      readOnly
                      value={(Number(physicalStock) || 0) - (Number(recordStock) || 0)}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <Label>Warehouse condition</Label>
                    <Input
                      className="mt-2"
                      value={warehouseCondition}
                      onChange={(event) => setWarehouseCondition(event.target.value)}
                      placeholder="Storage, safety, housekeeping, access..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-display font-bold">Detailed verification checklist</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Inventory, financial registers, and business assets
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {checks.map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={selectedChecks[key] ?? false}
                        onCheckedChange={(value) =>
                          setSelectedChecks((current) => ({ ...current, [key]: Boolean(value) }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-display font-bold">General observations</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Business activity status</Label>
                    <Select value={businessStatus} onValueChange={setBusinessStatus}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Operational",
                          "Partially Operational",
                          "Temporarily Closed",
                          "Not Operational",
                        ].map((item) => (
                          <SelectItem value={item} key={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Overall verification status</Label>
                    <Select value={overallStatus} onValueChange={setOverallStatus}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Satisfactory", "Needs Attention", "Unsatisfactory"].map((item) => (
                          <SelectItem value={item} key={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Premises condition</Label>
                    <Textarea
                      className="mt-2"
                      value={premisesCondition}
                      onChange={(event) => setPremisesCondition(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Compliance issues</Label>
                    <Textarea
                      className="mt-2"
                      value={complianceIssues}
                      onChange={(event) => setComplianceIssues(event.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-dashed bg-muted/30 p-5">
                  <div className="flex items-center gap-3">
                    <Camera className="size-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Evidence photos</p>
                      <p className="text-xs text-muted-foreground">
                        Upload multiple company, stock, warehouse, or document photos with this report.
                      </p>
                    </div>
                  </div>
                  <Input
                    className="mt-4 bg-card"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={selectEvidence}
                  />
                  {evidenceFiles.length > 0 && (
                    <p className="mt-2 text-xs font-medium text-primary">
                      {evidenceFiles.length} photo{evidenceFiles.length === 1 ? "" : "s"} selected
                    </p>
                  )}
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={evidenceLocation}
                      onChange={(event) => setEvidenceLocation(event.target.value)}
                      placeholder="GPS coordinates or manual location"
                    />
                    <Button type="button" variant="outline" onClick={captureGps}>
                      <MapPin />
                      Capture GPS
                    </Button>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    GPS can be captured during photo upload, with manual location fallback.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <Save />
            {reportMode ? "Submit audit report" : "Create visit"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
