import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import products, { type Product } from "../catalog/products";
import { loadFavorites, saveFavorites } from "./storage";

export type FavoriteEntry = {
  product: Product;
};

type FavoritesContextValue = {
  entries: FavoriteEntry[];
  count: number;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function persist(ids: string[]) {
  saveFavorites(ids.map((productId) => ({ productId })));
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => loadFavorites().map((l) => l.productId));

  const entries = useMemo((): FavoriteEntry[] => {
    return ids
      .map((id) => {
        const product = products.find((p) => p.id === id);
        if (!product) return null;
        return { product };
      })
      .filter((e): e is FavoriteEntry => e !== null);
  }, [ids]);

  const isFavorite = useCallback((productId: string) => ids.includes(productId), [ids]);

  const toggleFavorite = useCallback((productId: string) => {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      persist(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setIds((prev) => {
      const next = prev.filter((id) => id !== productId);
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      entries,
      count: entries.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
    }),
    [entries, isFavorite, toggleFavorite, removeFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
