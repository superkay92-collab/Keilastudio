import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/requireAdmin";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_CATEGORIES = new Set(["extensions", "closures-frontals", "wigs", "hair-care"]);

export async function POST(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const rawCategory = (formData.get("category") as string | null) ?? "";
  const category = ALLOWED_CATEGORIES.has(rawCategory) ? rawCategory : "extensions";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type))
    return NextResponse.json({ error: "Only JPEG, PNG, WebP or GIF images are allowed" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeName = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", category);

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadDir, safeName), buffer);

  return NextResponse.json({ path: `/uploads/${category}/${safeName}` }, { status: 201 });
}
