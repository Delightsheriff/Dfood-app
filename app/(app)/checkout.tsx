import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddresses,
  useDefaultAddress,
  useDefaultPaymentMethod,
  usePaymentMethods,
} from "@/hooks/useDataQueries";
import { useCreateOrder } from "@/hooks/useOrderMutations";
import { useCartStore } from "@/store/cartStore";
import { Address, PaymentMethod } from "@/types/api";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [customerNotes, setCustomerNotes] = useState("");

  const addressSheetRef = useRef<BottomSheet>(null);
  const paymentSheetRef = useRef<BottomSheet>(null);

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
  const restaurantId = items.length > 0 ? items[0].restaurantId : "";
  const restaurantName = items.length > 0 ? items[0].restaurantName : "";
  const subtotal = getTotalPrice;
  const deliveryFee = 500; // Fixed for now, should come from restaurant
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

    createOrderMutation.mutate(
      {
        restaurantId,
        items: items.map((item) => ({
          foodItemId: item.foodItem._id,
          quantity: item.quantity,
        })),
        addressId: selectedAddress._id,
        paymentMethodId: selectedPaymentMethod._id,
        customerNotes: customerNotes || undefined,
      },
      {
        onSuccess: (response) => {
          clearCart();
          router.replace({
            pathname: "/(app)/order-confirmation" as any,
            params: { orderId: response.data.order._id },
          });
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message ||
            "Failed to place order. Please try again.";
          Alert.alert("Order Failed", message);
        },
      },
    );
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#F0F5FA]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#ECF0F4] rounded-full items-center justify-center mr-3"
        >
          <ChevronLeft color="#181C2E" size={22} />
        </TouchableOpacity>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          Checkout
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
      >
        {/* Restaurant Info */}
        <View className="mt-6 mb-6">
          <Text className="text-xs text-text-gray font-sen uppercase mb-2">
            ORDERING FROM
          </Text>
          <View className="bg-[#F0F5FA] rounded-xl p-4">
            <Text className="font-sen-bold text-secondary text-base">
              {restaurantName}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs text-text-gray font-sen uppercase">
              DELIVERY ADDRESS
            </Text>
            {addresses.length === 0 && (
              <TouchableOpacity
                onPress={() => router.push("/profile/add-address" as any)}
              >
                <Text className="text-primary font-sen-bold text-sm">
                  ADD ADDRESS
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedAddress ? (
            <TouchableOpacity
              onPress={() => addressSheetRef.current?.expand()}
              className="bg-[#F0F5FA] rounded-xl p-4 flex-row items-center"
            >
              <MapPin color="#2D8EFF" size={20} />
              <View className="flex-1 ml-3">
                <Text className="font-sen-bold text-secondary text-sm">
                  {selectedAddress.label}
                </Text>
                <Text className="font-sen text-text-gray text-xs">
                  {selectedAddress.street}, {selectedAddress.city}
                </Text>
              </View>
              <ChevronRight color="#181C2E" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/profile/add-address" as any)}
              className="bg-[#FFF5EE] rounded-xl p-4 border-2 border-dashed border-primary"
            >
              <Text className="text-primary font-sen-bold text-center">
                + Add Delivery Address
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Method */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs text-text-gray font-sen uppercase">
              PAYMENT METHOD
            </Text>
            {paymentMethods.length === 1 && (
              <TouchableOpacity
                onPress={() => router.push("/profile/add-card" as any)}
              >
                <Text className="text-primary font-sen-bold text-sm">
                  ADD CARD
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedPaymentMethod ? (
            <TouchableOpacity
              onPress={() => paymentSheetRef.current?.expand()}
              className="bg-[#F0F5FA] rounded-xl p-4 flex-row items-center"
            >
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                {selectedPaymentMethod.type === "cash" ? (
                  <Banknote color="#2D8EFF" size={20} />
                ) : (
                  <CreditCard color="#FF7622" size={20} />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-sen-bold text-secondary text-sm">
                  {selectedPaymentMethod.type === "cash"
                    ? "Cash on Delivery"
                    : `${selectedPaymentMethod.cardBrand} •••• ${selectedPaymentMethod.cardLast4}`}
                </Text>
              </View>
              <ChevronRight color="#181C2E" size={20} />
            </TouchableOpacity>
          ) : null}
        </View>

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

        {/* Order Summary */}
        <View className="mb-6">
          <Text className="text-xs text-text-gray font-sen uppercase mb-3">
            ORDER SUMMARY
          </Text>
          <View className="bg-[#F0F5FA] rounded-xl p-4">
            {items.map((item) => (
              <View
                key={item.foodItem._id}
                className="flex-row justify-between mb-3"
              >
                <Text className="font-sen text-secondary flex-1">
                  {item.quantity}x {item.foodItem.name}
                </Text>
                <Text className="font-sen-bold text-secondary">
                  ₦{(item.foodItem.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}

            <View className="border-t border-[#E0E0E0] pt-3 mt-3">
              <View className="flex-row justify-between mb-2">
                <Text className="font-sen text-text-gray">Subtotal</Text>
                <Text className="font-sen-bold text-secondary">
                  ₦{subtotal.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="font-sen text-text-gray">Delivery Fee</Text>
                <Text className="font-sen-bold text-secondary">
                  ₦{deliveryFee.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between pt-3 border-t border-[#E0E0E0]">
                <Text className="font-sen-bold text-secondary text-lg">
                  Total
                </Text>
                <Text className="font-sen-extra-bold text-primary text-xl">
                  ₦{total.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="px-6 py-4 border-t border-[#F0F5FA] bg-white">
        <Button
          onPress={handlePlaceOrder}
          disabled={
            !selectedAddress ||
            !selectedPaymentMethod ||
            createOrderMutation.isPending
          }
          className="h-[62px] bg-primary"
        >
          {createOrderMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-sen-bold text-[15px] uppercase tracking-wider">
              PLACE ORDER • ₦{total.toLocaleString()}
            </Text>
          )}
        </Button>
      </View>

      {/* Address Selection Bottom Sheet */}
      <BottomSheet
        ref={addressSheetRef}
        index={-1}
        snapPoints={["70%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <View className="flex-1 px-6">
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
        </View>
      </BottomSheet>

      {/* Payment Method Selection Bottom Sheet */}
      <BottomSheet
        ref={paymentSheetRef}
        index={-1}
        snapPoints={["50%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <View className="flex-1 px-6">
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
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
