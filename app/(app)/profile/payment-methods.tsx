import { usePaymentMethods } from "@/hooks/useDataQueries";
import {
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/hooks/usePaymentMethodMutations";
import { PaymentMethod } from "@/types/api";
import { useRouter } from "expo-router";
import {
  Banknote,
  ChevronLeft,
  CreditCard,
  Plus,
  Trash2,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentMethods() {
  const router = useRouter();
  const { data: paymentMethodsData, isLoading } = usePaymentMethods();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const setDefaultMutation = useSetDefaultPaymentMethod();

  const paymentMethods = paymentMethodsData?.data.paymentMethods || [];

  const handleDelete = (paymentMethod: PaymentMethod) => {
    if (paymentMethod.type === "cash") {
      Alert.alert("Error", "Cannot delete cash payment option");
      return;
    }

    Alert.alert(
      "Delete Card",
      `Are you sure you want to delete card ending in ${paymentMethod.cardLast4}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePaymentMethodMutation.mutate(paymentMethod._id, {
              onSuccess: () => {
                Alert.alert("Success", "Card deleted successfully");
              },
              onError: (error: any) => {
                const message =
                  error.response?.data?.message || "Failed to delete card";
                Alert.alert("Error", message);
              },
            });
          },
        },
      ],
    );
  };

  const handleSetDefault = (paymentMethod: PaymentMethod) => {
    if (paymentMethod.isDefault) return;
    if (paymentMethod.type === "cash") {
      Alert.alert("Info", "Cash is automatically default when no cards exist");
      return;
    }

    setDefaultMutation.mutate(paymentMethod._id, {
      onSuccess: () => {
        Alert.alert("Success", "Default payment method updated");
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          "Failed to set default payment method";
        Alert.alert("Error", message);
      },
    });
  };

  const PaymentMethodItem = ({
    paymentMethod,
  }: {
    paymentMethod: PaymentMethod;
  }) => {
    const isCash = paymentMethod.type === "cash";

    return (
      <TouchableOpacity
        onPress={() => handleSetDefault(paymentMethod)}
        onLongPress={() => handleSetDefault(paymentMethod)}
        className={`rounded-[16px] p-4 mb-4 flex-row items-center ${
          paymentMethod.isDefault
            ? "bg-[#FFF5EE] border-2 border-primary"
            : "bg-[#F0F5FA]"
        }`}
      >
        <View className="w-[40px] h-[40px] bg-white rounded-full items-center justify-center mr-4">
          {isCash ? (
            <Banknote color="#2D8EFF" size={20} />
          ) : (
            <CreditCard color="#FF7622" size={20} />
          )}
        </View>

        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-[14px] font-sen-bold text-[#181C2E] uppercase mr-2">
              {isCash
                ? "CASH ON DELIVERY"
                : `${paymentMethod.cardBrand} •••• ${paymentMethod.cardLast4}`}
            </Text>
            {paymentMethod.isDefault && (
              <View className="bg-primary px-2 py-0.5 rounded-full">
                <Text className="text-white text-[10px] font-sen-bold">
                  DEFAULT
                </Text>
              </View>
            )}
          </View>
          {!isCash && (
            <Text className="text-[13px] font-sen text-[#A0A5BA]">
              {paymentMethod.bank} • Expires {paymentMethod.cardExpMonth}/
              {paymentMethod.cardExpYear}
            </Text>
          )}
        </View>

        {!isCash && (
          <TouchableOpacity
            onPress={() => handleDelete(paymentMethod)}
            disabled={deletePaymentMethodMutation.isPending}
          >
            {deletePaymentMethodMutation.isPending ? (
              <ActivityIndicator size="small" color="#FF7622" />
            ) : (
              <Trash2 color="#FF7622" size={20} />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-2">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-[45px] h-[45px] bg-[#ECF0F4] rounded-full items-center justify-center"
        >
          <ChevronLeft color="#181C2E" size={24} />
        </TouchableOpacity>
        <Text className="text-[17px] font-sen-bold text-[#181C2E]">
          Payment Methods
        </Text>
        <View className="w-[45px]" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Text className="text-text-gray font-sen text-sm mb-4">
            Tap to set as default • Cards can be deleted
          </Text>
          {paymentMethods.map((paymentMethod) => (
            <PaymentMethodItem
              key={paymentMethod._id}
              paymentMethod={paymentMethod}
            />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => router.push("/profile/add-card" as any)}
        className="w-full bg-primary h-[62px] rounded-[12px] items-center justify-center mb-6 flex-row gap-2"
      >
        <Plus color="white" size={20} />
        <Text className="text-white font-sen-bold text-[14px] uppercase tracking-wider">
          ADD CARD
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
