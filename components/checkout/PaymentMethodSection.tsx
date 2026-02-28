import { PaymentMethod } from "@/types/api";
import { Banknote, ChevronRight, CreditCard } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface PaymentMethodSectionProps {
  selectedPaymentMethod: PaymentMethod | null;
  paymentMethodsCount: number;
  onSelectPress: () => void;
  onAddCardPress: () => void;
}

export function PaymentMethodSection({
  selectedPaymentMethod,
  paymentMethodsCount,
  onSelectPress,
  onAddCardPress,
}: PaymentMethodSectionProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xs text-text-gray font-sen uppercase">
          PAYMENT METHOD
        </Text>
        {paymentMethodsCount === 1 && (
          <Pressable onPress={onAddCardPress}>
            <Text className="text-primary font-sen-bold text-sm">ADD CARD</Text>
          </Pressable>
        )}
      </View>

      {selectedPaymentMethod ? (
        <Pressable
          onPress={onSelectPress}
          className="bg-[#F0F5FA] rounded-xl p-4 flex-row items-center"
        >
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
            {selectedPaymentMethod.type === "cash" ? (
              <Banknote color="#2D8EFF" size={20} />
            ) : (
              <CreditCard color="#FF7622" size={20} />
            )}
          </View>
          <View className="flex-1">
            <Text className="font-sen-bold text-secondary text-sm">
              {selectedPaymentMethod.type === "cash"
                ? "Cash on Delivery"
                : `${selectedPaymentMethod.cardBrand} •••• ${selectedPaymentMethod.cardLast4}`}
            </Text>
          </View>
          <ChevronRight color="#181C2E" size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}
