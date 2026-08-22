"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";
import { cartUnitPrice } from "@/lib/cart";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number, selectedLength?: string, unitPrice?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  isOpen: false,
  setIsOpen: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("keila_cart");
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("keila_cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (product: Product, quantity = 1, selectedLength?: string, unitPrice?: number) => {
      const len = selectedLength ?? product.specs.length;
      const resolvedPrice =
        typeof unitPrice === "number"
          ? unitPrice
          : product.lengths?.find((l) => `${l.inches}\"` === len || String(l.inches) === len)?.price;
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.product.id === product.id && i.selectedLength === len
        );
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id && i.selectedLength === len
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { product, quantity, selectedLength: len, unitPrice: resolvedPrice }];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("keila_cart");
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + cartUnitPrice(i) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
