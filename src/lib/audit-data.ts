export type Company = {
  id: string;
  name: string;
  address: string;
  gst: string;
  pan: string;
  contactPerson: string;
  contactNumber: string;
  bank: string;
  businessType: string;
};

export type AuditVisit = {
  id: string;
  companyId: string;
  auditor: string;
  bank: string;
  visitDate: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  remarks: string;
};

export type AuditReport = {
  id: string;
  visitId: string;
  companyId: string;
  auditor: string;
  bank: string;
  submittedAt: string;
  stockAvailable: boolean;
  recordStock: number;
  physicalStock: number;
  warehouseCondition: string;
  checks: Record<string, boolean>;
  businessStatus: string;
  premisesCondition: string;
  complianceIssues: string;
  auditorRemarks: string;
  overallStatus: string;
  reviewStatus: "Pending Review" | "Approved" | "Rejected" | "Correction Required";
  caRemarks: string;
};

export type AuditPhoto = {
  id: string;
  companyId: string;
  auditId: string;
  category: string;
  name: string;
  dataUrl: string;
  takenAt: string;
  auditor: string;
  location: string;
};

export type AuditSettings = {
  caTeam: string[];
  banks: string[];
  categories: string[];
  checklist: string[];
};

export type AuditData = {
  companies: Company[];
  visits: AuditVisit[];
  reports: AuditReport[];
  photos: AuditPhoto[];
  settings: AuditSettings;
};

export const demoData: AuditData = {
  companies: [
    {
      id: "c1",
      name: "Apex Steel Industries",
      address: "MIDC, Pune, Maharashtra",
      gst: "27AAECA1234F1Z5",
      pan: "AAECA1234F",
      contactPerson: "Rohit Mehta",
      contactNumber: "+91 98765 21001",
      bank: "Axis Bank",
      businessType: "Manufacturing",
    },
    {
      id: "c2",
      name: "Northstar Textiles",
      address: "Narol, Ahmedabad, Gujarat",
      gst: "24AABCN5678K1Z2",
      pan: "AABCN5678K",
      contactPerson: "Neha Shah",
      contactNumber: "+91 98250 18440",
      bank: "State Bank of India",
      businessType: "Textiles",
    },
    {
      id: "c3",
      name: "Greenfield Foods Pvt. Ltd.",
      address: "Kukatpally, Hyderabad, Telangana",
      gst: "36AACCG9012D1Z8",
      pan: "AACCG9012D",
      contactPerson: "Arjun Rao",
      contactNumber: "+91 98490 55126",
      bank: "HDFC Bank",
      businessType: "Food Processing",
    },
    {
      id: "c4",
      name: "Vertex Auto Components",
      address: "Manesar, Gurugram, Haryana",
      gst: "06AADCV3456B1Z7",
      pan: "AADCV3456B",
      contactPerson: "Kavita Singh",
      contactNumber: "+91 98110 33559",
      bank: "ICICI Bank",
      businessType: "Automotive",
    },
  ],
  visits: [
    {
      id: "v1",
      companyId: "c1",
      auditor: "Ananya Iyer",
      bank: "Axis Bank",
      visitDate: "2026-06-15",
      status: "In Progress",
      priority: "High",
      remarks: "Verify finished stock and machinery.",
    },
    {
      id: "v2",
      companyId: "c2",
      auditor: "Vikram Desai",
      bank: "State Bank of India",
      visitDate: "2026-06-17",
      status: "Pending",
      priority: "Medium",
      remarks: "Quarterly stock audit.",
    },
    {
      id: "v3",
      companyId: "c3",
      auditor: "Sameer Kulkarni",
      bank: "HDFC Bank",
      visitDate: "2026-06-10",
      status: "Completed",
      priority: "Low",
      remarks: "All records made available.",
    },
    {
      id: "v4",
      companyId: "c4",
      auditor: "Ananya Iyer",
      bank: "ICICI Bank",
      visitDate: "2026-06-20",
      status: "Pending",
      priority: "High",
      remarks: "Bank requested priority review.",
    },
  ],
  reports: [
    {
      id: "r1",
      visitId: "v3",
      companyId: "c3",
      auditor: "Sameer Kulkarni",
      bank: "HDFC Bank",
      submittedAt: "2026-06-10T15:30:00.000Z",
      stockAvailable: true,
      recordStock: 12450,
      physicalStock: 12390,
      warehouseCondition: "Good and well ventilated",
      checks: {
        rawMaterial: true,
        finishedGoods: true,
        semiFinished: true,
        debtors: true,
        creditors: true,
        purchaseRegister: true,
        salesRegister: true,
        stockStatement: true,
        machinery: true,
        equipment: true,
        vehicles: false,
      },
      businessStatus: "Operational",
      premisesCondition: "Satisfactory",
      complianceIssues: "Minor fire extinguisher service overdue.",
      auditorRemarks: "Records reconcile except a small packaging stock variance.",
      overallStatus: "Satisfactory",
      reviewStatus: "Pending Review",
      caRemarks: "",
    },
  ],
  photos: [],
  settings: {
    caTeam: ["CA Priya Nair", "CA Rajiv Bansal"],
    banks: [
      "Axis Bank",
      "State Bank of India",
      "Bank of Baroda",
      "Punjab National Bank",
      "HDFC Bank",
      "ICICI Bank",
    ],
    categories: [
      "Manufacturing",
      "Textiles",
      "Food Processing",
      "Automotive",
      "Trading",
      "Services",
    ],
    checklist: [
      "Stock verification",
      "Inventory records",
      "Debtors and creditors",
      "Assets and machinery",
      "Company documents",
    ],
  },
};

export const STORAGE_KEY = "auditdesk-data-v1";

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
