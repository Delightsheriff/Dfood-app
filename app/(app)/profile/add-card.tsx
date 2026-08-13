import { ButtonText } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useAddCard } from "@/hooks/usePaymentMethodMutations";
import {
  ArrowLeft01Icon,
  CreditCardIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function AddCard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addCardMutation = useAddCard();

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleAddCard = () => {
    const rawNumber = cardNumber.replace(/\s+/g, "");
    if (rawNumber.length < 12) {
      Alert.alert("Invalid Card", "Please enter a valid card number.");
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert("Name Required", "Please enter the cardholder name.");
      return;
    }

    // Pass card reference to mutation
    addCardMutation.mutate(`card_ref_${Date.now()}_${rawNumber.slice(-4)}`, {
      onSuccess: () => {
        Alert.alert("Success", "Card added successfully (Demo Mode)", [
          { text: "OK", onPress: () => router.back() },
        ]);
      },
      onError: (err: any) => {
        Alert.alert("Error", err.message || "Failed to add card.");
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View
          className="px-5 pt-3 pb-3 border-b border-gray-100 flex-row items-center justify-between"
          style={{ paddingTop: insets.top + 4 }}
        >
          <IconButton
            icon={ArrowLeft01Icon}
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
          <Text className="text-[17px] font-sen-bold text-secondary">
            Add Payment Card
          </Text>
          <View className="w-11" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 40,
          }}
        >
          {/* Card Preview Container */}
          <View
            className="p-6 rounded-[24px] bg-secondary mb-6 relative overflow-hidden"
            style={{
              borderCurve: "continuous",
              boxShadow: "0px 8px 24px rgba(38,43,51,0.25)",
            }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <HugeiconsIcon icon={CreditCardIcon} size={28} color="#FFFFFF" />
              <View className="bg-white/15 px-2.5 py-1 rounded-md">
                <Text className="text-white text-[10px] font-sen-bold uppercase tracking-wider">
                  Demo Mode
                </Text>
              </View>
            </View>

            <Text className="text-xl font-sen-bold text-white tracking-widest mb-4">
              {cardNumber
                ? cardNumber
                : "••••  ••••  ••••  4242"}
            </Text>

            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-[9px] font-sen uppercase tracking-wider text-white/60">
                  Card Holder
                </Text>
                <Text className="text-xs font-sen-bold text-white mt-0.5">
                  {cardHolder ? cardHolder.toUpperCase() : "DELIGHT SHERIFF"}
                </Text>
              </View>
              <View>
                <Text className="text-[9px] font-sen uppercase tracking-wider text-white/60">
                  Expires
                </Text>
                <Text className="text-xs font-sen-bold text-white mt-0.5">
                  {expiry ? expiry : "12/30"}
                </Text>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View className="gap-4 mb-6">
            <View>
              <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
                Card Number
              </Text>
              <TextInput
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="4242 •••• •••• 4242"
                placeholderTextColor="#A0A5BA"
                keyboardType="numeric"
                maxLength={19}
                className="p-4 bg-surface-muted rounded-[18px] font-sen text-sm text-secondary"
                style={{ borderCurve: "continuous" }}
              />
            </View>

            <View>
              <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
                Cardholder Name
              </Text>
              <TextInput
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Name on card"
                placeholderTextColor="#A0A5BA"
                autoCapitalize="characters"
                className="p-4 bg-surface-muted rounded-[18px] font-sen text-sm text-secondary"
                style={{ borderCurve: "continuous" }}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
                  Expiry Date
                </Text>
                <TextInput
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/YY"
                  placeholderTextColor="#A0A5BA"
                  keyboardType="numeric"
                  maxLength={5}
                  className="p-4 bg-surface-muted rounded-[18px] font-sen text-sm text-secondary"
                  style={{ borderCurve: "continuous" }}
                />
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
                  CVV
                </Text>
                <TextInput
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor="#A0A5BA"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  className="p-4 bg-surface-muted rounded-[18px] font-sen text-sm text-secondary"
                  style={{ borderCurve: "continuous" }}
                />
              </View>
            </View>
          </View>

          {/* Security note */}
          <View className="p-4 bg-surface-muted rounded-[18px] flex-row items-center gap-3 mb-6">
            <HugeiconsIcon icon={Shield01Icon} size={20} color={ACCENT} />
            <Text className="text-xs font-sen text-text-gray flex-1 leading-4">
              Demo card tokenization. No real charges are ever made to your card.
            </Text>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleAddCard}
            disabled={addCardMutation.isPending}
            className="w-full h-14 bg-secondary rounded-full items-center justify-center"
            style={{
              borderCurve: "continuous",
              boxShadow: "0px 4px 12px rgba(38,43,51,0.2)",
            }}
          >
            {addCardMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ButtonText className="font-sen-bold text-base text-white">
                Save Card
              </ButtonText>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
