import { dataService } from "@/services/data.service";
import { ErrorResponse } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useAddCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => dataService.addCard(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      queryClient.invalidateQueries({ queryKey: ["paymentMethod", "default"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Add card failed:", error.response?.data);
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataService.setDefaultPaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      queryClient.invalidateQueries({ queryKey: ["paymentMethod", "default"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Set default payment method failed:", error.response?.data);
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      queryClient.invalidateQueries({ queryKey: ["paymentMethod", "default"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Delete payment method failed:", error.response?.data);
    },
  });
}
