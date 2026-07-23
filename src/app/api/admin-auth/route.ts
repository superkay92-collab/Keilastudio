import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json({ ok: false, error: "Server misconfiguration" }, { status: 500 });
    }
    if (typeof pin !== "string" || pin.length === 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (pin === adminPin) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
