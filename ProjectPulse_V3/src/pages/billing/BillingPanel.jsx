import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { COLORS, inputStyle, labelStyle } from "../../constants/theme";
import { activeOptions } from "../../utils/validation";

export function BillingPanel({ mode, data, projects, billingPeriods, billingTypes, currencies, users, approvalStatuses, saving, error, onCancel, onClose, onSubmit }) {
  const [form, setForm] = useState(data);
  useEffect(() => setForm(data), [data]);

  return (
    <div className="pp-panel" style={{ width: 360, background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", flexDirection: "column", boxShadow: "-8px 0 30px rgba(15,20,40,0.06)" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{mode === "add" ? "Submit Billing" : "Edit Billing"}</div>
          <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 2 }}>Monthly T&M or Fixed Bid milestone billing</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted }}><X size={18} /></button>
      </div>
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <label style={labelStyle}>Project*</label>
        <select value={form.projectId || ""} onChange={(e) => setForm({ ...form, projectId: e.target.value })} style={inputStyle}>
          <option value="">Select project</option>
          {activeOptions(projects, form.projectId).map((p) => <option key={p.id} value={p.id}>{p.projectCode} — {p.projectName}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Billing Type*</label>
        <select value={form.billingTypeId || ""} onChange={(e) => setForm({ ...form, billingTypeId: e.target.value })} style={inputStyle}>
          <option value="">Select billing type</option>
          {activeOptions(billingTypes, form.billingTypeId).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Billing Period</label>
        <select value={form.billingPeriodId || ""} onChange={(e) => setForm({ ...form, billingPeriodId: e.target.value })} style={inputStyle}>
          <option value="">Select period</option>
          {activeOptions(billingPeriods, form.billingPeriodId).map((p) => <option key={p.id} value={p.id}>{p.periodName}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Milestone Name</label>
        <input value={form.milestoneName || ""} onChange={(e) => setForm({ ...form, milestoneName: e.target.value })} placeholder="e.g. Phase 1 delivery (Fixed Bid only)" style={inputStyle} />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Amount*</label>
            <input type="number" min="0" step="0.01" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 450000" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Currency</label>
            <select value={form.currencyId || ""} onChange={(e) => setForm({ ...form, currencyId: e.target.value })} style={inputStyle}>
              <option value="">—</option>
              {activeOptions(currencies, form.currencyId).map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
        </div>

        <label style={{ ...labelStyle, marginTop: 14 }}>Submitted By</label>
        <select value={form.submittedByUserId || ""} onChange={(e) => setForm({ ...form, submittedByUserId: e.target.value })} style={inputStyle}>
          <option value="">Select user</option>
          {activeOptions(users, form.submittedByUserId).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
        </select>

        {mode === "edit" && (
          <>
            <label style={{ ...labelStyle, marginTop: 14 }}>Approval Status</label>
            <select value={form.approvalStatusId || ""} onChange={(e) => setForm({ ...form, approvalStatusId: e.target.value })} style={inputStyle}>
              <option value="">Select status</option>
              {activeOptions(approvalStatuses, form.approvalStatusId).map((s) => <option key={s.guid} value={s.guid}>{s.name}</option>)}
            </select>

            <label style={{ ...labelStyle, marginTop: 14 }}>Remarks</label>
            <textarea value={form.remarks || ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={3} placeholder="Notes on this billing record…" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          </>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>Active</span>
          <div onClick={() => setForm({ ...form, active: !form.active })} style={{ width: 40, height: 22, borderRadius: 999, background: form.active ? COLORS.accent : "#D7DCE6", position: "relative", cursor: "pointer" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.active ? 20 : 2, transition: "left 0.15s" }} />
          </div>
        </div>

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