import {
  Building2,
  Layers,
  Globe2,
  User,
  Handshake,
  CheckCircle2,
  CalendarClock,
  Briefcase,
  Shield,
  Receipt,
  UserCog,
  Flag,
  Users2,
  FolderKanban,
  MapPin,
  Tags,
  Coins,
  ClipboardCheck,
  FileCheck,
  ScrollText,
  Landmark,
  KeyRound,
} from "lucide-react";

export const ADMIN_MODULES = [
  { key: "user", label: "Employee Details", icon: User, color: "#3B6FE0", implemented: true },
  { key: "department", label: "Department", icon: Building2, color: "#3B6FE0", implemented: true },
  { key: "country", label: "Country", icon: Globe2, color: "#0EA5A4", implemented: true },
  { key: "roles", label: "Roles", icon: Shield, color: "#8B5CF6", implemented: true },
  { key: "client", label: "Client", icon: Briefcase, color: "#EAB308", implemented: true },
  { key: "project-category", label: "Project Category", icon: Layers, color: "#8B5CF6", implemented: true },
  { key: "project-status", label: "Project Status", icon: Flag, color: "#E11D48", implemented: true },
  { key: "project-deal-status", label: "Project Deal Status", icon: Handshake, color: "#22A06B", implemented: true },
  { key: "billing-type", label: "Billing Type", icon: CalendarClock, color: "#8B5CF6", implemented: true },
  { key: "location", label: "Location", icon: MapPin, color: "#0EA5A4", implemented: true },
  { key: "designation", label: "Designation Master", icon: Tags, color: "#F59E0B", implemented: true },
  { key: "currency", label: "Currency", icon: Coins, color: "#22A06B", implemented: true },
  { key: "invoice-status", label: "Invoice Status", icon: Receipt, color: "#3B6FE0", implemented: true },
  { key: "permissions", label: "Permissions", icon: KeyRound, color: "#E11D48", implemented: true },
  // Parked per meeting notes #9, #15 — screens removed from nav, tables/flows left untouched:
  // { key: "user-roles", label: "Designation", icon: UserCog, color: "#0EA5A4", implemented: true },
  // { key: "approval-status", label: "Approval Status", icon: CheckCircle2, color: "#F59E0B", implemented: true },
];

export const PROJECT_MODULES = [
  { key: "project-dashboard", label: "Project Dashboard", icon: FolderKanban, color: "#22A06B", implemented: true },
  { key: "resource-allocation", label: "Resource Allocation", icon: Users2, color: "#F59E0B", implemented: true },
  { key: "pipeline-project", label: "Pipeline Project", icon: Handshake, color: "#8B5CF6", implemented: true },
  { key: "project-resources-txn", label: "Project Resources", icon: Users2, color: "#22A06B", implemented: true },
  { key: "project-document", label: "Project Document", icon: FileCheck, color: "#3B6FE0", implemented: true },
];

export const FINANCE_MODULES = [
  { key: "timesheet-approval", label: "Timesheet Approval", icon: ClipboardCheck, color: "#0EA5A4", implemented: true },
  { key: "project-approval", label: "Project Approval", icon: FileCheck, color: "#3B6FE0", implemented: true },
  { key: "billing", label: "Billing", icon: Landmark, color: "#8B5CF6", implemented: true },
  { key: "link-invoice", label: "Link Invoice", icon: Receipt, color: "#EAB308", implemented: true },
];

export const AUDIT_MODULES = [
  { key: "audit-log", label: "Audit Log", icon: ScrollText, color: "#6B7280", implemented: true },
];

export const MODULES = [...ADMIN_MODULES, ...PROJECT_MODULES, ...FINANCE_MODULES, ...AUDIT_MODULES];