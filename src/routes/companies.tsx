import { createFileRoute } from "@tanstack/react-router";
import { Building2, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
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
import { newId, type Company } from "@/lib/audit-data";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Companies — AuditDesk" },
      { name: "description", content: "Manage companies assigned for banking audits." },
      { property: "og:title", content: "Companies — AuditDesk" },
      { property: "og:description", content: "Manage audit company records." },
    ],
  }),
  component: CompaniesPage,
});

const blank = {
  name: "",
  address: "",
  gst: "",
  pan: "",
  contactPerson: "",
  contactNumber: "",
  bank: "",
  businessType: "",
};

function CompaniesPage() {
  const { data, updateData } = useAuditData();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const filtered = useMemo(
    () =>
      data.companies.filter((company) =>
        `${company.name} ${company.bank} ${company.gst}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [data.companies, search],
  );
  const change = (key: keyof typeof blank, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setForm({
      name: company.name,
      address: company.address,
      gst: company.gst,
      pan: company.pan,
      contactPerson: company.contactPerson,
      contactNumber: company.contactNumber,
      bank: company.bank,
      businessType: company.businessType,
    });
    setOpen(true);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.address || !form.bank)
      return toast.error("Company name, address, and bank are required.");
    updateData((current) => ({
      ...current,
      companies: editingId
        ? current.companies.map((company) =>
            company.id === editingId ? { id: company.id, ...form } : company,
          )
        : [{ id: newId("company"), ...form }, ...current.companies],
    }));
    toast.success(editingId ? "Company updated" : "Company added");
    setOpen(false);
    setEditingId(null);
    setForm(blank);
  };
  const remove = (id: string) => {
    if (!window.confirm("Delete this company and keep its historical reports?")) return;
    updateData((current) => ({
      ...current,
      companies: current.companies.filter((company) => company.id !== id),
    }));
    toast.success("Company deleted");
  };

  return (
    <AppShell
      title="Companies"
      subtitle="Company master records and banking details"
      actions={
        <Button
          onClick={() => {
            setEditingId(null);
            setForm(blank);
            setOpen(true);
          }}
        >
          <Plus />
          Add company
        </Button>
      }
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 bg-card pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search companies, banks, or GST..."
          />
        </div>
        <span className="hidden text-sm text-muted-foreground sm:block">
          {filtered.length} companies
        </span>
      </div>
      {filtered.length === 0 ? (
        <PageEmpty
          icon={Building2}
          title="No companies found"
          description="Try another search or add your first company record."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Bank</th>
                  <th className="px-5 py-4">GST / PAN</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Business</th>
                  <th className="px-5 py-4 text-right">
                    <MoreHorizontal className="ml-auto size-4" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((company) => (
                  <tr key={company.id} className="hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                          <Building2 className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{company.name}</p>
                          <p className="mt-1 max-w-[260px] truncate text-xs text-muted-foreground">
                            {company.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium">{company.bank}</td>
                    <td className="px-5 py-4">
                      <p>{company.gst}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{company.pan}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p>{company.contactPerson}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{company.contactNumber}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {company.businessType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(company)}
                          aria-label={`Edit ${company.name}`}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => remove(company.id)}
                          aria-label={`Delete ${company.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit company" : "Add company"}</DialogTitle>
            <DialogDescription>
              Enter the legal, banking, and contact details used during audit visits.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit}>
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Company name", "Apex Industries"],
                  ["address", "Address", "Registered office address"],
                  ["gst", "GST number", "27AAAAA0000A1Z5"],
                  ["pan", "PAN number", "AAAAA0000A"],
                  ["contactPerson", "Contact person", "Full name"],
                  ["contactNumber", "Contact number", "+91"],
                ] as const
              ).map(([key, label, placeholder]) => (
                <div className={key === "address" ? "sm:col-span-2" : ""} key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    className="mt-2"
                    value={form[key]}
                    onChange={(event) => change(key, event.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <Label>Bank name</Label>
                <Select value={form.bank} onValueChange={(value) => change("bank", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.settings.banks.map((bank) => (
                      <SelectItem value={bank} key={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Business type</Label>
                <Select
                  value={form.businessType}
                  onValueChange={(value) => change("businessType", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.settings.categories.map((category) => (
                      <SelectItem value={category} key={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Save changes" : "Add company"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
