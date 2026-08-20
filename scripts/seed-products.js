// seed-products.js — run once to populate Supabase products table
// Usage: node scripts/seed-products.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY. " +
        "Run with: node --env-file=.env.local scripts/seed-products.js"
    );
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const filePath = path.join(__dirname, "..", "data", "products.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const products = JSON.parse(raw);

  // Sanity check — print the first product before inserting anything
  console.log("First product looks like:");
  console.log(JSON.stringify(products[0], null, 2));
  console.log(`\nTotal products to seed: ${products.length}`);

  if (!Array.isArray(products) || typeof products[0].id !== "string") {
    console.error("ERROR: products.json did not parse as expected. Aborting.");
    process.exit(1);
  }

  const rows = products.map((p) => ({ id: p.id, data: p }));

  const { error } = await supabase.from("products").insert(rows);
  if (error) {
    console.error("Supabase insert error:", error.message);
    process.exit(1);
  }

  console.log(`\nSeeded ${rows.length} products successfully.`);
}

main();
