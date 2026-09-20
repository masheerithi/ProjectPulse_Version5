import { useState, useEffect } from "react";
import {
  X,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { COLORS, inputStyle, labelStyle } from "../../constants/theme";
import { activeOptions } from "../../utils/validation";

export function UserPanel({ mode, data, departments, locations, designations, roles, allUsers, saving, error, restricted, onCancel, onClose, onSubmit }) {
  const [form, setForm] = useState(data);
  useEffect(() => setForm(data), [data]);
  const lockedStyle = restricted ? { background: "#F3F4F6", color: COLORS.textMuted, cursor: "not-allowed" } : {};

  return (
    <div className="pp-panel" style={{
      width: 340, background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, flexShrink: 0,
      display: "flex", flexDirection: "column", boxShadow: "-8px 0 30px rgba(15,20,40,0.06)",
    }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{mode === "add" ? "Add New User" : "Edit User"}</div>
          <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 2 }}>Fill all required fields below</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted }}><X size={18} /></button>
      </div>

      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        {restricted && mode !== "add" && (
          <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginBottom: 14, padding: "8px 10px", background: "#F3F4F6", borderRadius: 8 }}>
            This user is linked to existing records — only Designation, Role and Department can be changed.
          </div>
        )}
        <label style={labelStyle}>Emp ID*</label>
        <input value={form.empId} onChange={(e) => setForm({ ...form, empId: e.target.value })} placeholder="e.g. EMP1001" disabled={restricted} style={{ ...inputStyle, ...lockedStyle }} />

        <label style={{ ...labelStyle, marginTop: 16 }}>First Name*</label>
        <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="e.g. John" disabled={restricted} style={{ ...inputStyle, ...lockedStyle }} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Last Name*</label>
        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="e.g. Doe" disabled={restricted} style={{ ...inputStyle, ...lockedStyle }} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Gender</label>
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} disabled={restricted} style={{ ...inputStyle, ...lockedStyle }}>
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Designation</label>
        {(() => {
          // The User flow only persists a free-text JobTitle column — there
          // is no DesignationID on this entity (unlike ProjectResource,
          // which does have one). So the dropdown is a data-entry aid over
          // the Designation Master, but what's actually saved/loaded is the
          // designation's Name into form.jobTitle. Match the stored name
          // back to a designation so the dropdown can preselect it on edit.
          const selected = (designations || []).find((d) => d.name === form.jobTitle);
          return (
            <select
              value={selected ? selected.id : ""}
              onChange={(e) => {
                const chosen = (designations || []).find((d) => String(d.id) === e.target.value);
                setForm({ ...form, jobTitle: chosen ? chosen.name : "" });
              }}
              style={inputStyle}
            >
              <option value="">Select designation</option>
              {activeOptions(designations, selected?.id).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          );
        })()}

        <label style={{ ...labelStyle, marginTop: 16 }}>Role(s)</label>
        {(() => {
          // Roles drive which screens this user can open (Admin -> Permissions). Kept editable
          // even when the rest of the record is locked, like Designation and Department.
          const selectedIds = (form.roleIds || []).map(String);
          const options = (roles || []).filter((r) => r.active || selectedIds.includes(String(r.guid)));
          const toggleRole = (id) => {
            const sid = String(id);
            setForm({ ...form, roleIds: selectedIds.includes(sid) ? selectedIds.filter((x) => x !== sid) : [...selectedIds, sid] });
          };
          return (
            <>
              <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "6px 10px", maxHeight: 150, overflowY: "auto" }}>
                {options.length === 0 && <div style={{ fontSize: 12.5, color: COLORS.textMuted, padding: "6px 0" }}>No roles available — add them under Admin → Roles.</div>}
                {options.map((r) => (
                  <label key={r.guid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13, color: COLORS.text, cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedIds.includes(String(r.guid))} onChange={() => toggleRole(r.guid)} style={{ width: 15, height: 15, cursor: "pointer" }} />
                    {r.name}{!r.active && <span style={{ color: COLORS.textMuted }}> (inactive)</span>}
                  </label>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 5 }}>
                No role = Dashboard only. Fine-tune a single user under Admin → Permissions.
              </div>
            </>
          );
        })()}

        <label style={{ ...labelStyle, marginTop: 16 }}>Email*</label>
        <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. jane.doe@company.com" disabled={restricted} style={{ ...inputStyle, ...lockedStyle }} />

        <label style={{ ...labelStyle, marginTop: 16 }}>Reporting Manager</label>
        <select value={form.reportingManagerId || ""} onChange={(e) => setForm({ ...form, reportingManagerId: e.target.value })} disabled={restricted} style={{ ...inputStyle, ...lockedStyle }}>
          <option value="">Select manager</option>
          {activeOptions(allUsers, form.reportingManagerId).filter((u) => u.guid !== form.guid).map((u) => (
            <option key={u.guid} value={u.guid}>{u.firstName} {u.lastName}</option>
          ))}
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Location</label>
        <select value={form.locationId || ""} onChange={(e) => setForm({ ...form, locationId: e.target.value })} disabled={restricted} style={{ ...inputStyle, ...lockedStyle }}>
          <option value="">Select location</option>
          {activeOptions(locations, form.locationId).map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <label style={{ ...labelStyle, marginTop: 16 }}>Department</label>
        <select value={form.departmentId || ""} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} style={inputStyle}>
          <option value="">Select department</option>
          {activeOptions(departments, form.departmentId).map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>Active</span>
          <div
            onClick={() => !restricted && setForm({ ...form, active: !form.active })}
            style={{
              width: 40, height: 22, borderRadius: 999, background: form.active ? COLORS.accent : "#D7DCE6",
              position: "relative", cursor: restricted ? "not-allowed" : "pointer", transition: "background 0.15s",
              opacity: restricted ? 0.6 : 1,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2,
              left: form.active ? 20 : 2, transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }} />
          </div>
        </div>

        {error && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.danger, fontSize: 12.5, marginTop: 16 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={() => setForm(data)} style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: COLORS.text }}>
          Cancel
        </button>
        <button
          onClick={() => onSubmit(form)}
          disabled={saving}
          style={{
            padding: "9px 18px", borderRadius: 8, border: "none", background: COLORS.accent, color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", opacity: saving ? 0.75 : 1,
            display: "flex", alignItems: "center", gap: 7,
          }}
        >
          {saving && <Loader2 size={13} className="spin" />}
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>
    </div>
  );
}