import { useAuth } from "@/contexts/AuthContext";
import { useAddCard } from "@/hooks/usePaymentMethodMutations";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
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
    <SafeAreaView className="flex-1 bg-white px-6 pt-2" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-[45px] h-[45px] bg-[#ECF0F4] rounded-full items-center justify-center mr-4"
        >
          <ChevronLeft color="#181C2E" size={24} />
        </TouchableOpacity>
        <Text className="text-[17px] font-sen-bold text-[#181C2E] flex-1">
          Add Card
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-[#F0F5FA] rounded-2xl p-6 w-full">
          <Text className="text-center text-secondary font-sen-bold text-lg mb-2">
            Add Payment Card
          </Text>
          <Text className="text-center text-text-gray font-sen text-sm mb-6">
            You&apos;ll be charged ₦1 to verify your card. This will be refunded
            immediately.
          </Text>

          <View className="bg-white rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-3">
              <View className="w-2 h-2 bg-primary rounded-full mr-3" />
              <Text className="text-secondary font-sen text-sm flex-1">
                Secure payment via Paystack
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <View className="w-2 h-2 bg-primary rounded-full mr-3" />
              <Text className="text-secondary font-sen text-sm flex-1">
                Card details are encrypted
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-primary rounded-full mr-3" />
              <Text className="text-secondary font-sen text-sm flex-1">
                ₦1 verification fee refunded
              </Text>
            </View>
          </View>

          {addCardMutation.isPending ? (
            <View className="h-[62px] bg-primary rounded-xl items-center justify-center">
              <ActivityIndicator color="white" />
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleAddCard}
              className="h-[62px] bg-primary rounded-xl items-center justify-center"
            >
              <Text className="text-white font-sen-bold text-base">
                Add Card via Paystack
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
