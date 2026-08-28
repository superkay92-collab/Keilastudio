import { NextRequest, NextResponse } from "next/server";
import { deleteOrder, getOrderById, updateOrderStatus } from "@/lib/orders";
import type { Order } from "@/types";

// GET /api/orders/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}

// PATCH /api/orders/[id] — update status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json().catch(() => ({})) as { status?: string };
  if (!status) return NextResponse.json({ ok: false, error: "status required" }, { status: 400 });
  const ok = await updateOrderStatus(id, status as Order["status"]);
  if (!ok) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/orders/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ok = await deleteOrder(id);
  if (!ok) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
