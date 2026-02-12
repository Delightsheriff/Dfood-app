import { dataService } from "@/services/data.service";
import { CreateAddressRequest, UpdateAddressRequest } from "@/types/api";
import { ErrorResponse } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressRequest) => dataService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["address", "default"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Create address failed:", error.response?.data);
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressRequest }) =>
      dataService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["address", "default"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Update address failed:", error.response?.data);
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["address", "default"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Set default address failed:", error.response?.data);
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["address", "default"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Delete address failed:", error.response?.data);
    },
  });
}
