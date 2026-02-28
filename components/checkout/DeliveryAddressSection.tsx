import { Address } from "@/types/api";
import { ChevronRight, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface DeliveryAddressSectionProps {
  selectedAddress: Address | null;
  hasAddresses: boolean;
  onSelectPress: () => void;
  onAddPress: () => void;
}

export function DeliveryAddressSection({
  selectedAddress,
  hasAddresses,
  onSelectPress,
  onAddPress,
}: DeliveryAddressSectionProps) {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xs text-text-gray font-sen uppercase">
          DELIVERY ADDRESS
        </Text>
        {!hasAddresses && (
          <Pressable onPress={onAddPress}>
            <Text className="text-primary font-sen-bold text-sm">
              ADD ADDRESS
            </Text>
          </Pressable>
        )}
      </View>

      {selectedAddress ? (
        <Pressable
          onPress={onSelectPress}
          className="bg-[#F0F5FA] rounded-xl p-4 flex-row items-center"
        >
          <MapPin color="#2D8EFF" size={20} />
          <View className="flex-1 ml-3">
            <Text className="font-sen-bold text-secondary text-sm">
              {selectedAddress.label}
            </Text>
            <Text className="font-sen text-text-gray text-xs">
              {selectedAddress.street}, {selectedAddress.city}
            </Text>
          </View>
          <ChevronRight color="#181C2E" size={20} />
        </Pressable>
      ) : (
        <Pressable
          onPress={onAddPress}
          className="bg-[#FFF5EE] rounded-xl p-4 border-2 border-dashed border-primary"
        >
          <Text className="text-primary font-sen-bold text-center">
            + Add Delivery Address
          </Text>
        </Pressable>
      )}
    </View>
  );
}
