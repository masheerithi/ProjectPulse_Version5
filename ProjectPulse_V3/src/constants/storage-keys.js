export const LS_CURRENT_USER = "pp_current_user";

// Invoice has no SQL flow case yet — LinkInvoicePage still falls back
// to seedLinkInvoices() via this key. Every other former localStorage
// key (audit log, timesheets, project approvals, project documents)
// has been removed now that those modules read/write real SQL through
// the flows in src/api/flows.js.
export const LS_LINK_INVOICES = "pp_link_invoices";