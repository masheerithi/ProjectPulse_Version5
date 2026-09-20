import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  callBillingFlow,
  callBillingPeriodFlow,
  callProjectFlow,
  callBillingTypeFlow,
  callCurrencyFlow,
  callUserFlow,
  callApprovalStatusFlow,
} from "../../api/flows";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { EmptyState } from "../../components/common/EmptyState";
import { COLORS, cardStyle, inputStyle } from "../../constants/theme";
import { BillingPanel } from "./BillingPanel";
import { logAudit } from "../../utils/audit";

const EMPTY_FORM = {
  guid: "", projectId: "", billingPeriodId: "", billingTypeId: "", milestoneName: "",
  amount: "", currencyId: "", submittedByUserId: "", approvalStatusId: "", remarks: "", active: true,
};

export function BillingPage() {
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const [billingPeriods, setBillingPeriods] = useState([]);
  const [billingTypes, setBillingTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [approvalStatuses, setApprovalStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [panel, setPanel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setListError("");
    callBillingFlow("LIST").then((res) => {
      setRows(res.data);
      setLoading(false);
    }).catch((e) => {
      setListError(e.message);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { callProjectFlow("LIST").then((res) => setProjects(res.data)); }, []);
  useEffect(() => { callBillingPeriodFlow("LIST").then((res) => setBillingPeriods(res.data)).catch(() => {}); }, []);
  useEffect(() => { callBillingTypeFlow("LIST").then((res) => setBillingTypes(res.data)); }, []);
  useEffect(() => { callCurrencyFlow("LIST").then((res) => setCurrencies(res.data)).catch(() => {}); }, []);
  useEffect(() => { callUserFlow("LIST").then((res) => setUsers(res.data)); }, []);
  useEffect(() => { callApprovalStatusFlow("LIST").then((res) => setApprovalStatuses(res.data)); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);

  const projectLabel = (id) => {
    const p = projects.find((x) => String(x.id) === String(id));
    return p ? `${p.projectCode} — ${p.projectName}` : "—";
  };
  const billingTypeName = (id) => billingTypes.find((b) => String(b.id) === String(id))?.name || "—";
  const periodName = (id) => billingPeriods.find((p) => String(p.id) === String(id))?.periodName || "—";
  const currencyCode = (id) => currencies.find((c) => String(c.id) === String(id))?.code || "";
  const approvalStatusName = (id) => approvalStatuses.find((s) => String(s.guid) === String(id))?.name || "Draft";

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || projectLabel(r.projectId).toLowerCase().includes(q) || (r.milestoneName || "").toLowerCase().includes(q);
    const matchesStatus = !statusFilter || approvalStatusName(r.approvalStatusId) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = rows.filter((r) => {
    const name = approvalStatusName(r.approvalStatusId).toLowerCase();
    return !name.includes("approv") && !name.includes("reject");
  }).length;
  const approvedCount = rows.filter((r) => approvalStatusName(r.approvalStatusId).toLowerCase().includes("approv")).length;
  const rejectedCount = rows.filter((r) => approvalStatusName(r.approvalStatusId).toLowerCase().includes("reject")).length;

  const kpis = [
    { label: "Pending", value: String(pendingCount), icon: FileCheck, color: "#F59E0B" },
    { label: "Approved", value: String(approvedCount), icon: CheckCircle2, color: COLORS.success },
    { label: "Rejected", value: String(rejectedCount), icon: AlertCircle, color: COLORS.danger },
  ];

  const submitPanel = (form) => {
    if (!form.projectId || !form.billingTypeId || !form.amount) {
      setErr("Project, Billing Type and Amount are required.");
      return;
    }
    setSaving(true);
    setErr("");
    const action = form.guid ? "EDIT" : "CREATE";
    callBillingFlow(action, form)
      .then((res) => {
        setRows(res.data);
        setSaving(false);
        setPanel(null);
        logAudit("Billing", form.guid ? "Update" : "Create", form.milestoneName || projectLabel(form.projectId));
        setToast(form.guid ? "Billing record updated." : "Billing submitted.");
      })
      .catch((e) => {
        setSaving(false);
        setErr(e.message);
      });
  };

  const confirmDeleteRow = () => {
    if (!confirmDelete) return;
    setDeleting(true);
    callBillingFlow("DELETE", confirmDelete)
      .then((res) => {
        setRows(res.data);
        setDeleting(false);
        setConfirmDelete(null);
        logAudit("Billing", "Delete", confirmDelete.milestoneName || projectLabel(confirmDelete.projectId));
        setToast("Billing record deleted.");
      })
      .catch((e) => {
        setDeleting(false);
        setToast(`Delete failed: ${e.message}`);
      });
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
      <div style={{ flex: 1, padding: 26, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "Sora, sans-serif", fontSize: 20, fontWeight: 700, color: COLORS.text }}>Billing</div>
            <div style={{ color: COLORS.textMuted, fontSize: 13.5 }}>Submit and approve monthly T&M or Fixed Bid milestone billing</div>
          </div>
          <button
            onClick={() => setPanel({ mode: "add", data: { ...EMPTY_FORM } })}
            style={{ display: "flex", alignItems: "center", gap: 7, background: COLORS.accent, color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
          >
            <Plus size={15} /> Submit Billing
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textMuted, fontSize: 12.5, fontWeight: 600 }}>{k.label}</span>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: `${k.color}1F`, color: k.color, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={15} /></span>
                </div>
                <div style={{ fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 700, color: COLORS.text, marginTop: 10 }}>{k.value}</div>
              </div>
            );
          })}
        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>Billing Records <span style={{ color: COLORS.textMuted, fontWeight: 500 }}>({filtered.length})</span></div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 11px", width: 240 }}>
                <Search size={14} color={COLORS.textMuted} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by project or milestone" style={{ border: "none", outline: "none", fontSize: 13, width: "100%", fontFamily: "Inter, sans-serif" }} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 150, padding: "7px 11px" }}>
                <option value="">All Statuses</option>
                {approvalStatuses.map((s) => <option key={s.guid} value={s.name}>{s.name}</option>)}
              </select>
              <button onClick={refresh} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 8, padding: "0 12px", fontSize: 12.5, cursor: "pointer", color: COLORS.text }}>
                <RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {["Project", "Billing Type", "Period", "Milestone", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Actions" ? "center" : "left", padding: "10px 16px", fontSize: 12, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>
                  <Loader2 size={18} className="spin" style={{ verticalAlign: "middle", marginRight: 8 }} /> Loading billing records…
                </td></tr>
              ) : listError ? (
                <tr><td colSpan={7}><EmptyState icon={Receipt} onRetry={refresh} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: COLORS.textMuted }}>No data available.</td></tr>
              ) : filtered.map((r, i) => {
                const statusName = approvalStatusName(r.approvalStatusId);
                const statusLower = statusName.toLowerCase();
                const bg = statusLower.includes("approv") ? COLORS.successSoft : statusLower.includes("reject") ? COLORS.dangerSoft : "#FEF3C7";
                const fg = statusLower.includes("approv") ? COLORS.success : statusLower.includes("reject") ? COLORS.danger : "#B45309";
                return (
                  <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.border}`, background: i % 2 ? "#FAFBFD" : "#fff" }}>
                    <td style={{ padding: "11px 16px", fontSize: 13.5, color: COLORS.text, fontWeight: 600 }}>{projectLabel(r.projectId)}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13.5, color: COLORS.text }}>{billingTypeName(r.billingTypeId)}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13.5, color: COLORS.text }}>{periodName(r.billingPeriodId)}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13.5, color: COLORS.text }}>{r.milestoneName || "—"}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13.5, color: COLORS.text }}>{currencyCode(r.currencyId)} {Number(r.amount || 0).toLocaleString()}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: bg, color: fg }}>{statusName}</span>
                    </td>
                    <td style={{ padding: "11px 16px", textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button onClick={() => setPanel({ mode: "edit", data: { ...EMPTY_FORM, ...r } })} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLORS.accentSoft, color: COLORS.accent, border: "none", borderRadius: 7, padding: "6px 11px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => setConfirmDelete(r)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLORS.dangerSoft, color: COLORS.danger, border: "none", borderRadius: 7, padding: "6px 11px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {panel && (
        <BillingPanel
          mode={panel.mode}
          data={panel.data}
          projects={projects}
          billingPeriods={billingPeriods}
          billingTypes={billingTypes}
          currencies={currencies}
          users={users}
          approvalStatuses={approvalStatuses}
          saving={saving}
          error={err}
          onCancel={() => {
            if (panel?.mode === "add") {
              setPanel({ mode: "add", data: { ...EMPTY_FORM } });
            } else {
              setPanel(null);
            }
            setErr("");
          }}
          onClose={() => setPanel(null)}
          onSubmit={submitPanel}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete this billing record?"
          message={`"${confirmDelete.milestoneName || projectLabel(confirmDelete.projectId)}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
          busy={deleting}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteRow}
        />
      )}

      {toast && (
        <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", background: COLORS.text, color: "#fff", padding: "10px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 12px 30px rgba(0,0,0,0.2)" }}>
          <CheckCircle2 size={15} color={COLORS.success} /> {toast}
        </div>
      )}
    </div>
  );
}