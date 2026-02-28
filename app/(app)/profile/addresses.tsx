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
  Plus,
  Trash2,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  Pressable,
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
    if (normalizedLabel === "home") return { color: "#2D8EFF", bg: "#EBF4FF" };
    if (normalizedLabel === "work") return { color: "#FF7622", bg: "#FFF5EE" };
    return { color: "#7E8CA0", bg: "#F0F5FA" };
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
    const { color, bg } = getLabelColor(address.label);

    return (
      <Pressable
        onPress={() => handleSetDefault(address)}
        onLongPress={() => handleSetDefault(address)}
        className={`rounded-2xl p-4 mb-3 flex-row items-center ${
          address.isDefault ? "bg-[#FFF5EE]" : "bg-[#F6F8FA]"
        }`}
        style={{
          borderWidth: address.isDefault ? 1.5 : 1,
          borderColor: address.isDefault ? "#FF7622" : "#F0F0F0",
          shadowColor: address.isDefault ? "#FF7622" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: address.isDefault ? 0.1 : 0.04,
          shadowRadius: 6,
          elevation: address.isDefault ? 3 : 1,
        }}
        activeOpacity={0.7}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
          style={{ backgroundColor: bg }}
        >
          <Icon color={color} size={18} />
        </View>
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-sm font-sen-bold text-secondary uppercase mr-2">
              {address.label}
            </Text>
            {address.isDefault && (
              <View className="bg-primary px-2 py-0.5 rounded-lg">
                <Text className="text-white text-[10px] font-sen-bold">
                  DEFAULT
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs font-sen text-text-gray leading-5">
            {address.street}, {address.city}, {address.state}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/profile/edit-address" as any,
                params: { id: address._id },
              })
            }
            className="w-9 h-9 bg-white rounded-xl items-center justify-center"
          >
            <Edit2 color="#FF7622" size={16} />
          </Pressable>
          <Pressable
            onPress={() => handleDelete(address)}
            disabled={deleteAddressMutation.isPending}
            className="w-9 h-9 bg-white rounded-xl items-center justify-center"
          >
            {deleteAddressMutation.isPending ? (
              <ActivityIndicator size="small" color="#FF4B4B" />
            ) : (
              <Trash2 color="#FF4B4B" size={16} />
            )}
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <Pressable
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
        </Pressable>
        <Text className="text-lg font-sen-bold text-secondary flex-1">
          My Addresses
        </Text>
        {addresses.length > 0 && (
          <View className="bg-[#F0F5FA] px-3 py-1.5 rounded-lg">
            <Text className="text-text-gray font-sen text-xs">
              {addresses.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-[#F0F5FA] rounded-3xl items-center justify-center mb-5">
            <MapPin color="#A0A5BA" size={32} />
          </View>
          <Text className="text-base font-sen-bold text-secondary mb-2">
            No Addresses Yet
          </Text>
          <Text className="text-text-gray font-sen text-sm text-center">
            Add your delivery addresses to get started
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        >
          <Text className="text-text-gray font-sen text-xs mb-4">
            Tap to set as default • Long press for options
          </Text>
          {addresses.map((address) => (
            <AddressItem key={address._id} address={address} />
          ))}
        </ScrollView>
      )}

      <View className="px-6 pb-6">
        <Pressable
          onPress={() => router.push("/profile/add-address" as any)}
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
            ADD NEW ADDRESS
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
