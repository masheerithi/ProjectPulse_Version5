// ForgotPasswordPage.jsx — two-step reset: request a token, then use it
// to set a new password. No email connector is wired into the flow (see
// callAuthFlow's REQUEST_RESET doc comment in flows.js), so the token is
// shown directly on screen for now — good enough for an admin resetting
// a colleague's password together, not a true unattended self-service
// flow until an email step is added on the flow side.
import { useState } from "react";
import bcrypt from "bcryptjs";
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Logo } from "../../components/common/Logo";
import { COLORS, inputStyle } from "../../constants/theme";
import { callAuthFlow } from "../../api/flows";

function asciiToBase64(str) { return btoa(str); }
function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function ForgotPasswordPage({ onGoToSignIn }) {
  const [step, setStep] = useState("request"); // "request" | "reset" | "done"
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [issuedToken, setIssuedToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const requestReset = () => {
    if (!username.trim()) { setError("Enter your username."); return; }
    setError(""); setBusy(true);
    const generatedToken = randomToken();
    const expiresOn = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
    callAuthFlow("REQUEST_RESET", { username: username.trim(), token: generatedToken, expiresOn })
      .then(() => {
        setIssuedToken(generatedToken);
        setStep("reset");
      })
      .catch((e) => setError(e.message || "Couldn't start a reset for that username."))
      .finally(() => setBusy(false));
  };

  const confirmReset = () => {
    if (!token.trim()) { setError("Enter the reset token."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); return; }
    setError(""); setBusy(true);
    const hash = bcrypt.hashSync(newPassword, 10);
    callAuthFlow("CONFIRM_RESET", { token: token.trim(), passwordHashB64: asciiToBase64(hash) })
      .then(() => setStep("done"))
      .catch((e) => setError(e.message || "That token is invalid or has expired."))
      .finally(() => setBusy(false));
  };

  return (
    <div className="pp-auth" style={{
      minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(1100px 600px at 15% 10%, #1E2748 0%, ${COLORS.navy} 55%, #0E1326 100%)`,
      fontFamily: "Inter, sans-serif", padding: 20,
    }}>
      <div className="pp-auth-card" style={{ width: "100%", maxWidth: 440, borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", background: COLORS.card, padding: "40px 36px" }}>
        <div style={{ marginBottom: 20 }}><Logo dark /></div>

        {step === "request" && (
          <>
            <div style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>Reset your password</div>
            <div style={{ color: COLORS.textMuted, fontSize: 13.5, marginBottom: 24 }}>Enter your username to get a reset token.</div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. jane.doe" style={inputStyle} autoFocus />
            {error && <div style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.danger, fontSize: 13, marginTop: 14 }}><AlertCircle size={15} /> {error}</div>}
            <button type="button" onClick={requestReset} disabled={busy} style={{ marginTop: 20, width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: busy ? "default" : "pointer", opacity: busy ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {busy && <Loader2 size={16} className="spin" />} {busy ? "Requesting…" : "Get reset token"}
            </button>
          </>
        )}

        {step === "reset" && (
          <>
            <div style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>Set a new password</div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: COLORS.accentSoft, borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: 12.5, color: COLORS.accent }}>
              <KeyRound size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                No email step is wired up yet, so here's your reset token directly — copy it into the field below (valid 30 minutes):
                <div style={{ fontFamily: "monospace", fontWeight: 700, marginTop: 6, wordBreak: "break-all", background: "#fff", padding: "6px 8px", borderRadius: 6 }}>{issuedToken}</div>
              </div>
            </div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Reset token</label>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="paste token" style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12.5 }} />
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, margin: "14px 0 6px" }}>New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" style={inputStyle} />
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, margin: "14px 0 6px" }}>Confirm new password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            {error && <div style={{ display: "flex", gap: 8, alignItems: "center", color: COLORS.danger, fontSize: 13, marginTop: 14 }}><AlertCircle size={15} /> {error}</div>}
            <button type="button" onClick={confirmReset} disabled={busy} style={{ marginTop: 20, width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: busy ? "default" : "pointer", opacity: busy ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {busy && <Loader2 size={16} className="spin" />} {busy ? "Saving…" : "Set new password"}
            </button>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={36} color={COLORS.success} style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>Password updated</div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 18 }}>Sign in with your new password.</div>
            <button onClick={onGoToSignIn} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Go to sign in
            </button>
          </div>
        )}

        {step !== "done" && (
          <button type="button" onClick={onGoToSignIn} style={{ marginTop: 14, width: "100%", background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
            Back to sign in
          </button>
        )}
      </div>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
