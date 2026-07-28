import fs from "fs";
import path from "path";
import type { Product } from "@/types";
import { products as defaultProducts } from "@/lib/products";

const DATA_FILE = path.join(process.cwd(), "data", "products.json");
const PRODUCTS_TS = path.join(process.cwd(), "src", "lib", "products.ts");

function ensureDir(file: string) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readProducts(): Product[] {
  ensureDir(DATA_FILE);
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultProducts, null, 2));
    return defaultProducts as Product[];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Product[];
}

export function saveProducts(products: Product[]) {
  ensureDir(DATA_FILE);
  // 1. Save JSON (fast reads)
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));

  // 2. Regenerate products.ts so the shop hot-reloads automatically
  const ts = `import { Product } from "@/types";

export const products: Product[] = ${JSON.stringify(products, null, 2)};

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
`;
  fs.writeFileSync(PRODUCTS_TS, ts);
}
