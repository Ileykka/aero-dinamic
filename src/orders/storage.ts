import type { OrderStatus, StoredOrder } from "./types";

const ORDERS_KEY = "aero-orders";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadOrders(): StoredOrder[] {
  if (typeof localStorage === "undefined") return [];
  const parsed = safeParse<StoredOrder[]>(localStorage.getItem(ORDERS_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (o) =>
      o &&
      typeof o.id === "string" &&
      typeof o.userEmail === "string" &&
      Array.isArray(o.lines) &&
      o.lines.length > 0,
  );
}

export function saveOrders(orders: StoredOrder[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

export function appendOrder(order: StoredOrder): StoredOrder[] {
  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);
  return orders;
}

export function getOrdersForUser(email: string): StoredOrder[] {
  const normalized = email.trim().toLowerCase();
  return loadOrders().filter((o) => o.userEmail.toLowerCase() === normalized);
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  const orders = loadOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1 || orders[index].status === status) return;
  orders[index] = { ...orders[index], status };
  saveOrders(orders);
}
