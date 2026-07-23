import { Order } from "@/types";

const STORAGE_KEY = "keila_studio_orders";

export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  const orders = getAllOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getAllOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Order[]) : [];
  } catch {
    return [];
  }
}

export function getOrderById(id: string): Order | undefined {
  return getAllOrders().find((o) => o.id === id);
}

export function getOrdersByEmail(email: string): Order[] {
  return getAllOrders().filter(
    (o) => o.customerEmail.toLowerCase() === email.toLowerCase()
  );
}

export function updateOrderStatus(
  id: string,
  status: Order["status"]
): boolean {
  if (typeof window === "undefined") return false;
  const orders = getAllOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return true;
}

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
  const steps: Record<Order["status"], number> = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
  };
  return steps[status];
}
