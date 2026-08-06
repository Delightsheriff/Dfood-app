import { Order } from "@/types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const LOCAL_CUSTOMER_ID = "local-user";

export type OrderDraft = {
  restaurantId: Order["restaurantId"];
  items: Order["items"];
  deliveryAddress: Order["deliveryAddress"];
  paymentMethod: Order["paymentMethod"];
  paymentStatus: Order["paymentStatus"];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerNotes?: string;
};

type OrderState = {
  orders: Order[];
  createOrder: (draft: OrderDraft) => Order;
  cancelOrder: (id: string) => Order;
  getOrderById: (id: string) => Order | undefined;
};

/**
 * Local order history persisted to AsyncStorage. Orders are created with a
 * pending status; cancelling is only allowed while pending.
 */
export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (draft: OrderDraft) => {
        const now = new Date().toISOString();
        const order: Order = {
          _id: `order-${Date.now()}`,
          orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
          customerId: LOCAL_CUSTOMER_ID,
          restaurantId: draft.restaurantId,
          items: draft.items,
          deliveryAddress: draft.deliveryAddress,
          paymentMethod: draft.paymentMethod,
          paymentStatus: draft.paymentStatus,
          subtotal: draft.subtotal,
          deliveryFee: draft.deliveryFee,
          total: draft.total,
          customerNotes: draft.customerNotes,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      cancelOrder: (id: string) => {
        const order = get().getOrderById(id);
        if (!order) {
          throw new Error("Order not found");
        }
        if (order.status !== "pending") {
          throw new Error("Only pending orders can be cancelled");
        }
        const cancelled: Order = {
          ...order,
          status: "cancelled",
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          orders: state.orders.map((o) => (o._id === id ? cancelled : o)),
        }));
        return cancelled;
      },

      getOrderById: (id: string) =>
        get().orders.find((order) => order._id === id),
    }),
    {
      name: "orders-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
