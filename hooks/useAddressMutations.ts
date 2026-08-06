import { useAddressStore } from "@/store/addressStore";
import { CreateAddressRequest, UpdateAddressRequest } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function invalidateAddresses(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["addresses"] });
  queryClient.invalidateQueries({ queryKey: ["address", "default"] });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAddressRequest) => {
      const address = useAddressStore.getState().createAddress(data);
      return { success: true, data: { address } };
    },
    onSuccess: () => {
      invalidateAddresses(queryClient);
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAddressRequest;
    }) => {
      const address = useAddressStore.getState().updateAddress(id, data);
      return { success: true, data: { address } };
    },
    onSuccess: () => {
      invalidateAddresses(queryClient);
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const address = useAddressStore.getState().setDefaultAddress(id);
      return { success: true, data: { address } };
    },
    onSuccess: () => {
      invalidateAddresses(queryClient);
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      useAddressStore.getState().deleteAddress(id);
      return { success: true as const, message: "Address deleted" };
    },
    onSuccess: () => {
      invalidateAddresses(queryClient);
    },
  });
}
