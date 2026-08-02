import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types";
import { readProducts, saveProducts } from "@/lib/productStorage";

type Params = { params: Promise<{ id: string }> };

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const list = await readProducts();
  const product = list.find((p) => p.id === id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// PUT /api/products/[id]  — update
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json() as Partial<Product>;
  const list = await readProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], ...body };
  await saveProducts(list);
  return NextResponse.json(list[idx]);
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const list = await readProducts();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length === list.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await saveProducts(filtered);
  return NextResponse.json({ success: true });
}
