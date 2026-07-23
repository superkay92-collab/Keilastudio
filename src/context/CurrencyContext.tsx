"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Currency } from "@/types";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "GHS",
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("GHS");

  useEffect(() => {
    const saved = localStorage.getItem("keila_currency") as Currency | null;
    if (saved === "GHS" || saved === "USD") setCurrencyState(saved);
  }, []);

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    localStorage.setItem("keila_currency", c);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
