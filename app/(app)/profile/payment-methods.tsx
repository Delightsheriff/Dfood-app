import { IconButton } from "@/components/ui/icon-button";
import { useProgressiveBlurScroll } from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
import { usePaymentMethods } from "@/hooks/useDataQueries";
import {
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/hooks/usePaymentMethodMutations";
import { PaymentMethod } from "@/types/api";
import {
  CreditCardIcon,
  Delete02Icon,
  Money01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function PaymentMethods() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll } = useProgressiveBlurScroll();
  const { data: paymentMethodsData, isLoading } = usePaymentMethods();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const setDefaultMutation = useSetDefaultPaymentMethod();

  const paymentMethods = paymentMethodsData?.data.paymentMethods || [];

  const handleDelete = (paymentMethod: PaymentMethod) => {
    if (paymentMethod.type === "cash") {
      Alert.alert("Info", "Cannot remove the cash on delivery option.");
      return;
    }

    Alert.alert(
      "Delete Card",
      `Are you sure you want to remove card ending in ${paymentMethod.cardLast4}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePaymentMethodMutation.mutate(paymentMethod._id);
          },
        },
      ],
    );
  };

  const handleSetDefault = (paymentMethod: PaymentMethod) => {
    if (paymentMethod.isDefault) return;
    setDefaultMutation.mutate(paymentMethod._id);
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        variant="detail"
        title="Payment Methods"
        scrollY={scrollY}
        alwaysShowTitle
        rightElement={
          <IconButton
            icon={PlusSignIcon}
            accessibilityLabel="Add new card"
            onPress={() => router.push("/profile/add-card" as any)}
          />
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: insets.top + 56,
            paddingBottom: insets.bottom + 40,
          }}
        >
          {paymentMethods.map((pm) => {
            const isCash = pm.type === "cash";
            return (
              <View
                key={pm._id}
                className={`p-4 rounded-[20px] mb-3.5 border ${
                  pm.isDefault
                    ? "bg-[#FFF5F3] border-primary"
                    : "bg-surface-muted border-transparent"
                }`}
                style={{ borderCurve: "continuous" }}
              >
                <View className="flex-row items-center justify-between">
                  <Pressable
                    onPress={() => handleSetDefault(pm)}
                    className="flex-row items-center flex-1 mr-2"
                  >
                    <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                      <HugeiconsIcon
                        icon={isCash ? Money01Icon : CreditCardIcon}
                        size={20}
                        color={ACCENT}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-0.5">
                        <Text className="text-[15px] font-title text-secondary">
                          {isCash
                            ? "Cash on Delivery"
                            : `${pm.cardBrand || "Card"} •••• ${pm.cardLast4 || "4242"}`}
                        </Text>
                        {pm.isDefault && (
                          <View className="bg-primary px-2 py-0.5 rounded-md">
                            <Text className="text-white text-[9px] font-caption">
                              DEFAULT
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs font-body text-text-gray">
                        {isCash
                          ? "Pay directly when your order arrives"
                          : `${pm.bank || "Mock Bank"} • Expires ${pm.cardExpMonth}/${pm.cardExpYear}`}
                      </Text>
                    </View>
                  </Pressable>

                  {!isCash && (
                    <Pressable
                      onPress={() => handleDelete(pm)}
                      className="w-8 h-8 rounded-full bg-white items-center justify-center ml-2"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={15}
                        color="#EF4444"
                      />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </Animated.ScrollView>
      )}
    </View>
  );
}
