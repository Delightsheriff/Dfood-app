import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { DeliveryAddressSection } from "@/components/checkout/DeliveryAddressSection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentMethodSection } from "@/components/checkout/PaymentMethodSection";
import { PlaceOrderButton } from "@/components/checkout/PlaceOrderButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Banknote, CreditCard } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Checkout() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);

  const { data: addressesData } = useAddresses();
  const { data: defaultAddressData } = useDefaultAddress();
  const { data: paymentMethodsData } = usePaymentMethods();
  const { data: defaultPaymentData } = useDefaultPaymentMethod();
  const createOrderMutation = useCreateOrder();

  // Get restaurant data for delivery fee
  const restaurantId = items.length > 0 ? items[0].restaurantId : "";
  const { data: restaurantData } = useRestaurant(restaurantId);
  const restaurant = restaurantData?.data.restaurant;

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [customerNotes, setCustomerNotes] = useState("");

  const addressSheetRef = useRef<BottomSheet>(null);
  const paymentSheetRef = useRef<BottomSheet>(null);

  // Bottom sheet snap points
  const addressSnapPoints = useMemo(() => ["70%"], []);
  const paymentSnapPoints = useMemo(() => ["50%"], []);

  const addresses = addressesData?.data.addresses || [];
  const paymentMethods = paymentMethodsData?.data.paymentMethods || [];

  // Set defaults when data loads
  React.useEffect(() => {
    if (defaultAddressData?.data.address && !selectedAddress) {
      setSelectedAddress(defaultAddressData.data.address);
    }
  }, [defaultAddressData, selectedAddress]);

  React.useEffect(() => {
    if (defaultPaymentData?.data.paymentMethod && !selectedPaymentMethod) {
      setSelectedPaymentMethod(defaultPaymentData.data.paymentMethod);
    }
  }, [defaultPaymentData, selectedPaymentMethod]);

  // Calculate totals
  const restaurantName = items.length > 0 ? items[0].restaurantName : "";
  const subtotal = getTotalPrice;
  const deliveryFee = restaurant?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert("Address Required", "Please select a delivery address");
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert("Payment Required", "Please select a payment method");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty");
      return;
    }

    if (!restaurantId) {
      Alert.alert("Error", "Restaurant information is missing");
      return;
    }

    // Build order data - only include customerNotes if not empty
    const orderData: any = {
      restaurantId,
      items: items.map((item) => ({
        foodItemId: item.foodItem._id,
        quantity: item.quantity,
      })),
      addressId: selectedAddress._id,
      paymentMethodId: selectedPaymentMethod._id,
    };

    // Only add customerNotes if it has content
    if (customerNotes && customerNotes.trim()) {
      orderData.customerNotes = customerNotes.trim();
    }

    console.log("Submitting order:", JSON.stringify(orderData, null, 2));

    createOrderMutation.mutate(orderData, {
      onSuccess: (response) => {
        console.log("Order success response:", response);
        clearCart();
        router.replace({
          pathname: "/(app)/order-confirmation",
          params: { orderId: response.data.order._id },
        });
      },
      onError: (error: any) => {
        console.error("Full error object:", error);
        console.error("Error response:", error.response);
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to place order. Please try again.";
        Alert.alert("Order Failed", message);
      },
    });
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const AddressItem = ({ address }: { address: Address }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedAddress(address);
        addressSheetRef.current?.close();
      }}
      className={`p-4 rounded-xl mb-3 ${
        selectedAddress?._id === address._id
          ? "bg-[#FFF5EE] border-2 border-primary"
          : "bg-[#F0F5FA]"
      }`}
    >
      <Text className="font-sen-bold text-secondary text-sm uppercase mb-1">
        {address.label}
      </Text>
      <Text className="font-sen text-text-gray text-sm">
        {address.street}, {address.city}, {address.state}
      </Text>
    </TouchableOpacity>
  );

  const PaymentItem = ({ method }: { method: PaymentMethod }) => {
    const isCash = method.type === "cash";
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedPaymentMethod(method);
          paymentSheetRef.current?.close();
        }}
        className={`p-4 rounded-xl mb-3 flex-row items-center ${
          selectedPaymentMethod?._id === method._id
            ? "bg-[#FFF5EE] border-2 border-primary"
            : "bg-[#F0F5FA]"
        }`}
      >
        <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
          {isCash ? (
            <Banknote color="#2D8EFF" size={20} />
          ) : (
            <CreditCard color="#FF7622" size={20} />
          )}
        </View>
        <View className="flex-1">
          <Text className="font-sen-bold text-secondary text-sm">
            {isCash
              ? "CASH ON DELIVERY"
              : `${method.cardBrand} •••• ${method.cardLast4}`}
          </Text>
          {!isCash && (
            <Text className="font-sen text-text-gray text-xs">
              {method.bank} • {method.cardExpMonth}/{method.cardExpYear}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading if restaurant data not loaded yet
  if (!restaurant && restaurantId) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
          <Text className="text-text-gray font-sen mt-4">
            Loading restaurant details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <CheckoutHeader onBack={() => router.back()} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        >
          <OrderSummary
            restaurantName={restaurantName}
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
          />

          <DeliveryAddressSection
            selectedAddress={selectedAddress}
            hasAddresses={addresses.length > 0}
            onSelectPress={() => addressSheetRef.current?.snapToIndex(0)}
            onAddPress={() => router.push("/profile/add-address" as any)}
          />

          <PaymentMethodSection
            selectedPaymentMethod={selectedPaymentMethod}
            paymentMethodsCount={paymentMethods.length}
            onSelectPress={() => paymentSheetRef.current?.snapToIndex(0)}
            onAddCardPress={() => router.push("/profile/add-card" as any)}
          />

          {/* Customer Notes */}
          <View className="mb-6">
            <Label className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide">
              DELIVERY INSTRUCTIONS (OPTIONAL)
            </Label>
            <Input
              placeholder="e.g., Ring the doorbell, Leave at door"
              placeholderTextColor="#B4B9CA"
              value={customerNotes}
              onChangeText={setCustomerNotes}
              multiline
              numberOfLines={3}
              className="h-24 !bg-[#F0F5FA] text-text-gray-dark border-0"
              style={{ textAlignVertical: "top", paddingTop: 12 }}
              maxLength={500}
            />
            <Text className="text-xs text-text-gray font-sen mt-1">
              {customerNotes.length}/500
            </Text>
          </View>
        </ScrollView>

        <PlaceOrderButton
          onPress={handlePlaceOrder}
          disabled={
            !selectedAddress ||
            !selectedPaymentMethod ||
            createOrderMutation.isPending
          }
          isPending={createOrderMutation.isPending}
          total={total}
        />

        {/* Address Selection Bottom Sheet */}
        <BottomSheet
          ref={addressSheetRef}
          index={-1}
          snapPoints={addressSnapPoints}
          enablePanDownToClose={true}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 16 }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-sen-bold text-secondary">
                Select Address
              </Text>
              <TouchableOpacity
                onPress={() => {
                  addressSheetRef.current?.close();
                  router.push("/profile/add-address" as any);
                }}
              >
                <Text className="text-primary font-sen-bold text-sm">
                  + ADD NEW
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {addresses.map((address) => (
                <AddressItem key={address._id} address={address} />
              ))}
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>

        {/* Payment Method Selection Bottom Sheet */}
        <BottomSheet
          ref={paymentSheetRef}
          index={-1}
          snapPoints={paymentSnapPoints}
          enablePanDownToClose={true}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView
            style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 16 }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-sen-bold text-secondary">
                Select Payment
              </Text>
              {paymentMethods.length === 1 && (
                <TouchableOpacity
                  onPress={() => {
                    paymentSheetRef.current?.close();
                    router.push("/profile/add-card" as any);
                  }}
                >
                  <Text className="text-primary font-sen-bold text-sm">
                    + ADD CARD
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {paymentMethods.map((method) => (
                <PaymentItem key={method._id} method={method} />
              ))}
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
