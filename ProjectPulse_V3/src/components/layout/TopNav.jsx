import { Menu, ChevronRight } from "lucide-react";
import { ADMIN_MODULES, AUDIT_MODULES, FINANCE_MODULES, PROJECT_MODULES, MODULES } from "../../constants/modules";

const GROUP_LABELS = [
  [ADMIN_MODULES, "Admin"],
  [PROJECT_MODULES, "Project Management"],
  [FINANCE_MODULES, "Finance"],
  [AUDIT_MODULES, "Audits"],
];

// Slim navy top bar: menu button (small screens) + breadcrumb for the open screen.
// On the Dashboard the welcome banner IS the top of the page, so the bar collapses to
// just the menu button (visible on small screens only). Navigation lives in the left rail.
export function TopNav({ current, onToggleNav }) {
  const isDash = current === "dashboard";
  const mod = MODULES.find((m) => m.key === current);
  const group = GROUP_LABELS.find(([mods]) => mods.some((m) => m.key === current))?.[1];

  return (
    <header className={`pp-topbar${isDash ? " is-dash" : ""}`}>
      <button className="pp-menu-btn" onClick={onToggleNav} aria-label="Open menu"><Menu size={18} /></button>
      {!isDash && (
        <div className="pp-crumbs">
          {mod ? (
            <>
              <span className="pp-crumb-group">{group}</span>
              <ChevronRight size={14} className="pp-crumb-sep" />
              <span className="pp-crumb-cur">{mod.label}</span>
            </>
          ) : (
            <span className="pp-crumb-cur">Dashboard</span>
          )}
        </div>
      )}
    </header>
  );
}
