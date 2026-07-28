import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types";
import { readProducts, saveProducts } from "@/lib/productStorage";

// GET /api/products
export async function GET() {
  return NextResponse.json(readProducts());
}

// POST /api/products  — create
export async function POST(req: NextRequest) {
  const body = await req.json() as Product;
  const list = readProducts();

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
  saveProducts(list);
  return NextResponse.json(newProduct, { status: 201 });
}
