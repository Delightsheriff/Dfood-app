import { ButtonText } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  useAddresses,
  useDefaultAddress,
  useDefaultPaymentMethod,
  usePaymentMethods,
  useRestaurant,
} from "@/hooks/useDataQueries";
import { useCreateOrder } from "@/hooks/useOrderMutations";
import { useCartStore } from "@/store/cartStore";
import { Address, PaymentMethod } from "@/types/api";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  Clock01Icon,
  CreditCardIcon,
  Location01Icon,
  Money01Icon,
  Note01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function Checkout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const restaurantId = useCartStore((state) => state.getRestaurantId()) || "";

  const { data: restaurantData } = useRestaurant(restaurantId);
  const restaurant = restaurantData?.data.restaurant;

  const { data: addressesData } = useAddresses();
  const { data: defaultAddressData } = useDefaultAddress();
  const { data: paymentMethodsData } = usePaymentMethods();
  const { data: defaultPaymentData } = useDefaultPaymentMethod();

  const createOrderMutation = useCreateOrder();

  const [selectedAddressOverride, setSelectedAddressOverride] =
    useState<Address | null>(null);
  const [selectedPaymentOverride, setSelectedPaymentOverride] =
    useState<PaymentMethod | null>(null);
  const [customerNotes, setCustomerNotes] = useState("");
  const [itemsExpanded, setItemsExpanded] = useState(false);

  // Sheet modals
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const addresses = addressesData?.data.addresses || [];
  const paymentMethods = paymentMethodsData?.data.paymentMethods || [];

  const selectedAddress =
    selectedAddressOverride ??
    defaultAddressData?.data.address ??
    addresses[0] ??
    null;
  const selectedPaymentMethod =
    selectedPaymentOverride ??
    defaultPaymentData?.data.paymentMethod ??
    paymentMethods[0] ??
    null;

  const subtotal = getTotalPrice;
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  const placeOrderPressed = useSharedValue(0);
  const placeOrderStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(placeOrderPressed.get(), [0, 1], [1, 0.97]) },
    ],
    opacity: interpolate(placeOrderPressed.get(), [0, 1], [1, 0.9]),
  }));

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert(
        "Address Required",
        "Please select or add a delivery address to continue.",
        [
          {
            text: "Add Address",
            onPress: () => router.push("/profile/add-address" as any),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert(
        "Payment Required",
        "Please select a payment method to continue.",
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty.");
      router.back();
      return;
    }

    createOrderMutation.mutate(
      {
        restaurantId,
        items: items.map((item) => ({
          foodItemId: item.foodItem._id,
          quantity: item.quantity,
        })),
        addressId: selectedAddress._id,
        paymentMethodId: selectedPaymentMethod._id,
        customerNotes: customerNotes.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          clearCart();
          router.replace({
            pathname: "/(app)/order-confirmation",
            params: { orderId: response.data.order._id },
          });
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to place order. Please try again.";
          Alert.alert("Order Failed", message);
        },
      },
    );
  };

  const placeOrderTap = Gesture.Tap()
    .runOnJS(true)
    .enabled(!createOrderMutation.isPending && items.length > 0)
    .onBegin(() => {
      placeOrderPressed.set(1);
    })
    .onFinalize(() => {
      placeOrderPressed.set(0);
    })
    .onEnd((_event, success) => {
      if (success) {
        handlePlaceOrder();
      }
    });

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-5 pt-3 pb-3 border-b border-gray-100 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 4 }}
      >
        <IconButton
          icon={ArrowLeft01Icon}
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <Text className="text-[17px] font-sen-bold text-secondary">
          Checkout
        </Text>
        <View className="w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* 1. Delivery Address Card */}
        <View className="mb-4">
          <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
            Delivery Address
          </Text>
          <Pressable
            onPress={() => {
              if (addresses.length === 0) {
                router.push("/profile/add-address" as any);
              } else {
                setAddressModalVisible(true);
              }
            }}
            className="p-4 bg-surface-muted rounded-[20px] flex-row items-center justify-between"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                <HugeiconsIcon icon={Location01Icon} size={20} color={ACCENT} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-sen-bold text-secondary">
                  {selectedAddress
                    ? selectedAddress.label || "Delivery Location"
                    : "No Address Saved"}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-xs font-sen text-text-gray mt-0.5"
                >
                  {selectedAddress
                    ? `${selectedAddress.street}, ${selectedAddress.city}`
                    : "Tap to add a new delivery address"}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-sen-bold text-primary">
              {selectedAddress ? "Change" : "Add"}
            </Text>
          </Pressable>
        </View>

        {/* 2. Delivery Time Estimate */}
        <View className="mb-4">
          <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
            Delivery Time
          </Text>
          <View
            className="p-4 bg-surface-muted rounded-[20px] flex-row items-center"
            style={{ borderCurve: "continuous" }}
          >
            <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
              <HugeiconsIcon icon={Clock01Icon} size={20} color="#262B33" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-sen-bold text-secondary">
                Standard Delivery
              </Text>
              <Text className="text-xs font-sen text-text-gray mt-0.5">
                Estimated 25–35 mins
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Payment Method Card */}
        <View className="mb-4">
          <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
            Payment Method
          </Text>
          <Pressable
            onPress={() => setPaymentModalVisible(true)}
            className="p-4 bg-surface-muted rounded-[20px] flex-row items-center justify-between"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                <HugeiconsIcon
                  icon={
                    selectedPaymentMethod?.type === "card"
                      ? CreditCardIcon
                      : Money01Icon
                  }
                  size={20}
                  color={ACCENT}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[15px] font-sen-bold text-secondary">
                    {selectedPaymentMethod?.type === "card"
                      ? `Card •••• ${selectedPaymentMethod.cardLast4 || "4242"}`
                      : "Cash on Delivery"}
                  </Text>
                  <View className="bg-white px-2 py-0.5 rounded-md">
                    <Text className="text-[10px] font-sen-bold text-text-gray">
                      Demo
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-sen text-text-gray mt-0.5">
                  {selectedPaymentMethod?.type === "card"
                    ? "Pay with saved demo card"
                    : "Pay with cash upon delivery"}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-sen-bold text-primary">Change</Text>
          </Pressable>
        </View>

        {/* 4. Customer Notes Input */}
        <View className="mb-4">
          <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
            Rider Notes (Optional)
          </Text>
          <View
            className="p-3.5 bg-surface-muted rounded-[20px] flex-row items-center"
            style={{ borderCurve: "continuous" }}
          >
            <HugeiconsIcon icon={Note01Icon} size={18} color="#646982" />
            <TextInput
              placeholder="e.g. Ring doorbell, gate code #1234"
              placeholderTextColor="#A0A5BA"
              value={customerNotes}
              onChangeText={setCustomerNotes}
              className="flex-1 ml-2.5 font-sen text-[13px] text-secondary"
            />
          </View>
        </View>

        {/* 5. Order Summary Card */}
        <View
          className="p-5 bg-surface-muted rounded-[20px] mb-6"
          style={{ borderCurve: "continuous" }}
        >
          {/* Collapsible item preview */}
          <Pressable
            onPress={() => setItemsExpanded(!itemsExpanded)}
            className="flex-row items-center justify-between pb-3 border-b border-gray-200"
          >
            <View className="flex-row items-center gap-2">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={16} color="#262B33" />
              <Text className="text-[14px] font-sen-bold text-secondary">
                {items.length} {items.length === 1 ? "Item" : "Items"} from{" "}
                {restaurant?.name || "Restaurant"}
              </Text>
            </View>
            <HugeiconsIcon
              icon={itemsExpanded ? ArrowUp01Icon : ArrowDown01Icon}
              size={16}
              color="#646982"
            />
          </Pressable>

          {itemsExpanded && (
            <View className="py-3 border-b border-gray-200 gap-2">
              {items.map((item) => (
                <View
                  key={item.foodItem._id}
                  className="flex-row justify-between items-center"
                >
                  <Text
                    numberOfLines={1}
                    className="text-xs font-sen text-secondary flex-1 mr-2"
                  >
                    {item.quantity}x {item.foodItem.name}
                  </Text>
                  <Text className="text-xs font-sen-bold text-secondary">
                    ₦{(item.foodItem.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Breakdown */}
          <View className="pt-3 gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sen text-text-gray">Subtotal</Text>
              <Text className="text-xs font-sen-bold text-secondary">
                ₦{subtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sen text-text-gray">
                Delivery Fee
              </Text>
              <Text className="text-xs font-sen-bold text-secondary">
                {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
              </Text>
            </View>
            <View className="h-[1px] bg-gray-200 my-1" />
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-sen-bold text-secondary">
                Total
              </Text>
              <Text className="text-xl font-sen-extra-bold text-secondary">
                ₦{total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky "Place Order" Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3 border-t border-gray-100"
        style={{
          paddingBottom: insets.bottom + 12,
          boxShadow: "0px -4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <GestureDetector gesture={placeOrderTap}>
          <Animated.View
            accessibilityRole="button"
            accessibilityLabel="Place Order"
            className="h-14 w-full flex-row items-center justify-center bg-secondary rounded-full"
            style={placeOrderStyle}
          >
            {createOrderMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ButtonText className="font-sen-bold text-base">
                Place Order • ₦{total.toLocaleString()}
              </ButtonText>
            )}
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Address Switcher Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable
            className="flex-1"
            onPress={() => setAddressModalVisible(false)}
          />
          <View
            className="bg-white rounded-t-[28px] p-6 max-h-[70%]"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-sen-bold text-secondary">
                Select Delivery Address
              </Text>
              <Pressable
                onPress={() => {
                  setAddressModalVisible(false);
                  router.push("/profile/add-address" as any);
                }}
              >
                <Text className="text-xs font-sen-bold text-primary">
                  + Add New
                </Text>
              </Pressable>
            </View>

            <ScrollView className="max-h-[300px]">
              {addresses.map((addr) => {
                const isSelected = selectedAddress?._id === addr._id;
                return (
                  <Pressable
                    key={addr._id}
                    onPress={() => {
                      setSelectedAddressOverride(addr);
                      setAddressModalVisible(false);
                    }}
                    className={`p-4 rounded-2xl mb-2.5 border ${
                      isSelected
                        ? "bg-[#FFF5F3] border-primary"
                        : "bg-surface-muted border-transparent"
                    }`}
                  >
                    <Text className="text-sm font-sen-bold text-secondary">
                      {addr.label}
                    </Text>
                    <Text className="text-xs font-sen text-text-gray mt-0.5">
                      {addr.street}, {addr.city}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Method Switcher Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable
            className="flex-1"
            onPress={() => setPaymentModalVisible(false)}
          />
          <View
            className="bg-white rounded-t-[28px] p-6 max-h-[60%]"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Text className="text-lg font-sen-bold text-secondary mb-4">
              Select Payment Method
            </Text>

            <ScrollView className="max-h-[250px]">
              {paymentMethods.map((pm) => {
                const isSelected = selectedPaymentMethod?._id === pm._id;
                return (
                  <Pressable
                    key={pm._id}
                    onPress={() => {
                      setSelectedPaymentOverride(pm);
                      setPaymentModalVisible(false);
                    }}
                    className={`p-4 rounded-2xl mb-2.5 border flex-row items-center justify-between ${
                      isSelected
                        ? "bg-[#FFF5F3] border-primary"
                        : "bg-surface-muted border-transparent"
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <HugeiconsIcon
                        icon={pm.type === "card" ? CreditCardIcon : Money01Icon}
                        size={20}
                        color={ACCENT}
                      />
                      <View>
                        <Text className="text-sm font-sen-bold text-secondary">
                          {pm.type === "card"
                            ? `Card (•••• ${pm.cardLast4 || "4242"})`
                            : "Cash on Delivery"}
                        </Text>
                        <Text className="text-[11px] font-sen text-text-gray">
                          Demo test mode
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-[10px]">✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
