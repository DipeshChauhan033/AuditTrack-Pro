import { createFileRoute } from "@tanstack/react-router";
import { Camera, ImagePlus, MapPin, Maximize2, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { AppShell, PageEmpty } from "@/components/app-shell";
import { useAuditData } from "@/components/audit-data-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { newId, type AuditPhoto } from "@/lib/audit-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — AuditDesk" },
      {
        name: "description",
        content: "Store and review timestamped audit evidence photos with optional GPS.",
      },
      { property: "og:title", content: "Audit Photo Gallery — AuditDesk" },
      { property: "og:description", content: "Audit evidence photo management." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data, updateData } = useAuditData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AuditPhoto | null>(null);
  const [companyId, setCompanyId] = useState("");
  const [auditId, setAuditId] = useState("");
  const [category, setCategory] = useState("Company");
  const [auditor, setAuditor] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const company = (id: string) => data.companies.find((item) => item.id === id)?.name ?? "Unknown";
  const captureGps = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation is not available. Enter the location manually.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(
          `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        );
        toast.success("GPS coordinates captured");
      },
      () => toast.error("GPS permission denied. Enter the location manually."),
    );
  };
  const selectFile = (event: ChangeEvent<HTMLInputElement>) =>
    setFile(event.target.files?.[0] ?? null);
  const save = () => {
    if (!file || !companyId || !auditor)
      return toast.error("Choose a photo, company, and auditor.");
    if (file.size > 1_500_000)
      return toast.error("Please use an image under 1.5 MB for browser storage.");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const photo: AuditPhoto = {
        id: newId("photo"),
        companyId,
        auditId,
        category,
        name: file.name,
        dataUrl: reader.result,
        takenAt: new Date().toISOString(),
        auditor,
        location: location || "Not provided",
      };
      updateData((current) => ({ ...current, photos: [photo, ...current.photos] }));
      toast.success("Audit photo saved locally");
      setOpen(false);
      setFile(null);
    };
    reader.readAsDataURL(file);
  };
  const remove = (id: string) => {
    updateData((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.id !== id),
    }));
    setSelected(null);
    toast.success("Photo deleted");
  };
  return (
    <AppShell
      title="Photo Gallery"
      subtitle="Timestamped field evidence with auditor and location details"
      actions={
        <Button onClick={() => setOpen(true)}>
          <ImagePlus />
          Upload photo
        </Button>
      }
    >
      {data.photos.length === 0 ? (
        <PageEmpty
          icon={Camera}
          title="No audit photos yet"
          description="Upload company, stock, warehouse, or document photos as audit evidence."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {data.photos.map((photo) => (
            <article
              key={photo.id}
              className="group overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <button
                className="relative block aspect-[4/3] w-full overflow-hidden"
                onClick={() => setSelected(photo)}
              >
                <img
                  src={photo.dataUrl}
                  alt={`${photo.category} audit evidence for ${company(photo.companyId)}`}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-overlay text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <Maximize2 className="size-4" />
                </span>
              </button>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {photo.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(photo.takenAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <h2 className="mt-3 truncate font-semibold">{company(photo.companyId)}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{photo.auditor}</p>
                <p className="mt-2 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {photo.location}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add audit evidence</DialogTitle>
            <DialogDescription>
              Photos are compressed only by your device and stored in this browser.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div>
              <Label>Photo</Label>
              <Input
                ref={inputRef}
                className="mt-2"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={selectFile}
              />
            </div>
            <div>
              <Label>Company</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {data.companies.map((item) => (
                    <SelectItem value={item.id} key={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audit visit (optional)</Label>
              <Select value={auditId} onValueChange={setAuditId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Link to audit visit" />
                </SelectTrigger>
                <SelectContent>
                  {data.visits
                    .filter((visit) => !companyId || visit.companyId === companyId)
                    .map((visit) => (
                      <SelectItem value={visit.id} key={visit.id}>
                        {visit.auditor} · {visit.visitDate}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Company", "Stock", "Warehouse", "Document"].map((item) => (
                      <SelectItem value={item} key={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Auditor name</Label>
                <Input
                  className="mt-2"
                  value={auditor}
                  onChange={(event) => setAuditor(event.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>GPS or manual location</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Coordinates or address"
                />
                <Button type="button" variant="outline" onClick={captureGps}>
                  <MapPin />
                  Capture
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save photo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(selected)} onOpenChange={(value) => !value && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          {selected && (
            <>
              <img
                src={selected.dataUrl}
                alt={`${selected.category} audit evidence`}
                className="max-h-[65vh] w-full rounded-lg object-contain"
              />
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">
                    {company(selected.companyId)} · {selected.category}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.auditor} · {new Date(selected.takenAt).toLocaleString("en-IN")} ·{" "}
                    {selected.location}
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => remove(selected.id)}>
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
