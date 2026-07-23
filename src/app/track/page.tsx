"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import {
  getOrderById,
  getOrdersByEmail,
  getStatusStep,
} from "@/lib/orders";
import type { Order } from "@/types";

const STEPS = [
  { icon: Clock, label: "Order Received", key: "pending" },
  { icon: Package, label: "Processing", key: "processing" },
  { icon: Truck, label: "Shipped", key: "shipped" },
  { icon: CheckCircle, label: "Delivered", key: "delivered" },
] as const;

function OrderCard({ order }: { order: Order }) {
  const step = getStatusStep(order.status);

  return (
    <div className="mt-8 bg-cream-dark p-6 sm:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[10px] text-muted tracking-widest uppercase">
            Order
          </p>
          <p className="font-mono font-semibold text-lg">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted">Placed</p>
          <p className="text-sm font-medium">
            {new Date(order.createdAt).toLocaleDateString("en-GH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="relative mb-8">
        <div className="flex justify-between relative z-10">
          {STEPS.map(({ icon: Icon, label, key }, idx) => {
            const active = idx <= step;
            const current = idx === step;
            return (
              <div key={key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    active
                      ? "bg-charcoal border-charcoal"
                      : "bg-cream border-cream-dark"
                  } ${current ? "ring-2 ring-gold ring-offset-2" : ""}`}
                >
                  <Icon
                    size={17}
                    className={active ? "text-cream" : "text-muted"}
                  />
                </div>
                <p
                  className={`text-[10px] mt-2 text-center leading-tight ${
                    active ? "text-charcoal font-medium" : "text-muted"
                  }`}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>
        {/* Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-cream-dark">
          <div
            className="h-full bg-charcoal transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="border-t border-cream pt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Customer</span>
          <span className="font-medium">{order.customerName}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted flex-shrink-0">Shipping to</span>
          <span className="font-medium text-right">
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.region}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Total</span>
          <span className="font-semibold">
            GH₵ {order.total.toLocaleString()}
          </span>
        </div>
        {order.estimatedDelivery && order.status !== "delivered" && (
          <div className="flex justify-between">
            <span className="text-muted">Est. Delivery</span>
            <span className="font-medium text-green-600">
              {new Date(order.estimatedDelivery).toLocaleDateString("en-GH", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="border-t border-cream mt-6 pt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
          Items
        </p>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li
              key={`${item.product.id}-${item.selectedLength}`}
              className="flex justify-between text-sm"
            >
              <span className="text-muted">
                {item.product.name} ({item.selectedLength}) × {item.quantity}
              </span>
              <span className="font-medium">
                GH₵{" "}
                {(item.product.price * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("orderId") ?? "");
  const [mode, setMode] = useState<"id" | "email">("id");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);

  // Auto-search if orderId provided in URL
  useEffect(() => {
    const id = searchParams.get("orderId");
    if (id) {
      const found = getOrderById(id);
      if (found) {
        setOrders([found]);
        setSearched(true);
      }
    }
  }, [searchParams]);

  function search() {
    if (!query.trim()) return;
    if (mode === "id") {
      const found = getOrderById(query.trim());
      setOrders(found ? [found] : []);
    } else {
      setOrders(getOrdersByEmail(query.trim()));
    }
    setSearched(true);
  }

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
      <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-2">
        Track
      </p>
      <h1 className="text-4xl font-bold mb-10">Your Order</h1>

      <div className="bg-cream-dark p-6 sm:p-8">
        {/* Mode tabs */}
        <div className="flex gap-6 mb-6 border-b border-cream">
          {(["id", "email"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setQuery("");
                setSearched(false);
                setOrders([]);
              }}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                mode === m
                  ? "border-charcoal text-charcoal"
                  : "border-transparent text-muted"
              }`}
            >
              {m === "id" ? "Order ID" : "Email Address"}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type={mode === "email" ? "email" : "text"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder={
              mode === "id"
                ? "Enter Order ID (e.g. KSE-XXXXX)"
                : "Enter your email address"
            }
            className="flex-1 border border-cream bg-cream px-4 py-3 text-sm focus:outline-none focus:border-charcoal placeholder:text-muted"
          />
          <button
            onClick={search}
            className="bg-charcoal text-cream px-6 py-3 text-sm hover:bg-charcoal/90 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Search size={15} />
            Track
          </button>
        </div>
      </div>

      {searched && orders.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">
            No orders found. Please check your{" "}
            {mode === "id" ? "Order ID" : "email address"}.
          </p>
        </div>
      )}

      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={<div className="pt-28 text-center text-muted">Loading...</div>}
    >
      <TrackContent />
    </Suspense>
  );
}
