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
import {
  Banknote,
  Briefcase,
  Check,
  CreditCard,
  Home,
  MapPin,
  MessageSquare,
  Plus,
} from "lucide-react-native";
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

  const getLabelIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l === "home") return Home;
    if (l === "work") return Briefcase;
    return MapPin;
  };

  const getLabelColor = (label: string) => {
    const l = label.toLowerCase();
    if (l === "home") return { color: "#2D8EFF", bg: "#EBF4FF" };
    if (l === "work") return { color: "#FF7622", bg: "#FFF5EE" };
    return { color: "#7E8CA0", bg: "#F0F5FA" };
  };

  const AddressItem = ({ address }: { address: Address }) => {
    const isSelected = selectedAddress?._id === address._id;
    const Icon = getLabelIcon(address.label);
    const { color, bg } = getLabelColor(address.label);

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedAddress(address);
          addressSheetRef.current?.close();
        }}
        className={`p-4 rounded-2xl mb-3 flex-row items-center ${
          isSelected ? "bg-[#FFF5EE]" : "bg-[#F6F8FA]"
        }`}
        style={{
          borderWidth: isSelected ? 1.5 : 1,
          borderColor: isSelected ? "#FF7622" : "#F0F0F0",
        }}
        activeOpacity={0.7}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: bg }}
        >
          <Icon color={color} size={18} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <Text className="font-sen-bold text-secondary text-sm uppercase mr-2">
              {address.label}
            </Text>
            {address.isDefault && (
              <View className="bg-[#F0F5FA] px-2 py-0.5 rounded-md">
                <Text className="text-text-gray text-[9px] font-sen-bold">
                  DEFAULT
                </Text>
              </View>
            )}
          </View>
          <Text className="font-sen text-text-gray text-xs leading-4">
            {address.street}, {address.city}, {address.state}
          </Text>
        </View>
        {isSelected && (
          <View className="w-7 h-7 bg-primary rounded-lg items-center justify-center ml-2">
            <Check color="white" size={14} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const PaymentItem = ({ method }: { method: PaymentMethod }) => {
    const isCash = method.type === "cash";
    const isSelected = selectedPaymentMethod?._id === method._id;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedPaymentMethod(method);
          paymentSheetRef.current?.close();
        }}
        className={`p-4 rounded-2xl mb-3 flex-row items-center ${
          isSelected ? "bg-[#FFF5EE]" : "bg-[#F6F8FA]"
        }`}
        style={{
          borderWidth: isSelected ? 1.5 : 1,
          borderColor: isSelected ? "#FF7622" : "#F0F0F0",
        }}
        activeOpacity={0.7}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{
            backgroundColor: isCash ? "#EBF4FF" : "#FFF5EE",
          }}
        >
          {isCash ? (
            <Banknote color="#2D8EFF" size={18} />
          ) : (
            <CreditCard color="#FF7622" size={18} />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <Text className="font-sen-bold text-secondary text-sm mr-2">
              {isCash
                ? "Cash on Delivery"
                : `${method.cardBrand} •••• ${method.cardLast4}`}
            </Text>
            {method.isDefault && (
              <View className="bg-[#F0F5FA] px-2 py-0.5 rounded-md">
                <Text className="text-text-gray text-[9px] font-sen-bold">
                  DEFAULT
                </Text>
              </View>
            )}
          </View>
          {!isCash && (
            <Text className="font-sen text-text-gray text-xs">
              {method.bank} • Expires {method.cardExpMonth}/{method.cardExpYear}
            </Text>
          )}
        </View>
        {isSelected && (
          <View className="w-7 h-7 bg-primary rounded-lg items-center justify-center ml-2">
            <Check color="white" size={14} />
          </View>
        )}
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
            <View className="flex-row items-center mb-2">
              <View className="w-7 h-7 bg-[#F0F5FA] rounded-lg items-center justify-center mr-2">
                <MessageSquare color="#A0A5BA" size={14} />
              </View>
              <Label className="text-[#32343E] font-sen-bold text-[13px] uppercase tracking-wide">
                DELIVERY INSTRUCTIONS
              </Label>
              <Text className="text-text-gray font-sen text-[11px] ml-1.5">
                Optional
              </Text>
            </View>
            <Input
              placeholder="e.g., Ring the doorbell, Leave at door"
              placeholderTextColor="#B4B9CA"
              value={customerNotes}
              onChangeText={setCustomerNotes}
              multiline
              numberOfLines={3}
              className="h-24 !bg-[#F0F5FA] text-text-gray-dark border-0 rounded-2xl"
              style={{ textAlignVertical: "top", paddingTop: 12 }}
              maxLength={500}
            />
            <Text className="text-xs text-text-gray font-sen mt-1.5 text-right">
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
          handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
        >
          <BottomSheetView
            style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 8 }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-lg font-sen-bold text-secondary">
                  Select Address
                </Text>
                {addresses.length > 0 && (
                  <View className="bg-[#F0F5FA] px-2.5 py-1 rounded-lg ml-2">
                    <Text className="text-text-gray font-sen-bold text-xs">
                      {addresses.length}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  addressSheetRef.current?.close();
                  router.push("/profile/add-address" as any);
                }}
                className="flex-row items-center bg-[#FFF5EE] px-3 py-2 rounded-xl"
                style={{ borderWidth: 1, borderColor: "#FFE5D3" }}
              >
                <Plus color="#FF7622" size={14} />
                <Text className="text-primary font-sen-bold text-xs ml-1">
                  ADD NEW
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
          handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
        >
          <BottomSheetView
            style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 8 }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-lg font-sen-bold text-secondary">
                  Select Payment
                </Text>
                {paymentMethods.length > 0 && (
                  <View className="bg-[#F0F5FA] px-2.5 py-1 rounded-lg ml-2">
                    <Text className="text-text-gray font-sen-bold text-xs">
                      {paymentMethods.length}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  paymentSheetRef.current?.close();
                  router.push("/profile/add-card" as any);
                }}
                className="flex-row items-center bg-[#FFF5EE] px-3 py-2 rounded-xl"
                style={{ borderWidth: 1, borderColor: "#FFE5D3" }}
              >
                <Plus color="#FF7622" size={14} />
                <Text className="text-primary font-sen-bold text-xs ml-1">
                  ADD CARD
                </Text>
              </TouchableOpacity>
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
