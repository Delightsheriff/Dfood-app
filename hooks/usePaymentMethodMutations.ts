import { usePaymentMethodStore } from "@/store/paymentMethodStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function invalidatePaymentMethods(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
  queryClient.invalidateQueries({ queryKey: ["paymentMethod", "default"] });
}

export function useAddCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reference: string) => {
      const paymentMethod = usePaymentMethodStore.getState().addCard(reference);
      return {
        success: true,
        data: { paymentMethod },
        message: "Card added successfully",
      };
    },
    onSuccess: () => {
      invalidatePaymentMethods(queryClient);
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const paymentMethod = usePaymentMethodStore
        .getState()
        .setDefaultPaymentMethod(id);
      return { success: true, data: { paymentMethod } };
    },
    onSuccess: () => {
      invalidatePaymentMethods(queryClient);
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      usePaymentMethodStore.getState().deletePaymentMethod(id);
      return { success: true as const, message: "Card deleted" };
    },
    onSuccess: () => {
      invalidatePaymentMethods(queryClient);
    },
  });
}
