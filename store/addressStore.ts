import { Address, CreateAddressRequest, UpdateAddressRequest } from "@/types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const LOCAL_USER_ID = "local-user";

type AddressState = {
  addresses: Address[];
  createAddress: (data: CreateAddressRequest) => Address;
  updateAddress: (id: string, data: UpdateAddressRequest) => Address;
  setDefaultAddress: (id: string) => Address;
  deleteAddress: (id: string) => void;
  getDefaultAddress: () => Address | undefined;
  getAddressById: (id: string) => Address | undefined;
};

function newAddress(data: CreateAddressRequest, isDefault: boolean): Address {
  const now = new Date().toISOString();
  return {
    _id: `address-${Date.now()}`,
    userId: LOCAL_USER_ID,
    label: data.label,
    street: data.street,
    city: data.city,
    state: data.state,
    coordinates: data.coordinates,
    isDefault,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Local delivery addresses persisted to AsyncStorage. The first address
 * created becomes the default; deleting the default promotes the first
 * remaining address.
 */
export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],

      createAddress: (data: CreateAddressRequest) => {
        const address = newAddress(data, get().addresses.length === 0);
        set((state) => ({ addresses: [...state.addresses, address] }));
        return address;
      },

      updateAddress: (id: string, data: UpdateAddressRequest) => {
        const address = get().getAddressById(id);
        if (!address) {
          throw new Error("Address not found");
        }
        const updated: Address = { ...address, ...data, updatedAt: new Date().toISOString() };
        set((state) => ({
          addresses: state.addresses.map((a) => (a._id === id ? updated : a)),
        }));
        return updated;
      },

      setDefaultAddress: (id: string) => {
        const address = get().getAddressById(id);
        if (!address) {
          throw new Error("Address not found");
        }
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a._id === id,
          })),
        }));
        return { ...address, isDefault: true };
      },

      deleteAddress: (id: string) => {
        const target = get().getAddressById(id);
        set((state) => {
          const remaining = state.addresses.filter((a) => a._id !== id);
          if (target?.isDefault && remaining.length > 0) {
            return {
              addresses: remaining.map((a, index) => ({
                ...a,
                isDefault: index === 0,
              })),
            };
          }
          return { addresses: remaining };
        });
      },

      getDefaultAddress: () =>
        get().addresses.find((address) => address.isDefault) ??
        get().addresses[0],

      getAddressById: (id: string) =>
        get().addresses.find((address) => address._id === id),
    }),
    {
      name: "addresses-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
