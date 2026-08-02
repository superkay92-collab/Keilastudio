"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Settings, Loader2 } from "lucide-react";
import clsx from "clsx";

type AuthState = "checking" | "password" | "otp" | "reset-request" | "reset-otp" | "reset-done" | "authed";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>("checking");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/admin-auth")
      .then((r) => r.json())
      .then((d) => setState(d.ok ? "authed" : "password"))
      .catch(() => setState("password"));
  }, []);

  function reset(field?: string) {
    setError("");
    setOtp("");
    if (field) setState(field as AuthState);
  }

  async function call(body: object) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch {
      return { ok: false, error: "Connection error. Please try again." };
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const data = await call({ action: "login", password });
    if (data.ok) {
      setOtpToken(data.otpToken);
      setMaskedEmail(data.maskedEmail);
      setPassword("");
      setState("otp");
    } else setError(data.error ?? "Incorrect password");
  }

  async function handleOTP(e: React.FormEvent) {
    e.preventDefault();
    const data = await call({ action: "verify-otp", otp, otpToken });
    if (data.ok) { setOtp(""); setState("authed"); }
    else setError(data.error ?? "Invalid code");
  }

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    const data = await call({ action: "reset-request" });
    if (data.ok) {
      setOtpToken(data.otpToken);
      setMaskedEmail(data.maskedEmail);
      setState("reset-otp");
    } else setError(data.error ?? "Failed to send code");
  }

  async function handleResetConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
    if (newPassword.length < 4) { setError("Password must be at least 4 characters"); return; }
    const data = await call({ action: "reset-confirm", otp, otpToken, newPassword });
    if (data.ok) {
      setOtp(""); setNewPassword(""); setConfirmPassword("");
      setState("reset-done");
    } else setError(data.error ?? "Failed to reset password");
  }

  async function logout() {
    await call({ action: "logout" });
    setState("password");
  }

  const inputCls = "w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted";
  const btnCls = "w-full bg-charcoal text-cream py-4 text-sm font-medium hover:bg-charcoal/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50";
  const linkCls = "w-full text-xs text-muted hover:text-charcoal transition-colors py-1 text-center block mt-1";

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="animate-spin text-muted" size={20} />
      </div>
    );
  }

  if (state !== "authed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">Admin Access</p>
            <h1 className="text-2xl font-bold italic font-serif">Keila&apos;s Studio</h1>
          </div>

          {/* ── Password ── */}
          {state === "password" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input id="admin-password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password" autoComplete="current-password" required className={inputCls} />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading} className={btnCls}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enter Dashboard
              </button>
              <button type="button" onClick={() => reset("reset-request")} className={linkCls}>
                Forgot password?
              </button>
            </form>
          )}

          {/* ── OTP (login) ── */}
          {state === "otp" && (
            <form onSubmit={handleOTP} className="space-y-4">
              <p className="text-xs text-center text-muted">
                A 6-digit code was sent to{" "}
                <span className="font-medium text-charcoal">{maskedEmail}</span>
              </p>
              <input id="admin-otp" name="otp" type="text" inputMode="numeric" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000" required autoFocus
                className={`${inputCls} text-center tracking-[0.5em]`} />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading || otp.length !== 6} className={btnCls}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                Verify Code
              </button>
              <button type="button" onClick={() => reset("password")} className={linkCls}>← Back</button>
            </form>
          )}

          {/* ── Reset — send code ── */}
          {state === "reset-request" && (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <p className="text-xs text-center text-muted">
                We&apos;ll send a reset code to your admin email address.
              </p>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading} className={btnCls}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                Send Reset Code
              </button>
              <button type="button" onClick={() => reset("password")} className={linkCls}>← Back to login</button>
            </form>
          )}

          {/* ── Reset — enter code + new password ── */}
          {state === "reset-otp" && (
            <form onSubmit={handleResetConfirm} className="space-y-4">
              <p className="text-xs text-center text-muted">
                Code sent to <span className="font-medium text-charcoal">{maskedEmail}</span>
              </p>
              <input id="admin-reset-otp" name="reset-otp" type="text" inputMode="numeric" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Reset code" required autoFocus
                className={`${inputCls} text-center tracking-[0.5em]`} />
              <input id="admin-new-password" name="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password" required className={inputCls} />
              <input id="admin-confirm-password" name="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password" required className={inputCls} />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" disabled={loading || otp.length !== 6 || !newPassword} className={btnCls}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                Reset Password
              </button>
              <button type="button" onClick={() => reset("password")} className={linkCls}>← Cancel</button>
            </form>
          )}

          {/* ── Reset done ── */}
          {state === "reset-done" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-charcoal">✓ Password reset successfully.</p>
              <button onClick={() => reset("password")} className={btnCls}>Log In</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-56 bg-charcoal text-cream flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-cream/10">
          <p className="text-[9px] tracking-[0.2em] uppercase text-cream/40">Admin Panel</p>
          <p className="font-bold italic font-serif mt-1 text-cream">Keila&apos;s Studio</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors",
                pathname === href ? "bg-cream/10 text-cream" : "text-cream/55 hover:text-cream hover:bg-cream/5"
              )}
            >
              <Icon size={15} />{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-cream/10 space-y-0.5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-cream/55 hover:text-cream transition-colors">
            ← View Store
          </Link>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-cream/55 hover:text-cream transition-colors w-full">
            <LogOut size={15} />Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
