import { dataService } from "@/services/data.service";
import { useAddressStore } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import { usePaymentMethodStore } from "@/store/paymentMethodStore";
import { CreateOrderRequest, OrderItem } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      // Resolve the restaurant and every food item so the order snapshot
      // renders without later refetching.
      const [restaurantResponse, ...foodResponses] = await Promise.all([
        dataService.getRestaurantById(data.restaurantId),
        ...data.items.map((item) =>
          dataService.getFoodItemById(item.foodItemId),
        ),
      ]);

      const restaurant = restaurantResponse.data.restaurant;
      const address = useAddressStore.getState().getAddressById(data.addressId);
      if (!address) {
        throw new Error("Delivery address not found");
      }
      const paymentMethod = usePaymentMethodStore
        .getState()
        .getPaymentMethodById(data.paymentMethodId);
      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      const items: OrderItem[] = data.items.map((item, index) => {
        const food = foodResponses[index].data.foodItem;
        return {
          foodItemId: item.foodItemId,
          name: food.name,
          price: food.price,
          quantity: item.quantity,
          image: food.images[0] ?? "",
          subtotal: food.price * item.quantity,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const deliveryFee = restaurant.deliveryFee ?? 0;

      const order = useOrderStore.getState().createOrder({
        restaurantId: {
          _id: restaurant._id,
          name: restaurant.name,
          images: restaurant.images,
          address: restaurant.address,
        },
        items,
        deliveryAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          coordinates: address.coordinates,
        },
        // Phase 2: no real payment processing, so payment stays pending.
        paymentMethod: paymentMethod.type === "cash" ? "cash" : "card",
        paymentStatus: "pending",
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        customerNotes: data.customerNotes,
      });

      return {
        success: true,
        data: { order },
        message: "Order placed successfully",
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const order = useOrderStore.getState().cancelOrder(id);
      return { success: true, data: { order } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
