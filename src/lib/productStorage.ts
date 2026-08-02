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
  // Full replace: delete all rows, then insert the new list
  const { error: delErr } = await supabase
    .from("products")
    .delete()
    .not("id", "is", null);
  if (delErr) throw new Error(delErr.message);
  if (products.length === 0) return;
  const { error: insErr } = await supabase
    .from("products")
    .insert(products.map((p) => ({ id: p.id, data: p })));
  if (insErr) throw new Error(insErr.message);
}
