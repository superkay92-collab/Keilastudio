import { supabase } from "@/lib/supabase";
import type { Order } from "@/types";

export async function saveOrder(order: Order): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .upsert({ id: order.id, data: order });
  if (error) throw new Error(error.message);
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("data")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.data as Order);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data, error } = await supabase
    .from("orders")
    .select("data")
    .eq("id", id)
    .single();
  if (error || !data) return undefined;
  return data.data as Order;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const all = await getAllOrders();
  const q = email.trim().toLowerCase();
  return all.filter((o) => o.customerEmail?.toLowerCase() === q);
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<boolean> {
  const { data: row, error: fetchErr } = await supabase
    .from("orders")
    .select("data")
    .eq("id", id)
    .single();
  if (fetchErr || !row) return false;
  const updated: Order = {
    ...(row.data as Order),
    status,
    updatedAt: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("orders")
    .update({ data: updated })
    .eq("id", id);
  return !error;
}
