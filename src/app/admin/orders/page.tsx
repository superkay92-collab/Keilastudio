"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/types";
import toast from "react-hot-toast";

const STATUS_OPTIONS: Order["status"][] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

  async function load() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id: string, status: Order["status"]) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Status updated");
      load();
    }
  }

  const visible =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Orders</h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 text-xs border uppercase tracking-wider transition-colors ${
              filter === s
                ? "bg-charcoal text-cream border-charcoal"
                : "border-cream-dark text-muted hover:border-charcoal"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-cream-dark p-12 text-center text-muted text-sm">
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((order) => (
            <div key={order.id} className="bg-cream-dark p-6">
              {/* Order header */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                <div>
                  <p className="font-mono text-sm font-semibold">{order.id}</p>
                  <p className="text-sm text-muted mt-0.5">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-muted">{order.customerEmail}</p>
                  <p className="text-xs text-muted">{order.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    GH₵ {order.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-GH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted capitalize">
                    via {order.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-cream pt-4 mb-4">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-2">
                  Items
                </p>
                <ul className="text-sm space-y-1">
                  {order.items.map((item) => (
                    <li
                      key={`${item.product.id}-${item.selectedLength}`}
                      className="flex justify-between"
                    >
                      <span className="text-muted">
                        {item.product.name} ({item.selectedLength}) ×{" "}
                        {item.quantity}
                      </span>
                      <span className="font-medium">
                        GH₵{" "}
                        {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shipping address */}
              <div className="border-t border-cream pt-4 mb-4">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
                  Ship to
                </p>
                <p className="text-sm">
                  {order.shippingAddress.street},{" "}
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.region}, Ghana
                </p>
              </div>

              {/* Status control */}
              <div className="flex items-center gap-4 pt-2">
                <span
                  className={`px-3 py-1 text-xs font-medium capitalize rounded ${STATUS_COLORS[order.status]}`}
                >
                  {order.status}
                </span>
                <label className="text-xs text-muted">Update:</label>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(
                      order.id,
                      e.target.value as Order["status"]
                    )
                  }
                  className="text-sm border border-cream bg-cream px-3 py-1.5 focus:outline-none focus:border-charcoal"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
