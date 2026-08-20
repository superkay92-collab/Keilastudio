import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types";
import { readProducts, saveProducts } from "@/lib/productStorage";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

// GET /api/products
export async function GET() {
  return NextResponse.json(await readProducts());
}

// POST /api/products  — create
export async function POST(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const body = await req.json() as Product;
  const list = await readProducts();

  const id =
    body.id ||
    body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Ensure unique id
  const existing = list.findIndex((p) => p.id === id);
  const finalId = existing !== -1 ? `${id}-${Date.now()}` : id;

  const newProduct: Product = { ...body, id: finalId };
  list.push(newProduct);
  await saveProducts(list);
  return NextResponse.json(newProduct, { status: 201 });
}
