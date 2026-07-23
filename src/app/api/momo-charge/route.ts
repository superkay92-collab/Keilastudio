import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

const NETWORK_CODES: Record<string, string> = {
  mtn: "mtn",
  vodafone: "vod",
  airteltigo: "atl",
};

export async function POST(req: NextRequest) {
  try {
    const { email, amount, phone, network, ref } = await req.json();

    if (!email || !amount || !phone || !network) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const provider = NETWORK_CODES[network.toLowerCase()];
    if (!provider) {
      return NextResponse.json({ error: "Invalid network" }, { status: 400 });
    }

    const response = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // convert to pesewas
        currency: "GHS",
        mobile_money: { phone, provider },
        reference: ref,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: data.message ?? "Charge initiation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      reference: data.data.reference,
      status: data.data.status,
      displayText: data.data.display_text ?? "Check your phone to approve the payment.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
