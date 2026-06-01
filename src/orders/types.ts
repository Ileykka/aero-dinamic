export type OrderStatus = "in_transit" | "delivered";

export type OrderLine = {
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  quantity: number;
  lineTotal: number;
};

export type StoredOrder = {
  id: string;
  userEmail: string;
  createdAt: string;
  status: OrderStatus;
  totalByn: number;
  lines: OrderLine[];
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  in_transit: "В пути",
  delivered: "Доставлен",
};
