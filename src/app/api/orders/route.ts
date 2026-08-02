import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, getOrdersByEmail, saveOrder } from "@/lib/orders";

// GET /api/orders          — all orders
// GET /api/orders?email=x  — filter by customer email
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  try {
    const orders = email ? await getOrdersByEmail(email) : await getAllOrders();
    return NextResponse.json({ ok: true, orders });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/orders — save a new order
export async function POST(req: NextRequest) {
  const order = await req.json().catch(() => null);
  if (!order?.id) return NextResponse.json({ ok: false, error: "Invalid order" }, { status: 400 });
  try {
    await saveOrder(order);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
