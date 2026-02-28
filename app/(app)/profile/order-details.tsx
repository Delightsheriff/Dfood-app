import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/useDataQueries";
import { useCancelOrder } from "@/hooks/useOrderMutations";
import { Order } from "@/types/api";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  Check,
  ChevronLeft,
  CreditCard,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Truck,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "#EAB308",
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "#3B82F6",
  },
  preparing: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "#3B82F6",
  },
  out_for_delivery: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "#8B5CF6",
  },
  delivered: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "#22C55E",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "#EF4444",
  },
};

const PROGRESS_STEPS = [
  { status: "pending", label: "Order Placed", icon: Package },
  { status: "confirmed", label: "Confirmed", icon: Check },
  { status: "preparing", label: "Preparing", icon: Package },
  { status: "out_for_delivery", label: "On the Way", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Check },
];

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { data: orderData, isLoading } = useOrder(orderId);
  const cancelOrderMutation = useCancelOrder();

  const order = orderData?.data.order;

  const getStatusStep = (status: Order["status"]) => {
    const steps = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
    ];
    return steps.indexOf(status) + 1;
  };

  const handleCancelOrder = () => {
    if (!order) return;

    if (order.status !== "pending") {
      Alert.alert(
        "Cannot Cancel",
        "Only pending orders can be cancelled. Please contact support for assistance.",
      );
      return;
    }

    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => {
          cancelOrderMutation.mutate(order._id, {
            onSuccess: () => {
              Alert.alert("Success", "Order cancelled successfully", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            },
            onError: (error: any) => {
              const message =
                error.response?.data?.message ||
                "Failed to cancel order. Please try again.";
              Alert.alert("Error", message);
            },
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-gray font-sen text-base text-center">
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = order.status === "pending";
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStep = getStatusStep(order.status);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#F0F5FA] rounded-full items-center justify-center mr-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <ChevronLeft color="#181C2E" size={22} />
        </Pressable>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          Order Details
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: canCancel ? 120 : 32 }}
      >
        {/* Status Card */}
        <View className="mx-6 mt-2 mb-5">
          <View
            className={`rounded-2xl p-5 border ${statusConfig.bg} ${statusConfig.border}`}
            style={{
              shadowColor: statusConfig.dot,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: statusConfig.dot }}
                />
                <Text
                  className={`font-sen-extra-bold text-lg ${statusConfig.text}`}
                >
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </Text>
              </View>
              {!isCancelled && !isDelivered && (
                <View className="w-9 h-9 bg-white rounded-xl items-center justify-center">
                  <Package color={statusConfig.dot} size={18} />
                </View>
              )}
            </View>
            <Text
              className={`font-sen text-sm ${statusConfig.text} opacity-70`}
            >
              {isCancelled
                ? "Your order has been cancelled"
                : isDelivered
                  ? "Your order has been delivered successfully"
                  : "Your order is being processed"}
            </Text>
          </View>
        </View>

        {/* Order Progress */}
        {!isCancelled && !isDelivered && (
          <View className="mx-6 mb-5">
            <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
              ORDER PROGRESS
            </Text>
            <View
              className="bg-[#F0F5FA] rounded-2xl p-5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              {PROGRESS_STEPS.map((step, index) => {
                const isCompleted = index + 1 <= currentStep;
                const isCurrent = index + 1 === currentStep;
                const isLast = index === PROGRESS_STEPS.length - 1;
                const IconComponent = step.icon;

                return (
                  <View key={step.status}>
                    <View className="flex-row items-center">
                      <View
                        className={`w-8 h-8 rounded-xl items-center justify-center ${
                          isCompleted
                            ? "bg-primary"
                            : "bg-white border border-[#D9DEE5]"
                        }`}
                      >
                        <IconComponent
                          color={isCompleted ? "#FFFFFF" : "#D9DEE5"}
                          size={14}
                        />
                      </View>
                      <Text
                        className={`ml-3 text-sm ${
                          isCurrent
                            ? "font-sen-bold text-secondary"
                            : isCompleted
                              ? "font-sen text-secondary"
                              : "font-sen text-text-gray"
                        }`}
                      >
                        {step.label}
                      </Text>
                      {isCurrent && (
                        <View className="ml-auto bg-primary px-2.5 py-1 rounded-full">
                          <Text className="text-white text-[10px] font-sen-bold">
                            NOW
                          </Text>
                        </View>
                      )}
                    </View>
                    {!isLast && (
                      <View
                        className={`w-0.5 h-5 ml-[15px] my-1 rounded-full ${
                          index + 1 < currentStep
                            ? "bg-primary"
                            : "bg-[#D9DEE5]"
                        }`}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Order Number */}
        <View className="mx-6 mb-5">
          <View
            className="rounded-2xl px-5 py-4 flex-row items-center justify-between"
            style={{
              backgroundColor: "#FFF5EE",
              borderWidth: 1.5,
              borderColor: "#FFD4B8",
            }}
          >
            <View>
              <Text className="text-[10px] text-text-gray font-sen uppercase tracking-widest mb-0.5">
                ORDER NUMBER
              </Text>
              <Text className="font-sen-extra-bold text-primary text-lg tracking-wider">
                {order.orderNumber}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Calendar color="#A0A5BA" size={13} />
              <Text className="font-sen text-text-gray text-[11px] ml-1.5">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Restaurant */}
        <View className="mx-6 mb-5">
          <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
            RESTAURANT
          </Text>
          <View
            className="bg-[#F0F5FA] rounded-2xl p-4 flex-row items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            {order.restaurantId.images?.[0] ? (
              <Image
                source={{ uri: order.restaurantId.images[0] }}
                className="w-12 h-12 rounded-xl mr-3"
                contentFit="cover"
              />
            ) : (
              <View className="w-12 h-12 bg-white rounded-xl items-center justify-center mr-3">
                <Package color="#FF7622" size={22} />
              </View>
            )}
            <View className="flex-1">
              <Text className="font-sen-bold text-secondary text-base mb-0.5">
                {order.restaurantId.name}
              </Text>
              {order.restaurantId.address && (
                <Text
                  className="font-sen text-text-gray text-xs"
                  numberOfLines={1}
                >
                  {order.restaurantId.address}
                </Text>
              )}
            </View>
            {order.restaurantId.phone && (
              <Pressable
                className="w-10 h-10 bg-white rounded-xl items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Phone color="#FF7622" size={18} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Items */}
        <View className="mx-6 mb-5">
          <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
            ITEMS ({order.items.length})
          </Text>
          <View
            className="bg-[#F0F5FA] rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            {order.items.map((item, index) => (
              <View
                key={item.foodItemId}
                className={`flex-row items-center py-3 ${
                  index < order.items.length - 1
                    ? "border-b border-[#E8ECF0]"
                    : ""
                }`}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    className="w-14 h-14 rounded-xl mr-3"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-14 h-14 bg-white rounded-xl items-center justify-center mr-3">
                    <Package color="#D9DEE5" size={20} />
                  </View>
                )}
                <View className="flex-1 mr-2">
                  <Text
                    className="font-sen-bold text-secondary text-sm mb-1"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <View className="flex-row items-center">
                    <View className="bg-white px-2 py-0.5 rounded-md mr-2">
                      <Text className="text-[11px] font-sen-bold text-primary">
                        x{item.quantity}
                      </Text>
                    </View>
                    <Text className="font-sen text-text-gray text-xs">
                      ₦{item.price.toLocaleString()} each
                    </Text>
                  </View>
                </View>
                <Text className="font-sen-bold text-secondary text-sm">
                  ₦{item.subtotal.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View className="mx-6 mb-5">
          <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
            DELIVERY ADDRESS
          </Text>
          <View
            className="bg-[#F0F5FA] rounded-2xl p-4 flex-row items-start"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3">
              <MapPin color="#2D8EFF" size={20} />
            </View>
            <View className="flex-1">
              <Text className="font-sen-bold text-secondary text-sm mb-0.5">
                {order.deliveryAddress.street}
              </Text>
              <Text className="font-sen text-text-gray text-xs">
                {order.deliveryAddress.city}, {order.deliveryAddress.state}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment & Totals */}
        <View className="mx-6 mb-5">
          <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
            PAYMENT
          </Text>
          <View
            className="bg-[#F0F5FA] rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3">
                <CreditCard color="#646982" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-sen-bold text-secondary text-sm">
                  {order.paymentMethod === "cash"
                    ? "Cash on Delivery"
                    : "Card Payment"}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  order.paymentStatus === "paid"
                    ? "bg-green-100"
                    : "bg-yellow-100"
                }`}
              >
                <Text
                  className={`text-[10px] font-sen-bold uppercase ${
                    order.paymentStatus === "paid"
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </Text>
              </View>
            </View>

            <View className="border-t border-[#D9DEE5] pt-4">
              <View className="flex-row justify-between mb-2.5">
                <Text className="font-sen text-text-gray text-sm">
                  Subtotal
                </Text>
                <Text className="font-sen-bold text-secondary text-sm">
                  ₦{order.subtotal.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <Truck color="#646982" size={14} />
                  <Text className="font-sen text-text-gray text-sm ml-1.5">
                    Delivery
                  </Text>
                </View>
                <Text className="font-sen-bold text-secondary text-sm">
                  ₦{order.deliveryFee.toLocaleString()}
                </Text>
              </View>
              <View className="bg-white rounded-xl p-3 flex-row justify-between items-center">
                <Text className="font-sen-bold text-secondary text-base">
                  Total
                </Text>
                <Text className="font-sen-extra-bold text-primary text-xl">
                  ₦{order.total.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Notes */}
        {order.customerNotes && (
          <View className="mx-6 mb-5">
            <Text className="text-xs text-text-gray font-sen uppercase mb-2 tracking-wide">
              DELIVERY INSTRUCTIONS
            </Text>
            <View
              className="bg-[#F0F5FA] rounded-2xl p-4 flex-row items-start"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3">
                <MessageSquare color="#646982" size={18} />
              </View>
              <Text className="font-sen text-secondary text-sm flex-1 leading-5">
                {order.customerNotes}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Cancel Order Button */}
      {canCancel && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-4 pb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Button
            onPress={handleCancelOrder}
            disabled={cancelOrderMutation.isPending}
            className="h-[56px] bg-red-500"
          >
            {cancelOrderMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-sen-bold text-[14px] uppercase tracking-wider">
                CANCEL ORDER
              </Text>
            )}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
