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
        className={`rounded-2xl p-4 mb-3 flex-row items-center ${
          paymentMethod.isDefault ? "bg-[#FFF5EE]" : "bg-[#F6F8FA]"
        }`}
        style={{
          borderWidth: paymentMethod.isDefault ? 1.5 : 1,
          borderColor: paymentMethod.isDefault ? "#FF7622" : "#F0F0F0",
          shadowColor: paymentMethod.isDefault ? "#FF7622" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: paymentMethod.isDefault ? 0.1 : 0.04,
          shadowRadius: 6,
          elevation: paymentMethod.isDefault ? 3 : 1,
        }}
        activeOpacity={0.7}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
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

        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-sm font-sen-bold text-secondary mr-2">
              {isCash
                ? "Cash on Delivery"
                : `${paymentMethod.cardBrand} •••• ${paymentMethod.cardLast4}`}
            </Text>
            {paymentMethod.isDefault && (
              <View className="bg-primary px-2 py-0.5 rounded-lg">
                <Text className="text-white text-[10px] font-sen-bold">
                  DEFAULT
                </Text>
              </View>
            )}
          </View>
          {!isCash && (
            <Text className="text-xs font-sen text-text-gray">
              {paymentMethod.bank} • Expires {paymentMethod.cardExpMonth}/
              {paymentMethod.cardExpYear}
            </Text>
          )}
        </View>

        {!isCash && (
          <TouchableOpacity
            onPress={() => handleDelete(paymentMethod)}
            disabled={deletePaymentMethodMutation.isPending}
            className="w-9 h-9 bg-white rounded-xl items-center justify-center"
          >
            {deletePaymentMethodMutation.isPending ? (
              <ActivityIndicator size="small" color="#FF4B4B" />
            ) : (
              <Trash2 color="#FF4B4B" size={16} />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
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
        </TouchableOpacity>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          Payment Methods
        </Text>
        {paymentMethods.length > 0 && (
          <View className="bg-[#F0F5FA] px-3 py-1.5 rounded-lg">
            <Text className="text-text-gray font-sen text-xs">
              {paymentMethods.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        >
          <Text className="text-text-gray font-sen text-xs mb-4">
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

      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={() => router.push("/profile/add-card" as any)}
          className="w-full bg-primary h-[56px] rounded-2xl items-center justify-center flex-row"
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Plus color="white" size={20} />
          <Text className="text-white font-sen-bold text-sm uppercase tracking-wider ml-2">
            ADD CARD
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
