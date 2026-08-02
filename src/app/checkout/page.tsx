"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/currency";
import { generateOrderId } from "@/lib/orders";
import type { Order } from "@/types";
import toast from "react-hot-toast";

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
    FlutterwaveCheckout: (config: Record<string, unknown>) => void;
  }
}

type PayMethod = "paystack" | "flutterwave" | "momo";

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Bono",
  "Northern",
  "Upper East",
  "Upper West",
  "Volta",
  "Oti",
  "Savannah",
  "Bono East",
  "Ahafo",
  "Western North",
  "North East",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { currency } = useCurrency();
  const [payMethod, setPayMethod] = useState<PayMethod>("momo");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "Accra",
    region: "Greater Accra",
    momoPhone: "",
    momoNetwork: "mtn",
  });

  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate(): boolean {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.street.trim()) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  }

  function buildOrder(ref: string, method: PayMethod): Order {
    const now = new Date().toISOString();
    return {
      id: generateOrderId(),
      items,
      subtotal,
      shipping,
      total,
      currency,
      status: "processing",
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      shippingAddress: {
        street: form.street,
        city: form.city,
        region: form.region,
        country: "Ghana",
      },
      paymentMethod: method,
      paymentReference: ref,
      createdAt: now,
      updatedAt: now,
      estimatedDelivery: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
  }

  function onSuccess(ref: string, method: PayMethod) {
    const order = buildOrder(ref, method);
    // Save to Supabase + send confirmation email (fire-and-forget)
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    }).catch(() => {});
    fetch("/api/notify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    }).catch(() => {});
    clearCart();
    router.push(`/checkout/success?orderId=${order.id}`);
  }

  async function payWithMomo() {
    if (!validate()) return;
    if (!form.momoPhone.trim()) {
      toast.error("Please enter your MoMo number");
      return;
    }
    setLoading(true);
    try {
      const ref = `KSE-MM-${Date.now()}`;
      const res = await fetch("/api/momo-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          amount: total,
          phone: form.momoPhone,
          network: form.momoNetwork,
          ref,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "MoMo charge failed");
        setLoading(false);
        return;
      }
      toast.success(data.displayText ?? "Check your phone to approve the payment.");
      onSuccess(data.reference, "momo");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function payWithPaystack() {
    if (!validate()) return;
    if (!window.PaystackPop) {
      toast.error("Payment gateway not loaded — please refresh and try again.");
      return;
    }
    setLoading(true);
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
      email: form.email,
      amount: total * 100, // pesewas
      currency: "GHS",
      ref: `KSE-PS-${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: form.name,
          },
          {
            display_name: "Phone",
            variable_name: "phone",
            value: form.phone,
          },
        ],
      },
      callback: (res: { reference: string }) => {
        onSuccess(res.reference, "paystack");
      },
      onClose: () => {
        setLoading(false);
        toast.error("Payment cancelled");
      },
    });
    handler.openIframe();
  }

  function payWithFlutterwave() {
    if (!validate()) return;
    if (!window.FlutterwaveCheckout) {
      toast.error("Payment gateway not loaded — please refresh and try again.");
      return;
    }
    setLoading(true);
    window.FlutterwaveCheckout({
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ?? "",
      tx_ref: `KSE-FLW-${Date.now()}`,
      amount: total,
      currency: "GHS",
      payment_options: "card,mobilemoney,ussd",
      customer: {
        email: form.email,
        phone_number: form.phone,
        name: form.name,
      },
      callback: (res: { status: string; transaction_id: number }) => {
        if (res.status === "successful") {
          onSuccess(String(res.transaction_id), "flutterwave");
        } else {
          setLoading(false);
          toast.error("Payment was not successful");
        }
      },
      onclose: () => setLoading(false),
      customizations: {
        title: "Keila's Studio Extension",
        description: "Hair order payment",
      },
    });
  }

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-muted mb-4">Your bag is empty.</p>
        <Link href="/shop" className="text-sm underline underline-offset-4">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        strategy="lazyOnload"
      />

      <div className="pt-24 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal mb-8"
          >
            <ArrowLeft size={15} />
            Back to Bag
          </Link>

          <h1 className="text-3xl font-bold mb-1">Checkout</h1>
          <p className="text-sm text-muted mb-10">Complete your order from Keila&apos;s Studio Extension &mdash; Accra</p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* ─ Form ─ */}
            <div className="lg:col-span-3 space-y-8">
              {/* Contact */}
              <section>
                <h2 className="text-base font-semibold mb-5">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Full Name *"
                    required
                    className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
                  />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Email Address *"
                    required
                    className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
                  />
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Phone Number * (e.g. 0241234567)"
                    required
                    className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
                  />
                </div>
              </section>

              {/* Shipping */}
              <section>
                <h2 className="text-base font-semibold mb-5">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <input
                    name="street"
                    value={form.street}
                    onChange={onChange}
                    placeholder="Street Address *"
                    required
                    className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="city"
                      value={form.city}
                      onChange={onChange}
                      placeholder="City"
                      className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
                    />
                    <select
                      name="region"
                      value={form.region}
                      onChange={onChange}
                      className="w-full border border-cream-dark bg-cream px-4 py-3 text-sm focus:outline-none focus:border-charcoal text-charcoal"
                    >
                      {GHANA_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Payment method */}
              <section>
                <h2 className="text-base font-semibold mb-5">
                  Payment Method
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayMethod("momo")}
                    className={`flex flex-col items-center gap-2 p-4 border-2 transition-colors ${
                      payMethod === "momo"
                        ? "border-charcoal bg-cream-dark"
                        : "border-cream-dark hover:border-charcoal/40"
                    }`}
                  >
                    <Smartphone size={22} />
                    <span className="text-sm font-semibold">MoMo</span>
                    <span className="text-[11px] text-muted text-center">
                      MTN · Vodafone · AirtelTigo
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("paystack")}
                    className={`flex flex-col items-center gap-2 p-4 border-2 transition-colors ${
                      payMethod === "paystack"
                        ? "border-charcoal bg-cream-dark"
                        : "border-cream-dark hover:border-charcoal/40"
                    }`}
                  >
                    <CreditCard size={22} />
                    <span className="text-sm font-semibold">Paystack</span>
                    <span className="text-[11px] text-muted text-center">
                      Card · Bank · USSD
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("flutterwave")}
                    className={`flex flex-col items-center gap-2 p-4 border-2 transition-colors ${
                      payMethod === "flutterwave"
                        ? "border-charcoal bg-cream-dark"
                        : "border-cream-dark hover:border-charcoal/40"
                    }`}
                  >
                    <CreditCard size={22} />
                    <span className="text-sm font-semibold">Flutterwave</span>
                    <span className="text-[11px] text-muted text-center">
                      Card · Bank
                    </span>
                  </button>
                </div>

                {/* MoMo vendor info */}
                {payMethod === "momo" && (
                  <div className="mt-4 space-y-3">
                    <div className="border-2 border-[#25D366] bg-[#25D366]/5 p-4 text-sm">
                      <p className="font-semibold text-[#1a9e4e] mb-2">📱 Vendor MoMo (receiving):</p>
                      <div className="space-y-1">
                        <p><span className="text-muted">Number:</span> <strong>{process.env.NEXT_PUBLIC_MOMO_NUMBER ?? "0XX-XXX-XXXX"}</strong></p>
                        <p><span className="text-muted">Name:</span> <strong>{process.env.NEXT_PUBLIC_MOMO_NAME ?? "Keila's Studio Extension"}</strong></p>
                        <p><span className="text-muted">Network:</span> <strong>{process.env.NEXT_PUBLIC_MOMO_NETWORK ?? "MTN"}</strong></p>
                      </div>
                    </div>
                    <div className="border border-cream-dark p-4 space-y-3">
                      <p className="text-sm font-semibold">Pay Automatically with MoMo</p>
                      <p className="text-xs text-muted">Enter your MoMo number below — a payment prompt will be sent to your phone.</p>
                      <input
                        name="momoPhone"
                        type="tel"
                        value={form.momoPhone}
                        onChange={onChange}
                        placeholder="Your MoMo Number (e.g. 0551234567)"
                        className="w-full border border-cream-dark bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
                      />
                      <select
                        name="momoNetwork"
                        value={form.momoNetwork}
                        onChange={onChange}
                        title="Select MoMo network"
                        className="w-full border border-cream-dark bg-cream px-4 py-3 text-sm focus:outline-none focus:border-charcoal text-charcoal"
                      >
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="vodafone">Vodafone Cash</option>
                        <option value="airteltigo">AirtelTigo Money</option>
                      </select>
                    </div>
                  </div>
                )}
                {payMethod === "paystack" && (
                  <div className="mt-4 border border-cream-dark bg-cream-dark/40 p-4 text-sm text-muted">
                    🔒 You&apos;ll be redirected to a secure <strong>Paystack</strong> page to pay with card, bank or USSD.
                  </div>
                )}
                {payMethod === "flutterwave" && (
                  <div className="mt-4 border border-cream-dark bg-cream-dark/40 p-4 text-sm text-muted">
                    🔒 You&apos;ll be redirected to a secure <strong>Flutterwave</strong> page to pay with card or bank.
                  </div>
                )}
              </section>
            </div>

            {/* ─ Summary ─ */}
            <div className="lg:col-span-2">
              <div className="bg-cream-dark p-6 sticky top-24">
                <h2 className="font-semibold mb-6">Order Summary</h2>
                <ul className="space-y-4 mb-6">
                  {items.map((item) => (
                    <li
                      key={`${item.product.id}-${item.selectedLength}`}
                      className="flex gap-3"
                    >
                      <div className="relative w-14 h-16 bg-cream flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium leading-tight">
                          {item.product.name}
                        </p>
                        <p className="text-muted text-xs mt-0.5">
                          {item.selectedLength} × {item.quantity}
                        </p>
                        <p className="font-semibold mt-1">
                          {formatPrice(
                            item.product.price * item.quantity,
                            currency
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-cream pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Shipping</span>
                    <span>
                      {shipping === 0
                        ? "Free"
                        : formatPrice(shipping, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-cream">
                    <span>Total</span>
                    <span>{formatPrice(total, currency)}</span>
                  </div>
                </div>

                <button
                  onClick={
                    payMethod === "momo"
                      ? payWithMomo
                      : payMethod === "paystack"
                      ? payWithPaystack
                      : payWithFlutterwave
                  }
                  disabled={loading}
                  className="w-full mt-6 bg-charcoal text-cream py-4 text-sm font-medium tracking-wide hover:bg-charcoal/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Opening payment..."
                    : `Pay ${formatPrice(total, currency)}`}
                </button>
                <p className="text-[11px] text-muted text-center mt-3">
                  🔒 Secured by{" "}
                  {payMethod === "momo" ? "Paystack (Mobile Money)" : payMethod === "paystack" ? "Paystack" : "Flutterwave"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
