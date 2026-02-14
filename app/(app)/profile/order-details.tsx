import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/useDataQueries";
import { useCancelOrder } from "@/hooks/useOrderMutations";
import { Order } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  Phone,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { data: orderData, isLoading } = useOrder(orderId);
  const cancelOrderMutation = useCancelOrder();

  const order = orderData?.data.order;

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

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
          Order Details
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: canCancel ? 100 : 24 }}
      >
        {/* Order Status Card */}
        <View className="mx-6 mt-6 mb-4">
          <View
            className={`rounded-xl p-4 border-2 ${getStatusColor(order.status)}`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-sen-extra-bold text-xl">
                {getStatusText(order.status)}
              </Text>
              {!isCancelled && !isDelivered && <Package size={24} />}
            </View>
            <Text className="font-sen text-sm opacity-80">
              {isCancelled
                ? "Your order has been cancelled"
                : isDelivered
                  ? "Your order has been delivered"
                  : "Your order is being processed"}
            </Text>
          </View>
        </View>

        {/* Order Progress - Only show if not cancelled or delivered */}
        {!isCancelled && !isDelivered && (
          <View className="mx-6 mb-6">
            <View className="bg-[#F0F5FA] rounded-xl p-4">
              <Text className="font-sen-bold text-secondary text-sm mb-4">
                ORDER PROGRESS
              </Text>
              <View className="space-y-3">
                {[
                  { status: "pending", label: "Order Placed" },
                  { status: "confirmed", label: "Order Confirmed" },
                  { status: "preparing", label: "Preparing Food" },
                  { status: "out_for_delivery", label: "Out for Delivery" },
                  { status: "delivered", label: "Delivered" },
                ].map((step, index) => {
                  const currentStep = getStatusStep(order.status);
                  const isCompleted = index + 1 <= currentStep;
                  const isCurrent = index + 1 === currentStep;

                  return (
                    <View key={step.status} className="flex-row items-center">
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center ${
                          isCompleted
                            ? "bg-primary"
                            : "bg-white border-2 border-[#E0E0E0]"
                        }`}
                      >
                        {isCompleted && (
                          <View className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </View>
                      <Text
                        className={`ml-3 font-sen ${
                          isCurrent
                            ? "font-sen-bold text-secondary"
                            : isCompleted
                              ? "text-secondary"
                              : "text-text-gray"
                        }`}
                      >
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Order Number */}
        <View className="mx-6 mb-6">
          <View className="bg-[#FFF5EE] rounded-xl p-4 border border-primary">
            <Text className="text-xs text-text-gray font-sen mb-1">
              ORDER NUMBER
            </Text>
            <Text className="font-sen-extra-bold text-primary text-lg">
              {order.orderNumber}
            </Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View className="mx-6 mb-6">
          <Text className="text-xs text-text-gray font-sen uppercase mb-3">
            RESTAURANT
          </Text>
          <View className="bg-[#F0F5FA] rounded-xl p-4 flex-row items-center">
            {order.restaurantId.images?.[0] && (
              <Image
                source={{ uri: order.restaurantId.images[0] }}
                className="w-12 h-12 rounded-lg mr-3"
              />
            )}
            <View className="flex-1">
              <Text className="font-sen-bold text-secondary text-base mb-1">
                {order.restaurantId.name}
              </Text>
              {order.restaurantId.address && (
                <Text className="font-sen text-text-gray text-xs">
                  {order.restaurantId.address}
                </Text>
              )}
            </View>
            {order.restaurantId.phone && (
              <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Phone color="#FF7622" size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Items */}
        <View className="mx-6 mb-6">
          <Text className="text-xs text-text-gray font-sen uppercase mb-3">
            ITEMS ({order.items.length})
          </Text>
          <View className="bg-[#F0F5FA] rounded-xl p-4">
            {order.items.map((item, index) => (
              <View key={item.foodItemId}>
                <View className="flex-row items-center mb-3">
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      className="w-16 h-16 rounded-lg mr-3"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="font-sen-bold text-secondary mb-1">
                      {item.name}
                    </Text>
                    <Text className="font-sen text-text-gray text-sm">
                      Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                    </Text>
                  </View>
                  <Text className="font-sen-bold text-secondary">
                    ₦{item.subtotal.toLocaleString()}
                  </Text>
                </View>
                {index < order.items.length - 1 && (
                  <View className="border-b border-[#E0E0E0] mb-3" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View className="mx-6 mb-6">
          <Text className="text-xs text-text-gray font-sen uppercase mb-3">
            DELIVERY ADDRESS
          </Text>
          <View className="bg-[#F0F5FA] rounded-xl p-4 flex-row">
            <MapPin color="#2D8EFF" size={20} />
            <View className="ml-3 flex-1">
              <Text className="font-sen-bold text-secondary mb-1">
                {order.deliveryAddress.street}
              </Text>
              <Text className="font-sen text-text-gray text-sm">
                {order.deliveryAddress.city}, {order.deliveryAddress.state}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View className="mx-6 mb-6">
          <Text className="text-xs text-text-gray font-sen uppercase mb-3">
            PAYMENT DETAILS
          </Text>
          <View className="bg-[#F0F5FA] rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <CreditCard color="#FF7622" size={20} />
              <View className="ml-3 flex-1">
                <Text className="font-sen-bold text-secondary">
                  {order.paymentMethod === "cash"
                    ? "Cash on Delivery"
                    : "Card Payment"}
                </Text>
                <Text className="font-sen text-text-gray text-xs">
                  Status: {order.paymentStatus}
                </Text>
              </View>
            </View>

            <View className="border-t border-[#E0E0E0] pt-3">
              <View className="flex-row justify-between mb-2">
                <Text className="font-sen text-text-gray">Subtotal</Text>
                <Text className="font-sen-bold text-secondary">
                  ₦{order.subtotal.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="font-sen text-text-gray">Delivery Fee</Text>
                <Text className="font-sen-bold text-secondary">
                  ₦{order.deliveryFee.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between pt-3 border-t border-[#E0E0E0]">
                <Text className="font-sen-bold text-secondary text-lg">
                  Total Paid
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
          <View className="mx-6 mb-6">
            <Text className="text-xs text-text-gray font-sen uppercase mb-3">
              DELIVERY INSTRUCTIONS
            </Text>
            <View className="bg-[#F0F5FA] rounded-xl p-4">
              <Text className="font-sen text-secondary">
                {order.customerNotes}
              </Text>
            </View>
          </View>
        )}

        {/* Order Date */}
        <View className="mx-6 mb-6">
          <View className="flex-row items-center">
            <Calendar color="#A0A5BA" size={16} />
            <Text className="font-sen text-text-gray text-sm ml-2">
              Ordered on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Cancel Order Button - Only show for pending orders */}
      {canCancel && (
        <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-[#F0F5FA]">
          <Button
            onPress={handleCancelOrder}
            disabled={cancelOrderMutation.isPending}
            className="h-[62px] bg-red-500"
          >
            {cancelOrderMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-sen-bold text-[15px] uppercase tracking-wider">
                CANCEL ORDER
              </Text>
            )}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
