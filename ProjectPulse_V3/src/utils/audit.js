import { callAuditEmailFlow, callAuditLogFlow } from "../api/flows";
import { LS_CURRENT_USER } from "../constants/storage-keys";
import { lsGet } from "./storage";

/* ============================================================
    Every Create/Update/Delete/Approve/Reject across the app calls
    logAudit(screen, action, record) — same signature as before, so
    none of the 24 call sites elsewhere in the app needed to change.
    What changed is where the entry goes: previously appended to
    localStorage (LS_AUDIT_LOG), now written to the real SQL
    AuditLog table via callAuditLogFlow("CREATE", ...).

    Fire-and-forget, same as the audit email below it — a failed
    SQL write here shouldn't block or break whatever screen the
    user was actually using. Errors are logged to the console only.
    ============================================================ */
export function logAudit(screen, action, record) {
  const session = lsGet(LS_CURRENT_USER, null);
  const currentUsername = typeof session === "string" ? session : session?.username || "Administrator";

  const entry = {
    screen,
    action,
    record: record || "—",
    user: currentUsername,
    timestamp: new Date().toISOString(),
  };

  callAuditLogFlow("CREATE", entry).catch((e) => console.warn("Audit log SQL write failed:", e.message));
  callAuditEmailFlow(entry); // fire-and-forget, unchanged
}