import { ScreenHeader } from "@/components/ui/screen-header";
import {
  useProgressiveBlurHeaderHeight,
  useProgressiveBlurScroll,
} from "@/components/ui/progressive-blur";
import { useOrders } from "@/hooks/useDataQueries";
import { Order } from "@/types/api";
import {
  ArrowRight01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function Orders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: ordersData, isLoading, refetch } = useOrders();
  const { scrollY, onScroll } = useProgressiveBlurScroll();
  const headerHeight = useProgressiveBlurHeaderHeight(58);

  const orders = ordersData?.data.orders || [];

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
      case "preparing":
      case "confirmed":
        return {
          bg: "#FFF5F3",
          text: "#E0533A",
          label: status.toUpperCase(),
        };
      case "out_for_delivery":
        return {
          bg: "#EEF4FF",
          text: "#2D8EFF",
          label: "ON THE WAY",
        };
      case "delivered":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          label: "DELIVERED",
        };
      case "cancelled":
        return {
          bg: "#F3F4F6",
          text: "#6B7280",
          label: "CANCELLED",
        };
      default:
        return {
          bg: "#F3F4F6",
          text: "#374151",
          label: String(status).toUpperCase(),
        };
    }
  };

  return (
    <View className="flex-1 bg-white">
      {isLoading && !ordersData ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : orders.length === 0 ? (
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ paddingTop: headerHeight }}
        >
          <View className="w-20 h-20 rounded-full bg-surface-muted items-center justify-center mb-4">
            <HugeiconsIcon
              icon={ShoppingBag01Icon}
              size={36}
              color="#646982"
            />
          </View>
          <Text className="text-xl font-title text-secondary mb-1">
            No Orders Yet
          </Text>
          <Text className="text-xs font-body text-text-gray text-center max-w-[260px] mb-6">
            When you place an order, it will appear here with live tracking.
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/(tabs)" as any)}
            className="px-8 py-3.5 rounded-full bg-secondary"
            style={{ borderCurve: "continuous" }}
          >
            <Text className="text-white font-label text-sm">
              Start Ordering
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={orders}
          keyExtractor={(item) => item._id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: headerHeight + 12,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
          }}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(app)/profile/order-details" as any,
                    params: { orderId: item._id },
                  })
                }
                className="p-4 bg-white border border-gray-100 rounded-[20px] mb-3.5"
                style={{
                  borderCurve: "continuous",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {/* Header row */}
                <View className="flex-row items-center justify-between mb-2.5">
                  <Text
                    numberOfLines={1}
                    className="text-[16px] font-title text-secondary flex-1 mr-2"
                  >
                    {item.restaurantId.name}
                  </Text>
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: badge.bg }}
                  >
                    <Text
                      className="text-[10px] font-caption uppercase tracking-wider"
                      style={{ color: badge.text }}
                    >
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Items preview */}
                <Text
                  numberOfLines={1}
                  className="text-xs font-body text-text-gray mb-3"
                >
                  {item.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </Text>

                {/* Footer details */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <View>
                    <Text className="text-[10px] font-caption uppercase tracking-wider text-text-gray">
                      Total
                    </Text>
                    <Text className="text-[15px] font-numeric text-secondary mt-0.5">
                      ₦{item.total.toLocaleString()}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Text className="text-xs font-numeric text-text-gray">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      color="#646982"
                    />
                  </View>
                </View>
              </Pressable>
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={ACCENT}
            />
          }
        />
      )}

      {/* Large Header with Progressive Blur (rendered after scroll for native sampling) */}
      <ScreenHeader
        variant="large"
        scrollY={scrollY}
        barHeight={58}
        title="My Orders"
        subtitle={`${orders.length} ${orders.length === 1 ? "order" : "orders"} placed`}
        rightElement={
          orders.length > 0 ? (
            <View className="bg-surface-muted px-3 py-1 rounded-full">
              <Text className="text-xs font-numeric text-secondary">
                {orders.length} Total
              </Text>
            </View>
          ) : undefined
        }
      />
    </View>
  );
}
