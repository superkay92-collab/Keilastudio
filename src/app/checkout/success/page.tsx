"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getStatusLabel } from "@/lib/orders";
import type { Order } from "@/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setOrder(d.order); });
  }, [orderId]);

  return (
    <div className="pt-28 pb-24 max-w-lg mx-auto px-4 sm:px-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle size={44} className="text-green-600" />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-muted text-sm mb-2">
        Thank you for shopping with Keila&apos;s Studio Extension.
      </p>

      {order && (
        <>
          <p className="text-sm text-muted mb-8">
            A confirmation has been sent to{" "}
            <strong className="text-charcoal">{order.customerEmail}</strong>
          </p>

          <div className="bg-cream-dark p-6 text-left mb-8 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Order ID</span>
              <span className="font-mono font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span className="font-medium text-green-600">
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment</span>
              <span className="font-medium capitalize">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-muted font-normal">Total</span>
              <span>GH₵ {order.total.toLocaleString()}</span>
            </div>
            {order.estimatedDelivery && (
              <div className="flex justify-between">
                <span className="text-muted">Est. Delivery</span>
                <span className="font-medium text-green-600">
                  {new Date(order.estimatedDelivery).toLocaleDateString(
                    "en-GH",
                    { weekday: "short", month: "short", day: "numeric" }
                  )}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/track?orderId=${orderId}`}
          className="flex items-center justify-center gap-2 bg-charcoal text-cream px-8 py-4 text-sm font-medium hover:bg-charcoal/90 transition-colors"
        >
          <Package size={15} />
          Track Order
        </Link>
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 border border-charcoal text-charcoal px-8 py-4 text-sm font-medium hover:bg-cream-dark transition-colors"
        >
          Continue Shopping
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={<div className="pt-28 text-center text-muted">Loading...</div>}
    >
      <SuccessContent />
    </Suspense>
  );
}
