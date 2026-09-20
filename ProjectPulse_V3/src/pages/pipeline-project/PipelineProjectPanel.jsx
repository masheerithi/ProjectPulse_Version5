import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { COLORS, inputStyle, labelStyle } from "../../constants/theme";
import { activeOptions } from "../../utils/validation";

export function PipelineProjectPanel({ mode, data, clients, dealStatuses, users, departments, billingTypes, currencies, saving, error, onCancel, onClose, onSubmit }) {
  const [form, setForm] = useState(data);
  useEffect(() => setForm(data), [data]);

  return (
    <div className="pp-panel" style={{ width: 380, background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", flexDirection: "column", boxShadow: "-8px 0 30px rgba(15,20,40,0.06)" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{mode === "add" ? "Add Pipeline Project" : "Edit Pipeline Project"}</div>
          <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 2 }}>Fill all required fields below</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted }}><X size={18} /></button>
      </div>
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <label style={labelStyle}>Pipeline Code</label>
        <input value={form.pipelineCode || ""} onChange={(e) => setForm({ ...form, pipelineCode: e.target.value })} placeholder="e.g. PIPE-1001" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Project / Opportunity Name*</label>
        <input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="e.g. Retail Analytics Suite" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Opportunity Name</label>
        <input value={form.opportunityName || ""} onChange={(e) => setForm({ ...form, opportunityName: e.target.value })} placeholder="Optional — if different from project name" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Client*</label>
        <select value={form.clientId || ""} onChange={(e) => setForm({ ...form, clientId: e.target.value })} style={inputStyle}>
          <option value="">Select client</option>
          {activeOptions(clients, form.clientId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Project Manager</label>
            <select value={form.projectManagerUserId || ""} onChange={(e) => setForm({ ...form, projectManagerUserId: e.target.value })} style={inputStyle}>
              <option value="">Select PM</option>
              {activeOptions(users, form.projectManagerUserId).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Delivery Head</label>
            <select value={form.deliveryHeadUserId || ""} onChange={(e) => setForm({ ...form, deliveryHeadUserId: e.target.value })} style={inputStyle}>
              <option value="">Select Delivery Head</option>
              {activeOptions(users, form.deliveryHeadUserId).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
        </div>

        <label style={{ ...labelStyle, marginTop: 14 }}>Sales Owner</label>
        <select value={form.ownerUserId || ""} onChange={(e) => setForm({ ...form, ownerUserId: e.target.value })} style={inputStyle}>
          <option value="">Select owner</option>
          {activeOptions(users, form.ownerUserId).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Department</label>
        <select value={form.departmentId || ""} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} style={inputStyle}>
          <option value="">Select department</option>
          {activeOptions(departments, form.departmentId).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Project Type</label>
        <input value={form.projectType || ""} onChange={(e) => setForm({ ...form, projectType: e.target.value })} placeholder="e.g. T&M, Fixed Bid" style={inputStyle} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Billing Type</label>
            <select value={form.billingTypeId || ""} onChange={(e) => setForm({ ...form, billingTypeId: e.target.value })} style={inputStyle}>
              <option value="">Select</option>
              {activeOptions(billingTypes, form.billingTypeId).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Currency</label>
            <select value={form.currencyId || ""} onChange={(e) => setForm({ ...form, currencyId: e.target.value })} style={inputStyle}>
              <option value="">Select</option>
              {activeOptions(currencies, form.currencyId).map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
        </div>

        <label style={{ ...labelStyle, marginTop: 14 }}>Deal Value</label>
        <input type="number" value={form.dealValue} onChange={(e) => setForm({ ...form, dealValue: e.target.value })} placeholder="e.g. 3200000" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Stage</label>
        <select value={form.dealStatusId || ""} onChange={(e) => setForm({ ...form, dealStatusId: e.target.value })} style={inputStyle}>
          <option value="">Select stage</option>
          {activeOptions(dealStatuses, form.dealStatusId).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Expected Start Date</label>
            <input type="date" value={form.expectedStartDate || ""} onChange={(e) => setForm({ ...form, expectedStartDate: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Expected Close Date</label>
            <input type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Duration (months)</label>
            <input type="number" min="0" value={form.durationMonths || ""} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Probability %</label>
            <input type="number" min="0" max="100" value={form.probabilityPct || ""} onChange={(e) => setForm({ ...form, probabilityPct: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority || ""} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
              <option value="">Select</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Geography</label>
            <input value={form.geography || ""} onChange={(e) => setForm({ ...form, geography: e.target.value })} placeholder="e.g. APAC" style={inputStyle} />
          </div>
        </div>

        <label style={{ ...labelStyle, marginTop: 14 }}>Remarks</label>
        <textarea value={form.remarks || ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={3} placeholder="Optional notes" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />

        <div style={{
          marginTop: 14, padding: "10px 12px", background: "#F3F4F6", borderRadius: 8,
          fontSize: 11.5, color: COLORS.textMuted, lineHeight: 1.5,
        }}>
          Document upload (Proposal, Customer Requirements, Estimation Sheet, Draft SOW) isn't wired up yet — it needs a small backend addition. Flagged separately.
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>Active</span>
          <div onClick={() => setForm({ ...form, active: !form.active })} style={{ width: 40, height: 22, borderRadius: 999, background: form.active ? COLORS.accent : "#D7DCE6", position: "relative", cursor: "pointer", transition: "background 0.15s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.active ? 20 : 2, transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
          </div>
        </div>

        {error && <div style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.danger, fontSize: 12.5, marginTop: 16 }}><AlertCircle size={14} /> {error}</div>}
      </div>
      <div style={{ padding: 16, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={() => setForm(data)} style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: COLORS.text }}>Cancel</button>
        <button onClick={() => onSubmit(form)} disabled={saving} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: COLORS.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", gap: 7 }}>
          {saving && <Loader2 size={13} className="spin" />}
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>
    </div>
  );
}