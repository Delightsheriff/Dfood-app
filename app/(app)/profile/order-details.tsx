import { IconButton } from "@/components/ui/icon-button";
import { useOrder } from "@/hooks/useDataQueries";
import { useCancelOrder } from "@/hooks/useOrderMutations";
import { Order } from "@/types/api";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CreditCardIcon,
  Location01Icon,
  Money01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: orderData, isLoading } = useOrder(orderId);
  const cancelOrderMutation = useCancelOrder();

  const order = orderData?.data.order;

  const handleCancelOrder = () => {
    if (!order) return;
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No, Keep It", style: "cancel" },
        {
          text: "Yes, Cancel Order",
          style: "destructive",
          onPress: () => {
            cancelOrderMutation.mutate(order._id, {
              onSuccess: () => {
                Alert.alert("Cancelled", "Your order has been cancelled.");
              },
              onError: (err: any) => {
                Alert.alert(
                  "Error",
                  err.message || "Failed to cancel order.",
                );
              },
            });
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-text-gray font-sen text-base">
          Order not found
        </Text>
      </View>
    );
  }

  const isPending = order.status === "pending";

  const STEPS: { key: Order["status"]; label: string }[] = [
    { key: "pending", label: "Order Placed" },
    { key: "preparing", label: "Preparing" },
    { key: "out_for_delivery", label: "On the Way" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStepIdx =
    order.status === "cancelled"
      ? -1
      : STEPS.findIndex((s) => s.key === order.status);

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
        <View className="items-center flex-1 mx-3">
          <Text
            numberOfLines={1}
            className="text-[17px] font-sen-bold text-secondary"
          >
            Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
          </Text>
          <Text className="text-[11px] font-sen text-text-gray">
            {order.restaurantId.name}
          </Text>
        </View>
        <View className="w-11" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Status Timeline */}
        <View
          className="p-5 bg-surface-muted rounded-[20px] mb-4"
          style={{ borderCurve: "continuous" }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[15px] font-sen-bold text-secondary">
              Order Status
            </Text>
            <View
              className={`px-2.5 py-1 rounded-full ${
                order.status === "cancelled" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <Text
                className={`text-[11px] font-sen-bold uppercase ${
                  order.status === "cancelled"
                    ? "text-red-700"
                    : "text-green-700"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </Text>
            </View>
          </View>

          {/* Stepper bar */}
          {order.status !== "cancelled" ? (
            <View className="flex-row justify-between items-center px-1">
              {STEPS.map((step, idx) => {
                const isPassed = idx <= (currentStepIdx >= 0 ? currentStepIdx : 0);
                return (
                  <View key={step.key} className="items-center flex-1">
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center mb-1 ${
                        isPassed ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      {isPassed ? (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          size={14}
                          color="#FFFFFF"
                        />
                      ) : (
                        <View className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      className={`text-[10px] text-center ${
                        isPassed
                          ? "font-sen-bold text-secondary"
                          : "font-sen text-text-gray"
                      }`}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text className="text-xs font-sen text-red-600">
              This order was cancelled.
            </Text>
          )}
        </View>

        {/* Delivery Address */}
        <View
          className="p-4 bg-surface-muted rounded-[20px] mb-4 flex-row items-center"
          style={{ borderCurve: "continuous" }}
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
            <HugeiconsIcon icon={Location01Icon} size={20} color={ACCENT} />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-sen-bold text-secondary">
              Delivery Address
            </Text>
            <Text className="text-xs font-sen text-text-gray mt-0.5">
              {order.deliveryAddress.street}, {order.deliveryAddress.city}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View
          className="p-4 bg-surface-muted rounded-[20px] mb-4 flex-row items-center"
          style={{ borderCurve: "continuous" }}
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
            <HugeiconsIcon
              icon={order.paymentMethod === "card" ? CreditCardIcon : Money01Icon}
              size={20}
              color={ACCENT}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-sen-bold text-secondary">
              Payment Method
            </Text>
            <Text className="text-xs font-sen text-text-gray mt-0.5">
              {order.paymentMethod === "card" ? "Credit/Debit Card" : "Cash on Delivery"}
            </Text>
          </View>
        </View>

        {/* Items List */}
        <View
          className="p-5 bg-surface-muted rounded-[20px] mb-6"
          style={{ borderCurve: "continuous" }}
        >
          <Text className="text-[15px] font-sen-bold text-secondary mb-3">
            Order Items ({order.items.length})
          </Text>

          <View className="gap-3 mb-3">
            {order.items.map((item, idx) => (
              <View
                key={idx}
                className="flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: 36, height: 36, borderRadius: 8, marginRight: 10 }}
                      contentFit="cover"
                    />
                  ) : null}
                  <Text
                    numberOfLines={1}
                    className="text-xs font-sen text-secondary flex-1"
                  >
                    {item.quantity}x {item.name}
                  </Text>
                </View>
                <Text className="text-xs font-sen-bold text-secondary">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          <View className="h-[1px] bg-gray-200 my-2" />

          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sen text-text-gray">Subtotal</Text>
              <Text className="text-xs font-sen-bold text-secondary">
                ₦{order.subtotal.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sen text-text-gray">Delivery Fee</Text>
              <Text className="text-xs font-sen-bold text-secondary">
                {order.deliveryFee === 0
                  ? "Free"
                  : `₦${order.deliveryFee.toLocaleString()}`}
              </Text>
            </View>
            <View className="flex-row justify-between items-center pt-1">
              <Text className="text-sm font-sen-bold text-secondary">Total</Text>
              <Text className="text-base font-sen-extra-bold text-secondary">
                ₦{order.total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Cancel Action for Pending Orders */}
        {isPending && (
          <Pressable
            onPress={handleCancelOrder}
            disabled={cancelOrderMutation.isPending}
            className="w-full h-12 rounded-full border border-red-500 items-center justify-center bg-red-50"
          >
            {cancelOrderMutation.isPending ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Text className="text-red-600 font-sen-bold text-xs uppercase tracking-wider">
                Cancel Order
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
