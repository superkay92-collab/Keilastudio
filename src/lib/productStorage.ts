import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

export async function readProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("data")
    .order("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.data as Product);
}

export async function saveProducts(products: Product[]): Promise<void> {
  // Upsert first so we never lose data on a mid-write failure, then trim.
  if (products.length > 0) {
    const { error: upErr } = await supabase
      .from("products")
      .upsert(products.map((p) => ({ id: p.id, data: p })), { onConflict: "id" });
    if (upErr) throw new Error(upErr.message);
  }
  const keepIds = products.map((p) => p.id);
  const del = supabase.from("products").delete();
  const { error: delErr } =
    keepIds.length > 0
      ? await del.not("id", "in", `(${keepIds.map((id) => `"${id}"`).join(",")})`)
      : await del.not("id", "is", null);
  if (delErr) throw new Error(delErr.message);
}
