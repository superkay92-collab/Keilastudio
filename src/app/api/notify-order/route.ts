import { NextRequest, NextResponse } from "next/server";

const STAFF_EMAIL = "thekeilasstudio17@gmail.com";
const STAFF_PHONE = "+233530515474";

export async function POST(req: NextRequest) {
  let order: Record<string, unknown>;
  try {
    order = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const { id, name, email, phone, address, total, paymentMethod } = order as {
    id?: string; name?: string; email?: string; phone?: string;
    address?: string; total?: number; paymentMethod?: string;
  };

  if (!id || !name || total === undefined) {
    return NextResponse.json({ ok: false, error: "Missing required order fields" }, { status: 400 });
  }

  const results: Record<string, boolean | string> = {};

  const emailHtml = `
    <div style="font-family:sans-serif;padding:28px 24px;color:#1c1c1c;background:#F9F6F0;max-width:520px;margin:auto;border-radius:12px">
      <h2 style="color:#3B4A2E;margin-bottom:4px">Order Confirmed ✓</h2>
      <p style="color:#A3B19B;font-size:12px;margin-top:0;letter-spacing:1px">KEILA'S STUDIO EXTENSION</p>
      <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:13px">
        <tr><td style="padding:7px 0;color:#A3B19B">Order ID</td><td style="padding:7px 0;font-weight:700;color:#3B4A2E;font-family:monospace">${id}</td></tr>
        <tr><td style="padding:7px 0;color:#A3B19B">Client</td><td style="padding:7px 0">${name}</td></tr>
        <tr><td style="padding:7px 0;color:#A3B19B">Total</td><td style="padding:7px 0;font-weight:700;font-family:monospace">GHS ${total}</td></tr>
        <tr><td style="padding:7px 0;color:#A3B19B">Payment</td><td style="padding:7px 0">${paymentMethod ?? "-"}</td></tr>
        <tr><td style="padding:7px 0;color:#A3B19B">Delivery</td><td style="padding:7px 0">${address ?? "-"}</td></tr>
      </table>
      <div style="margin-top:28px;padding-top:16px;border-top:1px solid #E8D8CE;font-size:11px;color:#A3B19B">
        Luxury is a Standard. — Keila's Studio Extension · East Legon, Accra, Ghana
      </div>
    </div>
  `;

  // ── Email via Resend ────────────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      const sends = [
        // Staff always gets notified
        resend.emails.send({
          from: "Keila's Studio Orders <orders@keilasstudio.com>",
          to: STAFF_EMAIL,
          subject: `New Order: ${id} — GHS ${total}`,
          html: emailHtml,
        }),
      ];

      // Client email only if they provided one
      if (email) {
        sends.push(
          resend.emails.send({
            from: "Keila's Studio <orders@keilasstudio.com>",
            to: email,
            subject: `Your order is confirmed [${id}]`,
            html: emailHtml,
          })
        );
      }

      await Promise.allSettled(sends);
      results.email = true;
    } catch (err) {
      results.email = String(err);
    }
  } else {
    results.email = "skipped — RESEND_API_KEY not set";
  }

  // ── SMS via Twilio ──────────────────────────────────────────────────────
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(twilioSid, twilioToken);

      const messages: { body: string; to: string }[] = [
        {
          body: `ALERT: New order ${id} — GHS ${total} (${paymentMethod ?? "unknown"}). Check your fulfillment dashboard.`,
          to: STAFF_PHONE,
        },
      ];

      if (phone) {
        messages.push({
          body: `Keila's Studio: Hi ${name}! Your order ${id} is confirmed. Total: GHS ${total}. We'll review your payment and be in touch shortly. 💚`,
          to: phone.startsWith("+") ? phone : `+233${phone.replace(/^0/, "")}`,
        });
      }

      await Promise.allSettled(
        messages.map((m) => client.messages.create({ body: m.body, from: twilioFrom, to: m.to }))
      );
      results.sms = true;
    } catch (err) {
      results.sms = String(err);
    }
  } else {
    results.sms = "skipped — Twilio env vars not set";
  }

  return NextResponse.json({ ok: true, results });
}
