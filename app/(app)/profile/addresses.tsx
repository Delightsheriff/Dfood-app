import {
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/useAddressMutations";
import { useAddresses } from "@/hooks/useDataQueries";
import { Address } from "@/types/api";
import { useRouter } from "expo-router";
import {
  Briefcase,
  ChevronLeft,
  Edit2,
  Home,
  MapPin,
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

export default function Addresses() {
  const router = useRouter();
  const { data: addressesData, isLoading } = useAddresses();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const addresses = addressesData?.data.addresses || [];

  const getLabelIcon = (label: string) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel === "home") return Home;
    if (normalizedLabel === "work") return Briefcase;
    return MapPin;
  };

  const getLabelColor = (label: string) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel === "home") return "#2D8EFF";
    if (normalizedLabel === "work") return "#FF7622";
    return "#7E8CA0";
  };

  const handleDelete = (address: Address) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete "${address.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteAddressMutation.mutate(address._id, {
              onSuccess: () => {
                Alert.alert("Success", "Address deleted successfully");
              },
              onError: (error: any) => {
                const message =
                  error.response?.data?.message || "Failed to delete address";
                Alert.alert("Error", message);
              },
            });
          },
        },
      ],
    );
  };

  const handleSetDefault = (address: Address) => {
    if (address.isDefault) return;

    setDefaultMutation.mutate(address._id, {
      onSuccess: () => {
        Alert.alert("Success", "Default address updated");
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message || "Failed to set default address";
        Alert.alert("Error", message);
      },
    });
  };

  const AddressItem = ({ address }: { address: Address }) => {
    const Icon = getLabelIcon(address.label);
    const color = getLabelColor(address.label);

    return (
      <TouchableOpacity
        onPress={() => handleSetDefault(address)}
        onLongPress={() => handleSetDefault(address)}
        className={`rounded-[16px] p-4 mb-4 flex-row items-center ${
          address.isDefault
            ? "bg-[#FFF5EE] border-2 border-primary"
            : "bg-[#F0F5FA]"
        }`}
      >
        <View className="w-[40px] h-[40px] bg-white rounded-full items-center justify-center mr-4">
          <Icon color={color} size={20} />
        </View>
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-[14px] font-sen-bold text-[#181C2E] uppercase mr-2">
              {address.label}
            </Text>
            {address.isDefault && (
              <View className="bg-primary px-2 py-0.5 rounded-full">
                <Text className="text-white text-[10px] font-sen-bold">
                  DEFAULT
                </Text>
              </View>
            )}
          </View>
          <Text className="text-[13px] font-sen text-[#A0A5BA] leading-5">
            {address.street}, {address.city}, {address.state}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/profile/edit-address" as any,
                params: { id: address._id },
              })
            }
          >
            <Edit2 color="#FF7622" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(address)}
            disabled={deleteAddressMutation.isPending}
          >
            {deleteAddressMutation.isPending ? (
              <ActivityIndicator size="small" color="#FF7622" />
            ) : (
              <Trash2 color="#FF7622" size={20} />
            )}
          </TouchableOpacity>
        </View>
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
          My Addresses
        </Text>
        <View className="w-[45px]" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MapPin color="#A0A5BA" size={64} />
          <Text className="text-xl font-sen-bold text-secondary mt-4 mb-2">
            No Addresses Yet
          </Text>
          <Text className="text-text-gray font-sen text-sm text-center">
            Add your delivery addresses to get started
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Text className="text-text-gray font-sen text-sm mb-4">
            Tap to set as default • Long press for options
          </Text>
          {addresses.map((address) => (
            <AddressItem key={address._id} address={address} />
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => router.push("/profile/add-address" as any)}
        className="w-full bg-primary h-[62px] rounded-[12px] items-center justify-center mb-6"
      >
        <Text className="text-white font-sen-bold text-[14px] uppercase tracking-wider">
          ADD NEW ADDRESS
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
