import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types";
import { readProducts, saveProducts } from "@/lib/productStorage";
import { requireAdmin } from "@/lib/requireAdmin";
import { isPublishedProduct } from "@/lib/publishedProduct";

export const dynamic = "force-dynamic";

// GET /api/products         → admin (all)
// GET /api/products?published=1 → shop-facing (published only)
export async function GET(req: NextRequest) {
  const list = await readProducts();
  const publishedOnly = req.nextUrl.searchParams.get("published") === "1";
  return NextResponse.json(publishedOnly ? list.filter(isPublishedProduct) : list);
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
