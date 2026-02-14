import { useAuth } from "@/contexts/AuthContext";
import { useAddCard } from "@/hooks/usePaymentMethodMutations";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  CreditCard,
  Lock,
  RefreshCw,
  Shield,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PaystackProvider, usePaystack } from "react-native-paystack-webview";
import { SafeAreaView } from "react-native-safe-area-context";

const PAYSTACK_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_PAYSTACK_KEY || "pk_test_your_public_key";

function AddCardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const addCardMutation = useAddCard();
  const { popup } = usePaystack();

  const handleAddCard = () => {
    popup.checkout({
      email: user?.email || "user@example.com",
      amount: 100,
      onSuccess: (response) => {
        console.log(response);
        const reference = response.reference;

        if (!reference) {
          Alert.alert("Error", "Transaction reference not found");
          return;
        }

        addCardMutation.mutate(reference as string, {
          onSuccess: (data) => {
            Alert.alert("Success", data.message || "Card added successfully", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]);
          },
          onError: (error: any) => {
            const message =
              error.response?.data?.message ||
              "Failed to add card. Please try again.";
            Alert.alert("Error", message);
          },
        });
      },
      onCancel: () => {
        Alert.alert("Cancelled", "Card addition was cancelled", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      },
    });
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
          Add Card
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {/* Card Icon */}
        <View
          className="w-20 h-20 bg-[#FFF5EE] rounded-3xl items-center justify-center mb-6"
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <CreditCard color="#FF7622" size={36} />
        </View>

        <Text className="text-xl font-sen-bold text-secondary mb-2 text-center">
          Add Payment Card
        </Text>
        <Text className="text-text-gray font-sen text-sm mb-8 text-center leading-5">
          You&apos;ll be charged ₦1 to verify your card.{"\n"}This will be
          refunded immediately.
        </Text>

        {/* Features Card */}
        <View
          className="bg-[#F6F8FA] rounded-2xl p-5 w-full mb-8"
          style={{
            borderWidth: 1,
            borderColor: "#F0F0F0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-[#EBF4FF] rounded-xl items-center justify-center mr-3">
              <Shield color="#2D8EFF" size={16} />
            </View>
            <Text className="text-secondary font-sen text-sm flex-1">
              Secure payment via Paystack
            </Text>
          </View>
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-[#FFF5EE] rounded-xl items-center justify-center mr-3">
              <Lock color="#FF7622" size={16} />
            </View>
            <Text className="text-secondary font-sen text-sm flex-1">
              Card details are encrypted
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-[#DCFCE7] rounded-xl items-center justify-center mr-3">
              <RefreshCw color="#16A34A" size={16} />
            </View>
            <Text className="text-secondary font-sen text-sm flex-1">
              ₦1 verification fee refunded
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        {addCardMutation.isPending ? (
          <View
            className="h-[56px] bg-primary rounded-2xl items-center justify-center w-full"
            style={{
              shadowColor: "#FF7622",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <ActivityIndicator color="white" />
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleAddCard}
            className="h-[56px] bg-primary rounded-2xl items-center justify-center w-full flex-row"
            style={{
              shadowColor: "#FF7622",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <CreditCard color="white" size={18} />
            <Text className="text-white font-sen-bold text-sm uppercase tracking-wider ml-2">
              Add Card via Paystack
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function AddCard() {
  return (
    <PaystackProvider publicKey={PAYSTACK_PUBLIC_KEY}>
      <AddCardContent />
    </PaystackProvider>
  );
}
