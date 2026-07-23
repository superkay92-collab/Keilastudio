import { Currency } from "@/types";

// Approximate rate — update or fetch from an exchange rate API in production
export const GHS_TO_USD_RATE = parseFloat(
  process.env.NEXT_PUBLIC_GHS_TO_USD ?? "0.067"
);

export function formatPrice(ghsAmount: number, currency: Currency): string {
  if (currency === "GHS") {
    return `GH₵ ${ghsAmount.toLocaleString("en-GH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }
  const usd = ghsAmount * GHS_TO_USD_RATE;
  return `$${usd.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
