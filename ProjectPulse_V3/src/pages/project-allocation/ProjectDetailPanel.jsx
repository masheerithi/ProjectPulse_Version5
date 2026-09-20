import { useState } from "react";
import {
  Pencil,
  X,
  Users2,
  Percent,
  Clock,
  BadgeCheck,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { StatusBadge } from "../../components/common/StatusBadge";
import { COLORS } from "../../constants/theme";
import { findName, fmtDate, userLabel } from "./hooks";
import { callProjectDocumentFileFlow } from "../../api/flows";

function guessMime(fileName) {
  const ext = (fileName || "").split(".").pop()?.toLowerCase();
  const map = {
    pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
    gif: "image/gif", webp: "image/webp", txt: "text/plain",
    doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return map[ext] || "application/octet-stream";
}

function downloadBase64File(fileName, base64) {
  const mime = guessMime(fileName);
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "document";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function DocumentDownloadRow({ doc }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    callProjectDocumentFileFlow(doc.guid)
      .then((file) => {
        if (!file || !file.fileData) throw new Error("No file content stored for this document.");
        downloadBase64File(file.fileName || doc.docName, file.fileData);
      })
      .catch((e) => alert(e.message))
      .finally(() => setDownloading(false));
  };

  return (
    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>{doc.docName}</div>
        <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 }}>{doc.docType}</div>
      </div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.accentSoft, color: COLORS.accent, border: "none", borderRadius: 7, padding: "7px 11px", fontSize: 12.5, fontWeight: 600, cursor: downloading ? "default" : "pointer", flexShrink: 0 }}
      >
        {downloading ? <Loader2 size={13} className="spin" /> : <Download size={13} />} {downloading ? "…" : "Download"}
      </button>
    </div>
  );
}

export function ProjectDetailPanel({ project, onClose, onEdit, lookups }) {
  return (
    <div className="pp-panel" style={{ width: 420, background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", flexDirection: "column", boxShadow: "-8px 0 30px rgba(15,20,40,0.06)" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>{project.projectName}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{project.projectCode}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted }}><X size={18} /></button>
      </div>

      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <StatusBadge active={project.active} />
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, background: COLORS.accentSoft, padding: "3px 10px", borderRadius: 999 }}>
            {findName(lookups.categories, project.categoryId)}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase" }}>Client</div>
            <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 3 }}>{findName(lookups.clients, project.clientId)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase" }}>Billing Type</div>
            <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 3 }}>{findName(lookups.billingTypes, project.billingTypeId)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase" }}>Start Date</div>
            <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 3 }}>{fmtDate(project.startDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase" }}>Est. End Date</div>
            <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 3 }}>{fmtDate(project.endDate)}</div>
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 13.5, color: COLORS.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Users2 size={14} /> Resources ({project.resources.length})
        </div>

        {project.resources.length === 0 ? (
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, textAlign: "center", padding: "14px 0" }}>No resources assigned.</div>
        ) : project.resources.map((r) => (
          <div key={r.id} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>{userLabel(lookups.users, r.userId)}</div>
              {r.billable ? (
                <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.success, display: "flex", alignItems: "center", gap: 4 }}>
                  <BadgeCheck size={12} /> Billable
                </span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted }}>Non-billable</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{findName(lookups.roles, r.roleId)}</div>
            <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 12, color: COLORS.text }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Percent size={12} color={COLORS.textMuted} /> {r.allocationPct}%</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} color={COLORS.textMuted} /> {r.weeklyHours} hrs/wk</span>
            </div>
            <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 6 }}>{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</div>
          </div>
        ))}

        <div style={{ fontWeight: 700, fontSize: 13.5, color: COLORS.text, marginTop: 22, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <FileText size={14} /> Documents ({(project.documents || []).length})
        </div>

        {(project.documents || []).length === 0 ? (
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, textAlign: "center", padding: "14px 0" }}>No documents uploaded.</div>
        ) : project.documents.map((doc) => (
          <DocumentDownloadRow key={doc.guid} doc={doc} />
        ))}
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: COLORS.text }}>Close</button>
        <button onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "none", background: COLORS.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Pencil size={13} /> Edit Project
        </button>
      </div>
    </div>
  );
}