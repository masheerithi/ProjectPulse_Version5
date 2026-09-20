// ProjectPanel.jsx (full file)
import { useState } from "react";
import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  Users2,
} from "lucide-react";
import { COLORS, inputStyle, labelStyle } from "../../constants/theme";
import { ResourceRow } from "./ResourceRow";
import { DocumentRow } from "./DocumentRow";
import { getCurrentUserId } from "../../utils/session";

let nextTempResourceId = -1;
let nextTempDocId = -1;

export function ProjectPanel({ mode, data, saving, error, onCancel, onClose, onSubmit, lookups, onDocumentToast, allResources = [] }) {
  const [form, setForm] = useState(data);

  const addResource = () => {
    setForm({
      ...form,
      resources: [...form.resources, {
        id: nextTempResourceId--, guid: "", userId: "", roleId: "", allocationPct: 100, weeklyHours: 40,
        billable: true, startDate: form.startDate, endDate: form.endDate,
      }],
    });
  };
  const updateResource = (idx, next) => {
    const list = [...form.resources];
    list[idx] = next;
    setForm({ ...form, resources: list });
  };
  const removeResource = (idx) => setForm({ ...form, resources: form.resources.filter((_, i) => i !== idx) });

  const addDocument = () => {
    // Defaults to the real signed-in user (session.js) now that auth is
    // wired up; falls back to empId "E001" only if, for some reason, the
    // session doesn't resolve to a known user.
    const currentUserId = getCurrentUserId();
    const currentUser = (lookups.users || []).find((u) => String(u.id) === String(currentUserId));
    const fallbackUser = (lookups.users || []).find((u) => u.empId === "E001");
    const defaultUser = currentUser || fallbackUser;
    setForm({
      ...form,
      documents: [...(form.documents || []), {
        id: nextTempDocId--, guid: "", docName: "", docType: "Contract",
        uploadedByUserId: defaultUser ? defaultUser.id : "",
        uploadDate: new Date().toISOString().slice(0, 10),
        fileName: "", fileData: "", active: true,
      }],
    });
  };
  const updateDocument = (idx, next) => {
    const list = [...form.documents];
    list[idx] = next;
    setForm({ ...form, documents: list });
  };
  const handleDocumentSaved = (idx, savedDoc) => {
    const list = [...(form.documents || [])];
    list[idx] = savedDoc;
    setForm({ ...form, documents: list });
  };
  const removeDocument = (idx) => setForm({ ...form, documents: (form.documents || []).filter((_, i) => i !== idx) });

  return (
    <div className="pp-panel" data-access-skip style={{ width: 420, background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", flexDirection: "column", boxShadow: "-8px 0 30px rgba(15,20,40,0.06)" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{mode === "add" ? "Add New Project" : "Edit Project"}</div>
          <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 2 }}>Fill project details and assign resources</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted }}><X size={18} /></button>
      </div>

      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <label style={labelStyle}>Project Code*</label>
        <input value={form.projectCode} onChange={(e) => setForm({ ...form, projectCode: e.target.value })} placeholder="e.g. PRJ1004" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Project Name*</label>
        <input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="e.g. Mobile App Revamp" style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Project Category*</label>
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} style={inputStyle}>
          <option value="">Select category</option>
          {lookups.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Client*</label>
        <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} style={inputStyle}>
          <option value="">Select client</option>
          {lookups.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Billing Type*</label>
        <select value={form.billingTypeId} onChange={(e) => setForm({ ...form, billingTypeId: e.target.value })} style={inputStyle}>
          <option value="">Select billing type</option>
          {lookups.billingTypes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 14 }}>Zoho Project ID</label>
        <input value={form.zohoProjectId || ""} onChange={(e) => setForm({ ...form, zohoProjectId: e.target.value })} placeholder="Required before Finance approval" style={inputStyle} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Project Manager</label>
            <select value={form.projectManagerUserId || ""} onChange={(e) => setForm({ ...form, projectManagerUserId: e.target.value })} style={inputStyle}>
              <option value="">Select PM</option>
              {(lookups.users || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Delivery Head</label>
            <select value={form.deliveryHeadUserId || ""} onChange={(e) => setForm({ ...form, deliveryHeadUserId: e.target.value })} style={inputStyle}>
              <option value="">Select Delivery Head</option>
              {(lookups.users || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        <label style={{ ...labelStyle, marginTop: 14 }}>Department</label>
        <select value={form.departmentId || ""} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} style={inputStyle}>
          <option value="">Select department</option>
          {(lookups.departments || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Currency</label>
            {/* Temporary fixed list until the Currency master has its own flow/screen — swap for lookups.currencies once that exists */}
            <select value={form.currencyCode || "INR"} onChange={(e) => setForm({ ...form, currencyCode: e.target.value })} style={inputStyle}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Project Value</label>
            <input type="number" min="0" step="0.01" value={form.projectValue || ""} onChange={(e) => setForm({ ...form, projectValue: e.target.value })} placeholder="e.g. 50000" style={inputStyle} />
          </div>
        </div>

        <label style={{ ...labelStyle, marginTop: 14 }}>Geography</label>
        <input value={form.geography || ""} onChange={(e) => setForm({ ...form, geography: e.target.value })} placeholder="e.g. APAC, EMEA" style={inputStyle} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>PO Number</label>
            <input value={form.poNumber || ""} onChange={(e) => setForm({ ...form, poNumber: e.target.value })} placeholder="e.g. PO-4021" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>SOW Reference</label>
            <input value={form.sowReference || ""} onChange={(e) => setForm({ ...form, sowReference: e.target.value })} placeholder="e.g. SOW-2026-014" style={inputStyle} />
          </div>
        </div>

        <label style={{ ...labelStyle, marginTop: 14 }}>Remarks</label>
        <textarea value={form.remarks || ""} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Optional notes" rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />

        <label style={{ ...labelStyle, marginTop: 14 }}>Project Status</label>
        <select value={form.projectStatusId || ""} onChange={(e) => setForm({ ...form, projectStatusId: e.target.value })} style={inputStyle}>
          <option value="">Select status</option>
          {(lookups.projectStatuses || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Start Date*</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Est. End Date*</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>Active</span>
          <div onClick={() => setForm({ ...form, active: !form.active })} style={{ width: 40, height: 22, borderRadius: 999, background: form.active ? COLORS.accent : "#D7DCE6", position: "relative", cursor: "pointer" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: form.active ? 20 : 2, transition: "left 0.15s" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
            <Users2 size={14} /> Resources ({form.resources.length})
          </div>
          <button onClick={addResource} style={{ display: "flex", alignItems: "center", gap: 5, background: COLORS.accentSoft, color: COLORS.accent, border: "none", borderRadius: 7, padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <Plus size={12} /> Add Resource
          </button>
        </div>

        {form.resources.length === 0 ? (
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, textAlign: "center", padding: "14px 0" }}>No resources assigned yet.</div>
        ) : form.resources.map((res, idx) => (
          <ResourceRow
            key={res.id} res={res}
            onChange={(next) => updateResource(idx, next)}
            onRemove={() => removeResource(idx)}
            lookups={lookups}
            allResources={allResources}
            currentProjectGuid={form.guid}
            formResources={form.resources}
          />
        ))}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: COLORS.text }}>
            Documents ({(form.documents || []).length})
          </div>
          <button onClick={addDocument} style={{ display: "flex", alignItems: "center", gap: 5, background: COLORS.accentSoft, color: COLORS.accent, border: "none", borderRadius: 7, padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            <Plus size={12} /> Add Document
          </button>
        </div>

        {!form.guid && (form.documents || []).length > 0 && (
          <div style={{ fontSize: 12, color: COLORS.accent, textAlign: "center", padding: "8px 0", marginBottom: 4 }}>
            Files chosen here are staged and will upload automatically once you Submit.
          </div>
        )}

        {(form.documents || []).length === 0 ? (
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, textAlign: "center", padding: "14px 0" }}>No documents added yet.</div>
        ) : form.documents.map((doc, idx) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            projectGuid={form.guid}
            onChange={(next) => updateDocument(idx, next)}
            onSaved={(saved) => handleDocumentSaved(idx, saved)}
            onDeleted={() => removeDocument(idx)}
            onToast={onDocumentToast}
          />
        ))}

        {error && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.danger, fontSize: 12.5, marginTop: 12 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
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