import crypto from "crypto";
import fs from "fs";
import path from "path";

const ADMIN_FILE = path.join(process.cwd(), "data", "admin.json");
const SECRET = process.env.ADMIN_SECRET ?? "ks-admin-2026-secret-key";

function sha256(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex");
}

function hmac(v: string): string {
  return crypto.createHmac("sha256", SECRET).update(v).digest("hex");
}

interface AdminData {
  passwordHash: string;
  email: string;
}

function readAdmin(): AdminData {
  const defaultPassword = process.env.ADMIN_PASSWORD ?? "6607";
  const defaultEmail =
    process.env.ADMIN_EMAIL ?? "thekeilasstudio17@gmail.com";
  const defaults: AdminData = {
    passwordHash: sha256(defaultPassword),
    email: defaultEmail,
  };
  try {
    if (fs.existsSync(ADMIN_FILE)) {
      return { ...defaults, ...JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8")) };
    }
  } catch {}
  return defaults;
}

function saveAdmin(data: AdminData): void {
  const dir = path.dirname(ADMIN_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(data, null, 2));
}

export function verifyPassword(password: string): boolean {
  const admin = readAdmin();
  // Also accept raw env var value for first-time login
  const envPass = process.env.ADMIN_PASSWORD;
  if (envPass && password === envPass) return true;
  return admin.passwordHash === sha256(password);
}

export function getAdminEmail(): string {
  return readAdmin().email;
}

export function updateAdminPassword(newPassword: string): void {
  const admin = readAdmin();
  admin.passwordHash = sha256(newPassword);
  saveAdmin(admin);
}

export function updateAdminEmail(email: string): void {
  const admin = readAdmin();
  admin.email = email;
  saveAdmin(admin);
}

// ── Stateless OTP token (no DB / no file write needed) ──────────────────────
export function createOTPToken(otp: string): string {
  const expiry = Date.now() + 10 * 60 * 1000; // 10 min
  const otpHash = sha256(otp);
  const sig = hmac(`${otpHash}:${expiry}`);
  return Buffer.from(JSON.stringify({ otpHash, expiry, sig })).toString(
    "base64url"
  );
}

export function verifyOTPWithToken(otp: string, token: string): boolean {
  try {
    const { otpHash, expiry, sig } = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );
    if (Date.now() > expiry) return false;
    if (hmac(`${otpHash}:${expiry}`) !== sig) return false;
    return sha256(otp) === otpHash;
  } catch {
    return false;
  }
}

// ── Stateless session token ──────────────────────────────────────────────────
export function createSessionToken(): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 h
  const nonce = crypto.randomBytes(8).toString("hex");
  const sig = hmac(`${nonce}:${expiry}`);
  return Buffer.from(JSON.stringify({ nonce, expiry, sig })).toString(
    "base64url"
  );
}

export function verifySessionToken(token: string): boolean {
  try {
    const { nonce, expiry, sig } = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );
    if (Date.now() > expiry) return false;
    return hmac(`${nonce}:${expiry}`) === sig;
  } catch {
    return false;
  }
}
