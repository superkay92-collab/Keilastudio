import type { Order } from "@/types";

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KSE-${ts}-${rnd}`;
}

export function getStatusLabel(status: Order["status"]): string {
  const labels: Record<Order["status"], string> = {
    pending: "Order Received",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
  };
  return labels[status];
}

export function getStatusStep(status: Order["status"]): number {
  const steps: Order["status"][] = ["pending", "processing", "shipped", "delivered"];
  return steps.indexOf(status);
}
