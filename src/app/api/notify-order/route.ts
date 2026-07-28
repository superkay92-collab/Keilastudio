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

  const { id, name, email, phone, address, total, paymentMethod, items, customerEmail, customerName, shippingAddress } = order as {
    id?: string; name?: string; email?: string; phone?: string;
    address?: string; total?: number; paymentMethod?: string;
    items?: Array<{ product?: { name?: string; price?: number }; name?: string; price?: number; qty?: number; quantity?: number }>;
    customerEmail?: string; customerName?: string;
    shippingAddress?: { street?: string; city?: string; region?: string };
  };

  const resolvedName = customerName ?? name;
  const resolvedEmail = customerEmail ?? email;
  const resolvedAddress = shippingAddress
    ? `${shippingAddress.street ?? ""}, ${shippingAddress.city ?? ""}, ${shippingAddress.region ?? ""}`
    : (address ?? "-");

  if (!id || !resolvedName || total === undefined) {
    return NextResponse.json({ ok: false, error: "Missing required order fields" }, { status: 400 });
  }

  const results: Record<string, boolean | string> = {};

  // Build items rows if available
  const itemRows = Array.isArray(items) && items.length > 0
    ? items.map((it) => {
        const itemName = it.product?.name ?? it.name ?? "Item";
        const itemPrice = it.product?.price ?? it.price ?? 0;
        const itemQty = it.quantity ?? it.qty ?? 1;
        return `<tr>
          <td style="padding:5px 0;color:#1c1c1c">${itemName} × ${itemQty}</td>
          <td style="padding:5px 0;text-align:right;font-family:monospace;color:#3B4A2E">GHS ${(itemPrice * itemQty).toFixed(2)}</td>
        </tr>`;
      }).join("")
    : "";

  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  const customerEmailHtml = `
    <div style="font-family:sans-serif;padding:32px 24px;color:#1c1c1c;background:#F9F6F0;max-width:520px;margin:auto;border-radius:12px">
      <h2 style="color:#3B4A2E;margin-bottom:4px">Order Confirmed ✓</h2>
      <p style="color:#A3B19B;font-size:12px;margin-top:0;letter-spacing:1px">KEILA'S STUDIO EXTENSION</p>
      <p style="font-size:14px;margin-top:16px">Hi ${resolvedName}, thank you for your order! We'll review your payment and get it ready shortly.</p>
      ${itemRows ? `
      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px">
        <thead><tr><th style="text-align:left;padding-bottom:6px;color:#A3B19B;font-weight:400">Item</th><th style="text-align:right;padding-bottom:6px;color:#A3B19B;font-weight:400">Price</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="height:1px;background:#E8D8CE;margin:12px 0"></div>` : ""}
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:5px 0;color:#A3B19B">Order ID</td><td style="padding:5px 0;font-weight:700;color:#3B4A2E;font-family:monospace">${id}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Total</td><td style="padding:5px 0;font-weight:700;font-family:monospace">GHS ${total}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Payment</td><td style="padding:5px 0">${paymentMethod ?? "-"}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Delivery to</td><td style="padding:5px 0">${resolvedAddress}</td></tr>
      </table>
      <div style="margin-top:28px;padding-top:16px;border-top:1px solid #E8D8CE;font-size:11px;color:#A3B19B">
        Luxury is a Standard. — Keila's Studio Extension · East Legon, Accra, Ghana
      </div>
    </div>
  `;

  const adminEmailHtml = `
    <div style="font-family:sans-serif;padding:28px 24px;color:#1c1c1c;background:#F9F6F0;max-width:520px;margin:auto;border-radius:12px">
      <h2 style="color:#3B4A2E;margin-bottom:4px">🛍 New Order: ${id}</h2>
      <p style="color:#A3B19B;font-size:12px;margin-top:0;letter-spacing:1px">KEILA'S STUDIO EXTENSION — ADMIN ALERT</p>
      ${itemRows ? `
      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px">
        <thead><tr><th style="text-align:left;padding-bottom:6px;color:#A3B19B;font-weight:400">Item</th><th style="text-align:right;padding-bottom:6px;color:#A3B19B;font-weight:400">Price</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="height:1px;background:#E8D8CE;margin:12px 0"></div>` : ""}
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:5px 0;color:#A3B19B">Order ID</td><td style="padding:5px 0;font-weight:700;color:#3B4A2E;font-family:monospace">${id}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Customer</td><td style="padding:5px 0">${resolvedName}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Email</td><td style="padding:5px 0">${resolvedEmail ?? "-"}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Phone</td><td style="padding:5px 0">${phone ?? "-"}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Total</td><td style="padding:5px 0;font-weight:700;font-family:monospace">GHS ${total}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Payment</td><td style="padding:5px 0">${paymentMethod ?? "-"}</td></tr>
        <tr><td style="padding:5px 0;color:#A3B19B">Delivery to</td><td style="padding:5px 0">${resolvedAddress}</td></tr>
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
          from: `Keila's Studio <${from}>`,
          to: STAFF_EMAIL,
          subject: `New Order: ${id} — GHS ${total}`,
          html: adminEmailHtml,
        }),
      ];

      // Client email only if they provided one
      if (resolvedEmail) {
        sends.push(
          resend.emails.send({
            from: `Keila's Studio <${from}>`,
            to: resolvedEmail,
            subject: `Your order is confirmed [${id}]`,
            html: customerEmailHtml,
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
