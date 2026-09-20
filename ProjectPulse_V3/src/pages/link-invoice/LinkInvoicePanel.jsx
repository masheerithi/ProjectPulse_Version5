import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { COLORS, inputStyle, labelStyle } from "../../constants/theme";
import { activeOptions } from "../../utils/validation";

export function LinkInvoicePanel({ mode, data, clients, projects, currencies, billingPeriods, invoiceStatuses, billingRecords, saving, error, onCancel, onClose, onSubmit }) {
  const [form, setForm] = useState(data);
  useEffect(() => setForm(data), [data]);

  const billingLabel = (b) => {
    if (b.milestoneName) return b.milestoneName;
    return `Billing #${b.id}${b.amount ? ` — ${b.amount}` : ""}`;
  };

  const projectsForClient = form.clientId
    ? projects.filter((p) => String(p.clientId) === String(form.clientId))
    : projects;

  return (
    <div className="pp-panel" style={{ width: 340, background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", flexDirection: "column", boxShadow: "-8px 0 30px rgba(15,20,40,0.06)" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{mode === "add" ? "Add Invoice" : "Edit Invoice"}</div>
          <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 2 }}>Fill all required fields below</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted }}><X size={18} /></button>
      </div>
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <label style={labelStyle}>Invoice Number*</label>
        <input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="e.g. INV-1003" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Client*</label>
        <select value={form.clientId || ""} onChange={(e) => setForm({ ...form, clientId: e.target.value, projectId: "" })} style={inputStyle}>
          <option value="">Select client…</option>
          {activeOptions(clients, form.clientId).map((c) => <option key={c.id} value={c.id}>{c.clientName}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Project</label>
        <select value={form.projectId || ""} onChange={(e) => setForm({ ...form, projectId: e.target.value })} style={inputStyle}>
          <option value="">Select project…</option>
          {activeOptions(projectsForClient, form.projectId).map((p) => <option key={p.id} value={p.id}>{p.projectCode ? `${p.projectCode} — ${p.projectName}` : p.projectName}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Linked Billing Record</label>
        <select value={form.billingId || ""} onChange={(e) => setForm({ ...form, billingId: e.target.value })} style={inputStyle}>
          <option value="">None — link directly to project/client</option>
          {activeOptions(billingRecords, form.billingId).map((b) => <option key={b.id} value={b.id}>{billingLabel(b)}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Invoice Date</label>
        <input type="date" value={form.invoiceDate || ""} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} style={inputStyle} />

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Amount</label>
            <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 450000" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Currency</label>
            <select value={form.currencyId || ""} onChange={(e) => setForm({ ...form, currencyId: e.target.value })} style={inputStyle}>
              <option value="">—</option>
              {activeOptions(currencies, form.currencyId).map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
        </div>

        <label style={{ ...labelStyle, marginTop: 16 }}>Billing Period</label>
        <select value={form.billingPeriodId || ""} onChange={(e) => setForm({ ...form, billingPeriodId: e.target.value })} style={inputStyle}>
          <option value="">Select billing period…</option>
          {activeOptions(billingPeriods, form.billingPeriodId).map((p) => <option key={p.id} value={p.id}>{p.periodName || p.name}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Total Billable Hours</label>
        <input type="number" min="0" step="0.5" value={form.totalBillableHours || ""} onChange={(e) => setForm({ ...form, totalBillableHours: e.target.value })} placeholder="e.g. 160" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Due Date</label>
        <input type="date" value={form.dueDate || ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Status</label>
        <select value={form.invoiceStatusId || ""} onChange={(e) => setForm({ ...form, invoiceStatusId: e.target.value })} style={inputStyle}>
          <option value="">Select status…</option>
          {activeOptions(invoiceStatuses, form.invoiceStatusId).map((s) => <option key={s.guid || s.id} value={s.guid || s.id}>{s.name}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Payment Date</label>
        <input type="date" value={form.paymentDate || ""} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Payment Reference</label>
        <input value={form.paymentReference || ""} onChange={(e) => setForm({ ...form, paymentReference: e.target.value })} placeholder="e.g. UTR/txn ref" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Finance Remarks</label>
        <textarea value={form.financeRemarks || ""} onChange={(e) => setForm({ ...form, financeRemarks: e.target.value })} placeholder="Notes for Finance…" rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />

        {error && <div style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.danger, fontSize: 12.5, marginTop: 16 }}><AlertCircle size={14} /> {error}</div>}
      </div>
      <div style={{ padding: 16, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: COLORS.text }}>Cancel</button>
        <button onClick={() => onSubmit(form)} disabled={saving} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: COLORS.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", gap: 7 }}>
          {saving && <Loader2 size={13} className="spin" />}
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
