import { hashString } from "@/lib/utils";
import { PaymentMethod } from "@/types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const CASH_METHOD_ID = "payment-cash";

type PaymentMethodState = {
  paymentMethods: PaymentMethod[];
  addCard: (reference: string) => PaymentMethod;
  setDefaultPaymentMethod: (id: string) => PaymentMethod;
  deletePaymentMethod: (id: string) => void;
  getDefaultPaymentMethod: () => PaymentMethod | undefined;
  getPaymentMethodById: (id: string) => PaymentMethod | undefined;
};

function cashMethod(isDefault: boolean): PaymentMethod {
  const now = new Date().toISOString();
  return {
    _id: CASH_METHOD_ID,
    type: "cash",
    isDefault,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Local payment methods persisted to AsyncStorage. Cash is always present
 * and default while no cards exist. Cards are cosmetic placeholders in
 * Phase 2; Paystack verification is deferred to Phase 4.
 */
export const usePaymentMethodStore = create<PaymentMethodState>()(
  persist(
    (set, get) => ({
      paymentMethods: [cashMethod(true)],

      addCard: (reference: string) => {
        const hasCards = get().paymentMethods.some((method) => method.type === "card");
        const now = new Date().toISOString();
        const card: PaymentMethod = {
          _id: `card-${Date.now()}`,
          type: "card",
          cardLast4: String(hashString(reference) % 10000).padStart(4, "0"),
          cardBrand: "Visa",
          cardExpMonth: "12",
          cardExpYear: "2030",
          bank: "Mock Bank",
          isDefault: !hasCards,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          paymentMethods: [
            ...state.paymentMethods.map((method) => ({
              ...method,
              isDefault: card.isDefault ? false : method.isDefault,
            })),
            card,
          ],
        }));
        return card;
      },

      setDefaultPaymentMethod: (id: string) => {
        const method = get().getPaymentMethodById(id);
        if (!method) {
          throw new Error("Payment method not found");
        }
        set((state) => ({
          paymentMethods: state.paymentMethods.map((m) => ({
            ...m,
            isDefault: m._id === id,
          })),
        }));
        return { ...method, isDefault: true };
      },

      deletePaymentMethod: (id: string) => {
        const target = get().getPaymentMethodById(id);
        if (target?.type === "cash") {
          throw new Error("Cannot delete cash payment option");
        }
        set((state) => {
          const remaining = state.paymentMethods.filter((m) => m._id !== id);
          if (!target?.isDefault) {
            return { paymentMethods: remaining };
          }
          const cards = remaining.filter((m) => m.type === "card");
          const newDefaultId = cards[0]?._id ?? CASH_METHOD_ID;
          return {
            paymentMethods: remaining.map((m) => ({
              ...m,
              isDefault: m._id === newDefaultId,
            })),
          };
        });
      },

      getDefaultPaymentMethod: () =>
        get().paymentMethods.find((method) => method.isDefault) ??
        get().paymentMethods.find((method) => method.type === "cash"),

      getPaymentMethodById: (id: string) =>
        get().paymentMethods.find((method) => method._id === id),
    }),
    {
      name: "payment-methods-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
