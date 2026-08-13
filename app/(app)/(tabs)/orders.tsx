import { useOrders } from "@/hooks/useDataQueries";
import { Order } from "@/types/api";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Package } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Orders() {
  const router = useRouter();
  const { data: ordersData, isLoading, refetch } = useOrders();

  const orders = ordersData?.data.orders || [];

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A" };
      case "confirmed":
      case "preparing":
        return { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" };
      case "out_for_delivery":
        return { bg: "#F3E8FF", text: "#6B21A8", border: "#E9D5FF" };
      case "delivered":
        return { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
      default:
        return { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
    }
  };

  const getStatusText = (status: Order["status"]) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const statusColors = getStatusColor(order.status);

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/profile/order-details" as any,
            params: { orderId: order._id },
          })
        }
        className="bg-white rounded-2xl p-4 mb-4"
        style={{
          borderWidth: 1,
          borderColor: "#F0F0F0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        }}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="font-sen-bold text-secondary text-base mb-1">
              {order.restaurantId.name}
            </Text>
            <Text className="font-sen text-text-gray text-xs">
              {order.orderNumber}
            </Text>
          </View>
          <View
            className="px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: statusColors.bg,
              borderWidth: 1,
              borderColor: statusColors.border,
            }}
          >
            <Text
              className="font-sen-bold text-[10px]"
              style={{ color: statusColors.text }}
            >
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>

        {/* Items Summary */}
        <View className="flex-row items-center mb-3">
          <View className="w-6 h-6 bg-[#F0F5FA] rounded-lg items-center justify-center mr-2">
            <Package color="#A0A5BA" size={12} />
          </View>
          <Text className="font-sen text-text-gray text-sm">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </Text>
          <View className="w-1 h-1 bg-[#A0A5BA] rounded-full mx-2" />
          <Text className="font-sen-bold text-primary text-sm">
            ₦{order.total.toLocaleString()}
          </Text>
        </View>

        {/* Date */}
        <View className="flex-row justify-between items-center pt-3 border-t border-[#F0F5FA]">
          <Text className="font-sen text-text-gray text-xs">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <ChevronRight color="#A0A5BA" size={16} />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 bg-[#F0F5FA] rounded-2xl items-center justify-center mr-3"
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
          My Orders
        </Text>
        {orders.length > 0 && (
          <View className="bg-[#F0F5FA] px-3 py-1.5 rounded-lg">
            <Text className="text-text-gray font-sen text-xs">
              {orders.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-[#F0F5FA] rounded-3xl items-center justify-center mb-5">
            <Package color="#A0A5BA" size={32} />
          </View>
          <Text className="text-base font-sen-bold text-secondary mb-2">
            No Orders Yet
          </Text>
          <Text className="text-text-gray font-sen text-sm text-center mb-6">
            Your order history will appear here
          </Text>
          <Pressable
            onPress={() => router.push("/(app)")}
            className="bg-primary px-8 py-3.5 rounded-2xl"
            style={{
              shadowColor: "#FF7622",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text className="text-white font-sen-bold text-sm uppercase tracking-wider">
              START ORDERING
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor="#FF7622"
            />
          }
        >
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
