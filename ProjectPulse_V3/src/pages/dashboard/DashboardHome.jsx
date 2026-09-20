import { useState, useEffect } from "react";
import {
  Building2,
  Handshake,
  Briefcase,
  Receipt,
  Loader2,
  Users2,
  FolderKanban,
  ClipboardCheck,
  FileCheck,
  ScrollText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  callClientFlow, callDealStatusFlow, callDepartmentFlow, callPipelineProjectFlow, callProjectFlow, callUserFlow,
  callTimesheetFlow, callProjectApprovalFlow, callApprovalStatusFlow, callProjectDocumentFlow, callAuditLogFlow,
} from "../../api/flows";
import { LS_LINK_INVOICES } from "../../constants/storage-keys";
import { CHART_PALETTE, COLORS, cardStyle } from "../../constants/theme";
import { formatINR, parseCurrency } from "../../utils/format";
// Invoice has no SQL flow case yet (unlike Timesheet/ProjectApproval/
// ProjectDocument/AuditLog below) — Flow1 was never extended with an
// "Invoice" entity case, so this one module is still seed-backed until
// that flow work happens. Tracked as a known gap, not an oversight.
import { seedLinkInvoices } from "../../utils/seed";
import { lsGet } from "../../utils/storage";
import { usePermissions } from "../../context/PermissionContext";

// Same "resolve by name, don't hardcode the id" approach as
// ProjectApprovalPage — see that file for the full rationale.
function findStatusId(statuses, pattern) {
  const hit = statuses.find((s) => pattern.test(s.name || ""));
  return hit ? Number(hit.guid) : null;
}

export const cardTitle = { display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, color: COLORS.text, marginBottom: 12 };

export const linkBtn = { background: "none", border: "none", color: COLORS.accent, fontSize: 12.5, fontWeight: 600, cursor: "pointer" };

export function DashboardHome({ onOpenModule, user }) {
  const { canOpen } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [dealStatuses, setDealStatuses] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const [approvalStatuses, setApprovalStatuses] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Split into two batches instead of one 11-wide Promise.all. All 11 calls
    // share the same SQL connection (shared_sql-3) across FLOW_URL and
    // NEW_FLOW_URL, and firing them all at once — on top of warmFlowCache's
    // own 17 calls already in flight from AppShell — saturates that
    // connection's concurrency limit. The 4 NEW_FLOW_URL calls (Timesheet,
    // ProjectApproval, ProjectDocument, AuditLog) consistently lost that
    // race and came back 502 NoResponse. Running them only after the first
    // batch settles keeps total in-flight calls low enough to avoid that.
    Promise.all([
      callDepartmentFlow("LIST"), callUserFlow("LIST"), callClientFlow("LIST"), callProjectFlow("LIST"),
      callPipelineProjectFlow("LIST"), callDealStatusFlow("LIST"), callApprovalStatusFlow("LIST"),
    ])
      .then(([dept, usr, cli, proj, pipe, deals, apprStatus]) => {
        if (cancelled) return;
        setDepartments(dept.data);
        setUsers(usr.data);
        setClients(cli.data);
        setProjects(proj.data);
        setPipeline(pipe.data);
        setDealStatuses(deals.data);
        setApprovalStatuses(apprStatus.data);

        return Promise.all([
          callTimesheetFlow("LIST"), callProjectApprovalFlow("LIST"),
          callProjectDocumentFlow("LIST"), callAuditLogFlow("LIST"),
        ]);
      })
      .then((flow2Results) => {
        if (cancelled || !flow2Results) return;
        const [ts, appr, docs, audit] = flow2Results;
        setTimesheets(ts.data);
        setApprovals(appr.data);
        setDocuments(docs.data);
        setAuditLog(audit.data);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    // Invoice has no SQL flow case yet — see the import comment above.
    setInvoices(lsGet(LS_LINK_INVOICES, null) || seedLinkInvoices());

    return () => { cancelled = true; };
  }, []);

  // --- SQL-backed metrics ---
  const activeDepartments = departments.filter((d) => d.active).length;
  const activeProjects = projects.filter((p) => p.active).length;
  const activeUsers = users.filter((u) => u.active).length;
  const activeClients = clients.filter((c) => c.active).length;

  // --- Local-module metrics ---
  const dealStatusName = (id) => dealStatuses.find((d) => String(d.id) === String(id))?.name || "";
  const openPipeline = pipeline.filter((p) => {
    const s = dealStatusName(p.dealStatusId);
    return s !== "Won" && s !== "Lost";
  });
  const pipelineValue = openPipeline.reduce((s, p) => s + Number(p.dealValue || 0), 0);
  const wonValue = pipeline.filter((p) => dealStatusName(p.dealStatusId) === "Won").reduce((s, p) => s + Number(p.dealValue || 0), 0);

  const pendingTimesheets = timesheets.filter((t) => t.status === "Pending").length;

  // A project counts as "decided" once it has a ProjectApproval row whose
  // status resolves to Approved or Rejected in the real master data — same
  // logic as ProjectApprovalPage (no persisted "Pending" row; absence of a
  // decision IS pending).
  const approvedStatusId = findStatusId(approvalStatuses, /approv/i);
  const rejectedStatusId = findStatusId(approvalStatuses, /reject/i);
  const decidedProjectIds = new Set(
    approvals
      .filter((a) => (approvedStatusId != null && String(a.approvalStatusId) === String(approvedStatusId))
        || (rejectedStatusId != null && String(a.approvalStatusId) === String(rejectedStatusId)))
      .map((a) => String(a.projectId))
  );
  const pendingProjectApprovals = projects.filter((p) => !decidedProjectIds.has(String(p.guid))).length;
  const totalPendingApprovals = pendingTimesheets + pendingProjectApprovals;

  const unlinkedInvoices = invoices.filter((i) => i.status === "Unlinked");
  const totalInvoiceValue = invoices.reduce((s, i) => s + parseCurrency(i.amount), 0);

  const kpisRow1 = [
    { label: "Active Departments", value: String(activeDepartments), icon: Building2, color: "#3B6FE0" },
    { label: "Open Projects", value: String(activeProjects), icon: FolderKanban, color: "#22A06B" },
    { label: "Active Users", value: String(activeUsers), icon: Users2, color: "#8B5CF6" },
    { label: "Active Clients", value: String(activeClients), icon: Briefcase, color: "#EAB308" },
  ];

  const kpisRow2 = [
    { label: "Open Pipeline Value", value: formatINR(pipelineValue), icon: Handshake, color: "#8B5CF6", sub: `${openPipeline.length} active deals` },
    { label: "Pending Approvals", value: String(totalPendingApprovals), icon: ClipboardCheck, color: "#F59E0B", sub: `${pendingTimesheets} timesheets · ${pendingProjectApprovals} projects` },
    { label: "Unlinked Invoices", value: String(unlinkedInvoices.length), icon: Receipt, color: "#D6483E", sub: `${formatINR(totalInvoiceValue)} total tracked` },
    { label: "Documents on File", value: String(documents.length), icon: FileCheck, color: "#0EA5A4", sub: `${projects.length || pipeline.length} projects covered` },
  ];

  // --- Chart data ---
  const deptHeadcount = departments.map((d) => ({
    name: d.name,
    value: users.filter((u) => String(u.departmentId) === String(d.guid)).length,
  })).filter((d) => d.value > 0);

  const genderCounts = {};
  users.forEach((u) => {
    const g = u.gender || "Unspecified";
    genderCounts[g] = (genderCounts[g] || 0) + 1;
  });
  const genderSplit = Object.entries(genderCounts).map(([name, value], i) => ({
    name, value, color: CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  const stageCounts = {};
  pipeline.forEach((p) => {
    const s = dealStatusName(p.dealStatusId) || "Unspecified";
    stageCounts[s] = (stageCounts[s] || 0) + 1;
  });
  const pipelineByStage = Object.entries(stageCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((s) => s.value > 0);

  // --- Recent activity (audit log) ---
  const recentActivity = [...auditLog]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 7);

  const actionColor = (action) => {
    if (action === "Delete" || action === "Reject") return COLORS.danger;
    if (action === "Create" || action === "Approve") return COLORS.success;
    return COLORS.accent;
  };

  const timeAgo = (ts) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ overflowY: "auto", flex: 1 }}>
      <div className="pp-dash-head">
        <div className="pp-dash-row">
          <div className="pp-dash-avatar">{(user || "A")[0].toUpperCase()}</div>
          <div>
            <div className="pp-dash-title">Welcome back, {user || "there"} 👋</div>
            <div className="pp-dash-sub">Here's the pulse of your projects, pipeline and people today.</div>
          </div>
        </div>
      </div>

      <div className="pp-dash-body">
      <div className="pp-statpanel">
      {/* KPI ROW 1 — SQL master data */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 14 }}>
        {kpisRow1.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: COLORS.textMuted, fontSize: 12.5, fontWeight: 600 }}>{k.label}</span>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: `${k.color}1F`, color: k.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} />
                </span>
              </div>
              <div style={{ fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 700, color: COLORS.text, marginTop: 10 }}>
                {loading ? <Loader2 size={20} className="spin" /> : k.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI ROW 2 — Finance / Transaction rollups */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 22 }}>
        {kpisRow2.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: COLORS.textMuted, fontSize: 12.5, fontWeight: 600 }}>{k.label}</span>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: `${k.color}1F`, color: k.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} />
                </span>
              </div>
              <div style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.text, marginTop: 10 }}>{k.value}</div>
              <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 3 }}>{k.sub}</div>
            </div>
          );
        })}
      </div>
      </div>

      {/* CHARTS ROW */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={cardTitle}><Building2 size={14} /> Headcount by Department</div>
              {canOpen("department") && <button onClick={() => onOpenModule("department")} style={linkBtn}>Manage →</button>}
            </div>
            {deptHeadcount.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>No users assigned yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptHeadcount}>
                  <CartesianGrid stroke={COLORS.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLORS.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={cardStyle}>
            <div style={cardTitle}><Users2 size={14} /> Users by Gender</div>
            {genderSplit.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>No users yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderSplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                    {genderSplit.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={cardTitle}><Handshake size={14} /> Pipeline by Stage</div>
              {canOpen("pipeline-project") && <button onClick={() => onOpenModule("pipeline-project")} style={linkBtn}>View →</button>}
            </div>
            {pipelineByStage.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>No pipeline deals yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pipelineByStage} layout="vertical">
                  <CartesianGrid stroke={COLORS.border} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: COLORS.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: COLORS.textMuted }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* LOWER ROW — Recent Activity + Action Center */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={cardTitle}><ScrollText size={14} /> Recent Activity</div>
            {canOpen("audit-log") && <button onClick={() => onOpenModule("audit-log")} style={linkBtn}>View full log →</button>}
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>No activity recorded yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentActivity.map((r) => (
                <div key={r.guid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 4px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: actionColor(r.action), width: 60, flexShrink: 0 }}>{r.action}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>{r.record}</div>
                      <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>{r.screen} · {r.user}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.textMuted, flexShrink: 0 }}>{timeAgo(r.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={cardTitle}><ClipboardCheck size={14} /> Needs Your Attention</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                onClick={() => canOpen("timesheet-approval") && onOpenModule("timesheet-approval")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: COLORS.bg, borderRadius: 9, cursor: canOpen("timesheet-approval") ? "pointer" : "default" }}
              >
                <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>Timesheets pending</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{pendingTimesheets}</span>
              </div>
              <div
                onClick={() => canOpen("project-approval") && onOpenModule("project-approval")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: COLORS.bg, borderRadius: 9, cursor: canOpen("project-approval") ? "pointer" : "default" }}
              >
                <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>Project approvals pending</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{pendingProjectApprovals}</span>
              </div>
              <div
                onClick={() => canOpen("link-invoice") && onOpenModule("link-invoice")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: COLORS.bg, borderRadius: 9, cursor: canOpen("link-invoice") ? "pointer" : "default" }}
              >
                <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>Invoices to link</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.danger }}>{unlinkedInvoices.length}</span>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitle}><Handshake size={14} /> Pipeline Summary</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, color: COLORS.textMuted }}>Open value</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text }}>{formatINR(pipelineValue)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: COLORS.textMuted }}>Won value</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.success }}>{formatINR(wonValue)}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}