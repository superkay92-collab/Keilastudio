"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, TrendingUp, Package, Clock } from "lucide-react";
import { getAllOrders } from "@/lib/orders";
import type { Order } from "@/types";

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getAllOrders().reverse());
  }, []);

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;
  const delivered = orders.filter((o) => o.status === "delivered").length;

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-500" },
    { label: "Revenue (GHS)", value: `GH₵ ${revenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-500" },
    { label: "Active Orders", value: pending, icon: Clock, color: "text-amber-500" },
    { label: "Delivered", value: delivered, icon: Package, color: "text-purple-500" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-cream-dark p-6 rounded-sm">
            <Icon size={22} className={`${color} mb-3`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-muted hover:text-charcoal underline"
          >
            View All
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-cream-dark p-12 text-center text-muted text-sm">
            No orders yet. They will appear here once customers checkout.
          </div>
        ) : (
          <div className="bg-cream-dark overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-cream text-muted text-left text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-cream last:border-0 hover:bg-cream/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      {order.id}
                    </td>
                    <td className="px-4 py-3">
                      <p>{order.customerName}</p>
                      <p className="text-xs text-muted">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      GH₵ {order.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-GH")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
