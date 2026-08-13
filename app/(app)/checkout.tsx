import { ButtonText } from "@/components/ui/button";
import {
  ProgressiveBlurFooter,
  useProgressiveBlurScroll,
} from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
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
  ArrowUp01Icon,
  Clock01Icon,
  CreditCardIcon,
  Location01Icon,
  Money01Icon,
  Note01Icon,
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
  const { scrollY, onScroll } = useProgressiveBlurScroll();

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
  const deliveryFee = restaurant ? restaurant.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const placeOrderPressed = useSharedValue(0);
  const placeOrderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(placeOrderPressed.get(), [0, 1], [1, 0.97]) }],
    opacity: interpolate(placeOrderPressed.get(), [0, 1], [1, 0.9]),
  }));

  const handlePlaceOrder = () => {
    if (!restaurantId || items.length === 0) {
      Alert.alert("Error", "Your cart is empty.");
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        "Address Required",
        "Please select or add a delivery address.",
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
        "Please select or add a payment method.",
        [
          {
            text: "Add Payment",
            onPress: () => router.push("/profile/add-card" as any),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
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
      <ScreenHeader
        variant="detail"
        title="Checkout"
        scrollY={scrollY}
        alwaysShowTitle
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 56,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* 1. Delivery Address Card */}
        <View className="mb-4">
          <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
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
                <Text className="text-[15px] font-title text-secondary">
                  {selectedAddress
                    ? selectedAddress.label || "Delivery Location"
                    : "No Address Saved"}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-xs font-body text-text-gray mt-0.5"
                >
                  {selectedAddress
                    ? `${selectedAddress.street}, ${selectedAddress.city}`
                    : "Tap to add or select a delivery address"}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-title text-primary">Change</Text>
          </Pressable>
        </View>

        {/* 2. Payment Method Card */}
        <View className="mb-4">
          <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
            Payment Method
          </Text>
          <Pressable
            onPress={() => {
              if (paymentMethods.length === 0) {
                router.push("/profile/payment-methods" as any);
              } else {
                setPaymentModalVisible(true);
              }
            }}
            className="p-4 bg-surface-muted rounded-[20px] flex-row items-center justify-between"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                <HugeiconsIcon
                  icon={
                    selectedPaymentMethod?.type === "cash"
                      ? Money01Icon
                      : CreditCardIcon
                  }
                  size={20}
                  color={ACCENT}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-title text-secondary">
                  {selectedPaymentMethod
                    ? selectedPaymentMethod.type === "card"
                      ? `•••• ${selectedPaymentMethod.cardLast4 || "4242"}`
                      : "Cash on Delivery"
                    : "No Payment Method"}
                </Text>
                <Text className="text-xs font-body text-text-gray mt-0.5">
                  {selectedPaymentMethod?.type === "card"
                    ? `${selectedPaymentMethod.cardBrand?.toUpperCase() || "Card"} payment`
                    : "Pay when you receive your order"}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-title text-primary">Change</Text>
          </Pressable>
        </View>

        {/* 3. Delivery Instructions Card */}
        <View className="mb-4">
          <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
            Delivery Notes (Optional)
          </Text>
          <View
            className="p-4 bg-surface-muted rounded-[20px] flex-row items-start"
            style={{ borderCurve: "continuous" }}
          >
            <HugeiconsIcon
              icon={Note01Icon}
              size={20}
              color="#646982"
              className="mt-0.5 mr-3"
            />
            <TextInput
              placeholder="e.g. Leave at the front gate, ring the bell..."
              placeholderTextColor="#A0A5BA"
              value={customerNotes}
              onChangeText={setCustomerNotes}
              className="flex-1 font-body text-sm text-secondary min-h-[48px]"
              multiline
            />
          </View>
        </View>

        {/* 4. Estimated Delivery Time Banner */}
        <View className="mb-4">
          <View
            className="p-4 bg-[#FFF8F6] border border-[#FFE8E4] rounded-[20px] flex-row items-center"
            style={{ borderCurve: "continuous" }}
          >
            <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
              <HugeiconsIcon icon={Clock01Icon} size={20} color={ACCENT} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-title text-secondary">
                Estimated Delivery
              </Text>
              <Text className="text-xs font-body text-text-gray mt-0.5">
                25–35 mins • Priority Delivery
              </Text>
            </View>
          </View>
        </View>

        {/* 5. Order Summary Card */}
        <View className="mb-6">
          <Pressable
            onPress={() => setItemsExpanded(!itemsExpanded)}
            className="flex-row items-center justify-between mb-2.5"
          >
            <Text className="text-[14px] font-title text-secondary">
              {items.length} {items.length === 1 ? "Item" : "Items"} from{" "}
              {restaurant?.name || "Restaurant"}
            </Text>
            <HugeiconsIcon
              icon={itemsExpanded ? ArrowUp01Icon : ArrowDown01Icon}
              size={16}
              color="#646982"
            />
          </Pressable>

          {itemsExpanded && (
            <View
              className="py-3 bg-surface-muted rounded-[20px] px-4 gap-2 mb-3"
              style={{ borderCurve: "continuous" }}
            >
              {items.map((item) => (
                <View
                  key={item.foodItem._id}
                  className="flex-row justify-between items-center"
                >
                  <Text
                    numberOfLines={1}
                    className="text-xs font-body text-secondary flex-1 mr-2"
                  >
                    {item.quantity}x {item.foodItem.name}
                  </Text>
                  <Text className="text-xs font-numeric text-secondary">
                    ₦{(item.foodItem.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Breakdown */}
          <View
            className="p-4 bg-surface-muted rounded-[20px]"
            style={{ borderCurve: "continuous" }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-body text-text-gray">Subtotal</Text>
              <Text className="text-xs font-numeric text-secondary">
                ₦{subtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-body text-text-gray">
                Delivery Fee
              </Text>
              <Text className="text-xs font-numeric text-secondary">
                {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
              </Text>
            </View>
            <View className="h-[1px] bg-gray-200 my-2" />
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-title text-secondary">
                Total Amount
              </Text>
              <Text className="text-xl font-numeric text-secondary">
                ₦{total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Sticky "Place Order" Button with ProgressiveBlurFooter */}
      <View
        className="absolute bottom-0 left-0 right-0 z-30"
        style={{
          paddingBottom: insets.bottom + 12,
        }}
      >
        <ProgressiveBlurFooter
          barHeight={80}
          zIndex={1}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        />
        <View className="px-5 pt-3" style={{ zIndex: 2 }}>
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
                <ButtonText className="font-label text-base">
                  Place Order • ₦{total.toLocaleString()}
                </ButtonText>
              )}
            </Animated.View>
          </GestureDetector>
        </View>
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
              <Text className="text-lg font-title text-secondary">
                Select Delivery Address
              </Text>
              <Pressable
                onPress={() => {
                  setAddressModalVisible(false);
                  router.push("/profile/add-address" as any);
                }}
              >
                <Text className="text-xs font-label text-primary">
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
                    <Text className="text-sm font-title text-secondary">
                      {addr.label}
                    </Text>
                    <Text className="text-xs font-body text-text-gray mt-0.5">
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
            <Text className="text-lg font-title text-secondary mb-4">
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
                        <Text className="text-sm font-title text-secondary">
                          {pm.type === "card"
                            ? `Card (•••• ${pm.cardLast4 || "4242"})`
                            : "Cash on Delivery"}
                        </Text>
                        <Text className="text-[11px] font-body text-text-gray">
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
