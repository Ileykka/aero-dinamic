import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthContext";
import type { CartEntry } from "../cart/CartContext";
import { getCardImage } from "../catalog/products";
import { appendOrder, getOrdersForUser, updateOrderStatus } from "./storage";
import type { OrderLine, StoredOrder } from "./types";
import { ORDER_STATUS_LABEL } from "./types";

const DELIVERY_DELAY_MS = 60_000;

type AddCheckoutOrderPayload = {
  entries: CartEntry[];
  totalByn: number;
};

type OrdersContextValue = {
  orders: StoredOrder[];
  ordersTotalByn: number;
  addOrderFromCheckout: (payload: AddCheckoutOrderPayload) => void;
  getStatusLabel: (status: StoredOrder["status"]) => string;
  getOrderTitle: (order: StoredOrder) => string;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

function buildOrderLines(entries: CartEntry[]): OrderLine[] {
  return entries.map((entry) => ({
    productId: entry.product.id,
    productName: entry.product.name,
    productSlug: entry.product.slug,
    image: getCardImage(entry.product),
    quantity: entry.quantity,
    lineTotal: entry.lineTotal,
  }));
}

function getOrderTitle(order: StoredOrder): string {
  const first = order.lines[0];
  if (!first) return "Заказ";
  if (order.lines.length === 1) return first.productName;
  return `${first.productName} (+${order.lines.length - 1})`;
}

function getDeliveryRemainingMs(createdAt: string): number {
  return DELIVERY_DELAY_MS - (Date.now() - Date.parse(createdAt));
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);

  const markOrderDelivered = useCallback((orderId: string) => {
    updateOrderStatus(orderId, "delivered");
    setRevision((r) => r + 1);
  }, []);

  const scheduleDelivery = useCallback(
    (orderId: string, createdAt: string) => {
      const remaining = getDeliveryRemainingMs(createdAt);
      if (remaining <= 0) {
        markOrderDelivered(orderId);
        return;
      }
      window.setTimeout(() => markOrderDelivered(orderId), remaining);
    },
    [markOrderDelivered],
  );

  useEffect(() => {
    if (!user) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let anyMarked = false;

    for (const order of getOrdersForUser(user.email)) {
      if (order.status !== "in_transit") continue;

      const remaining = getDeliveryRemainingMs(order.createdAt);
      if (remaining <= 0) {
        updateOrderStatus(order.id, "delivered");
        anyMarked = true;
      } else {
        timeouts.push(window.setTimeout(() => markOrderDelivered(order.id), remaining));
      }
    }

    if (anyMarked) setRevision((r) => r + 1);

    return () => timeouts.forEach(clearTimeout);
  }, [user, markOrderDelivered]);

  const orders = useMemo(() => {
    if (!user) return [];
    void revision;
    return getOrdersForUser(user.email);
  }, [user, revision]);

  const ordersTotalByn = useMemo(
    () => orders.reduce((sum, o) => sum + o.totalByn, 0),
    [orders],
  );

  const addOrderFromCheckout = useCallback(
    (payload: AddCheckoutOrderPayload) => {
      if (!user || payload.entries.length === 0) return;
      const lines = buildOrderLines(payload.entries);
      const order: StoredOrder = {
        id: crypto.randomUUID(),
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        status: "in_transit",
        totalByn: payload.totalByn,
        lines,
      };
      appendOrder(order);
      scheduleDelivery(order.id, order.createdAt);
      setRevision((r) => r + 1);
    },
    [user, scheduleDelivery],
  );

  const value = useMemo(
    () => ({
      orders,
      ordersTotalByn,
      addOrderFromCheckout,
      getStatusLabel: (status: StoredOrder["status"]) => ORDER_STATUS_LABEL[status],
      getOrderTitle,
    }),
    [orders, ordersTotalByn, addOrderFromCheckout],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
