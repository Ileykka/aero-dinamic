import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthContext";
import products, { type Product } from "../catalog/products";
import { loadCart, loadPromoApplied, saveCart, savePromoApplied } from "./storage";
import type { CartLine } from "./types";
export type CartEntry = {
  product: Product;
  quantity: number;
  lineTotal: number;
};

type CartContextValue = {
  lines: CartLine[];
  entries: CartEntry[];
  itemCount: number;
  subtotal: number;
  promoApplied: boolean;
  discount: number;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  isInCart: (productId: string) => boolean;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  toggleCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function persist(lines: CartLine[]) {
  saveCart(lines);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const hadUserRef = useRef(Boolean(user));
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());
  const [promoApplied, setPromoApplied] = useState(() => loadPromoApplied());

  const commit = useCallback((next: CartLine[]) => {
    setLines(next);
    persist(next);
  }, []);

  const entries = useMemo((): CartEntry[] => {
    return lines
      .map((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (!product) return null;
        return {
          product,
          quantity: line.quantity,
          lineTotal: product.priceBYN * line.quantity,
        };
      })
      .filter((e): e is CartEntry => e !== null);
  }, [lines]);

  const itemCount = useMemo(
    () => entries.reduce((sum, e) => sum + e.quantity, 0),
    [entries],
  );

  const subtotal = useMemo(
    () => entries.reduce((sum, e) => sum + e.lineTotal, 0),
    [entries],
  );

  const discount = useMemo(
    () => (promoApplied ? Math.round(subtotal * 0.05) : 0),
    [promoApplied, subtotal],
  );

  const applyPromo = useCallback((code: string) => {
    if (code.trim().length === 0) return false;
    setPromoApplied(true);
    savePromoApplied(true);
    return true;
  }, []);

  const clearPromo = useCallback(() => {
    setPromoApplied(false);
    savePromoApplied(false);
  }, []);

  const isInCart = useCallback(
    (productId: string) => lines.some((l) => l.productId === productId),
    [lines],
  );

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.productId === productId);
        let next: CartLine[];
        if (idx >= 0) {
          next = prev.map((l, i) =>
            i === idx ? { ...l, quantity: l.quantity + quantity } : l,
          );
        } else {
          next = [...prev, { productId, quantity }];
        }
        persist(next);
        return next;
      });
    },
    [],
  );

  const removeFromCart = useCallback((productId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.productId !== productId);
      persist(next);
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setLines((prev) => {
      const next = prev.map((l) => (l.productId === productId ? { ...l, quantity } : l));
      persist(next);
      return next;
    });
  }, [removeFromCart]);

  const toggleCart = useCallback(
    (productId: string) => {
      if (isInCart(productId)) removeFromCart(productId);
      else addToCart(productId, 1);
    },
    [isInCart, removeFromCart, addToCart],
  );

  const clearCart = useCallback(() => {
    commit([]);
    setPromoApplied(false);
    savePromoApplied(false);
  }, [commit]);

  useEffect(() => {
    if (hadUserRef.current && !user) {
      clearCart();
    }
    hadUserRef.current = Boolean(user);
  }, [user, clearCart]);

  const value = useMemo(
    () => ({
      lines,
      entries,
      itemCount,
      subtotal,
      promoApplied,
      discount,
      applyPromo,
      clearPromo,
      isInCart,
      addToCart,
      removeFromCart,
      setQuantity,
      toggleCart,
      clearCart,
    }),
    [
      lines,
      entries,
      itemCount,
      subtotal,
      promoApplied,
      discount,
      applyPromo,
      clearPromo,
      isInCart,
      addToCart,
      removeFromCart,
      setQuantity,
      toggleCart,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
