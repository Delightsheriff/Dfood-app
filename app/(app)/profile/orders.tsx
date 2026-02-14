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
  TouchableOpacity,
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
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    return status.replace(/_/g, " ").toUpperCase();
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/profile/order-details" as any,
          params: { orderId: order._id },
        })
      }
      className="bg-white rounded-xl p-4 mb-4 border border-[#EDEDED]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-sen-bold text-secondary text-base mb-1">
            {order.restaurantId.name}
          </Text>
          <Text className="font-sen text-text-gray text-xs">
            {order.orderNumber}
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
        >
          <Text className="font-sen-bold text-xs">
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View className="mb-3">
        <Text className="font-sen text-text-gray text-sm">
          {order.items.length} {order.items.length === 1 ? "item" : "items"} • ₦
          {order.total.toLocaleString()}
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
    </TouchableOpacity>
  );

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
          My Orders
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Package color="#A0A5BA" size={64} />
          <Text className="text-xl font-sen-bold text-secondary mt-4 mb-2">
            No Orders Yet
          </Text>
          <Text className="text-text-gray font-sen text-sm text-center mb-6">
            Your order history will appear here
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)")}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-sen-bold uppercase">
              START ORDERING
            </Text>
          </TouchableOpacity>
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
