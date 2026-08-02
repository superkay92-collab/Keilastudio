import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  verifyPassword,
  getAdminEmail,
  createOTPToken,
  verifyOTPWithToken,
  createSessionToken,
  verifySessionToken,
  updateAdminPassword,
  updateAdminEmail,
} from "@/lib/adminAuth";

const resend = new Resend(process.env.RESEND_API_KEY);
const SESSION_COOKIE = "ks_admin_session";
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 24 * 60 * 60,
};

function maskEmail(email: string): string {
  return email.replace(/^(.{2})(.*)(@.*)$/, "$1***$3");
}

async function sendOTP(subject: string, otp: string, to: string) {
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const { data, error } = await resend.emails.send({
    from: `Keila's Studio <${from}>`,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px">
        <h2 style="font-size:18px;color:#3B4527;margin-bottom:4px">Keila's Studio Admin</h2>
        <p style="color:#888;font-size:13px;margin-bottom:24px">${subject}</p>
        <div style="background:#FBF7F0;border:1px solid #E7C4B5;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:700;color:#3B4527;border-radius:8px">${otp}</div>
        <p style="color:#aaa;font-size:11px;margin-top:16px">This code expires in 10 minutes. Do not share it.</p>
      </div>
    `,
  });
  if (error) {
    console.error("[Resend] Failed to send OTP:", JSON.stringify(error));
    throw new Error(error.message ?? "Resend error");
  }
  console.log("[Resend] OTP sent, id:", data?.id);
}

// GET — verify existing session
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token && verifySessionToken(token)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action } = body as Record<string, string>;

  // ── Step 1: verify password → send OTP ─────────────────────────────────
  if (action === "login") {
    if (!verifyPassword(String(body.password ?? ""))) {
      return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpToken = createOTPToken(otp);
    const email = getAdminEmail();
    try {
      await sendOTP("Your login verification code", otp, email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { ok: false, error: `Could not send email: ${msg}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, otpToken, maskedEmail: maskEmail(email) });
  }

  // ── Step 2: verify OTP → set session cookie ─────────────────────────────
  if (action === "verify-otp") {
    if (!verifyOTPWithToken(String(body.otp ?? ""), String(body.otpToken ?? ""))) {
      return NextResponse.json({ ok: false, error: "Invalid or expired code" }, { status: 401 });
    }
    const sessionToken = createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionToken, cookieOpts);
    return res;
  }

  // ── Password reset step 1: send OTP ─────────────────────────────────────
  if (action === "reset-request") {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpToken = createOTPToken(otp);
    const email = getAdminEmail();
    try {
      await sendOTP("Your password reset code", otp, email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ ok: false, error: `Could not send email: ${msg}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true, otpToken, maskedEmail: maskEmail(email) });
  }

  // ── Password reset step 2: verify OTP + set new password ────────────────
  if (action === "reset-confirm") {
    const newPassword = String(body.newPassword ?? "");
    if (newPassword.length < 4) {
      return NextResponse.json({ ok: false, error: "Password must be at least 4 characters" }, { status: 400 });
    }
    if (!verifyOTPWithToken(String(body.otp ?? ""), String(body.otpToken ?? ""))) {
      return NextResponse.json({ ok: false, error: "Invalid or expired code" }, { status: 401 });
    }
    updateAdminPassword(newPassword);
    return NextResponse.json({ ok: true });
  }

  // ── Change password (requires active session) ────────────────────────────
  if (action === "change-password") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    if (!verifyPassword(String(body.currentPassword ?? ""))) {
      return NextResponse.json({ ok: false, error: "Current password incorrect" }, { status: 401 });
    }
    const newPassword = String(body.newPassword ?? "");
    if (newPassword.length < 4) {
      return NextResponse.json({ ok: false, error: "New password must be at least 4 characters" }, { status: 400 });
    }
    updateAdminPassword(newPassword);
    return NextResponse.json({ ok: true });
  }

  // ── Update admin email (requires active session) ─────────────────────────
  if (action === "update-email") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    const email = String(body.email ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    updateAdminEmail(email);
    return NextResponse.json({ ok: true });
  }

  // ── Logout ───────────────────────────────────────────────────────────────
  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", { ...cookieOpts, maxAge: 0 });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
