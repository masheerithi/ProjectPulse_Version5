import { useState } from "react";
import {
  X,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { COLORS, inputStyle, labelStyle } from "../../constants/theme";

export function AllocationPanel({ data, saving, error, onCancel, onClose, onSubmit, lookups, projects, designations, departments }) {
  const [form, setForm] = useState(data);
  return (
    <div className="pp-panel" style={{ width: 380, background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", flexDirection: "column", boxShadow: "-8px 0 30px rgba(15,20,40,0.06)" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>Add Resource Allocation</div>
          <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 2 }}>Assign a user to a project</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted }}><X size={18} /></button>
      </div>
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <label style={labelStyle}>Project*</label>
        <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} style={inputStyle}>
          <option value="">Select project</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.projectName}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Resource (User)*</label>
        <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} style={inputStyle}>
          <option value="">Select user</option>
          {lookups.users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Role*</label>
        <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} style={inputStyle}>
          <option value="">Select role</option>
          {lookups.roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Designation</label>
            <select value={form.designationId || ""} onChange={(e) => setForm({ ...form, designationId: e.target.value })} style={inputStyle}>
              <option value="">Select</option>
              {(designations || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <select value={form.departmentId || ""} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} style={inputStyle}>
              <option value="">Select</option>
              {(departments || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Allocation %</label>
            <input type="number" min={0} max={100} value={form.allocationPct} onChange={(e) => setForm({ ...form, allocationPct: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Weekly Hours</label>
            <input type="number" min={0} max={168} value={form.weeklyHours} onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Start Date*</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>End Date*</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>Billable</span>
          <div onClick={() => setForm({ ...form, billable: !form.billable })} style={{ width: 40, height: 22, borderRadius: 999, background: form.billable ? COLORS.accent : "#D7DCE6", position: "relative", cursor: "pointer" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.billable ? 20 : 2, transition: "left 0.15s" }} />
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