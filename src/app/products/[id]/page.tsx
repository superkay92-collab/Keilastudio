import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { readProducts } from "@/lib/productStorage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const list = await readProducts();
  const product = list.find((p) => p.id === id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Keila's Studio Extension`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const list = await readProducts();
  const product = list.find((p) => p.id === id);
  if (!product) notFound();
  const related = list
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  return <ProductDetail product={product} related={related} />;
}
