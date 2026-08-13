import { IconButton } from "@/components/ui/icon-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/useAddressMutations";
import { useAddresses } from "@/hooks/useDataQueries";
import { Address } from "@/types/api";
import {
  Briefcase01Icon,
  Delete02Icon,
  Edit02Icon,
  Home01Icon,
  Location01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function Addresses() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: addressesData, isLoading } = useAddresses();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const addresses = addressesData?.data.addresses || [];

  const getLabelIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l === "home") return Home01Icon;
    if (l === "work" || l === "office") return Briefcase01Icon;
    return Location01Icon;
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
                Alert.alert(
                  "Error",
                  error.response?.data?.message || "Failed to delete address",
                );
              },
            });
          },
        },
      ],
    );
  };

  const handleSetDefault = (address: Address) => {
    if (address.isDefault) return;
    setDefaultMutation.mutate(address._id);
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Delivery Addresses"
        rightElement={
          <IconButton
            icon={PlusSignIcon}
            accessibilityLabel="Add new address"
            onPress={() => router.push("/profile/add-address" as any)}
          />
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-surface-muted items-center justify-center mb-4">
            <HugeiconsIcon icon={Location01Icon} size={36} color="#646982" />
          </View>
          <Text className="text-xl font-title text-secondary mb-1">
            No Addresses Saved
          </Text>
          <Text className="text-xs font-body text-text-gray text-center max-w-[260px] mb-6">
            Add your home, office, or favorite delivery locations.
          </Text>
          <Pressable
            onPress={() => router.push("/profile/add-address" as any)}
            className="px-8 py-3.5 rounded-full bg-secondary"
            style={{ borderCurve: "continuous" }}
          >
            <Text className="text-white font-label text-sm">
              Add New Address
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 40,
          }}
        >
          {addresses.map((address) => {
            const Icon = getLabelIcon(address.label);
            return (
              <View
                key={address._id}
                className={`p-4 rounded-[20px] mb-3.5 border ${
                  address.isDefault
                    ? "bg-[#FFF5F3] border-primary"
                    : "bg-surface-muted border-transparent"
                }`}
                style={{ borderCurve: "continuous" }}
              >
                <View className="flex-row items-center justify-between">
                  <Pressable
                    onPress={() => handleSetDefault(address)}
                    className="flex-row items-center flex-1 mr-2"
                  >
                    <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                      <HugeiconsIcon icon={Icon} size={20} color={ACCENT} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-0.5">
                        <Text className="text-[15px] font-title text-secondary">
                          {address.label}
                        </Text>
                        {address.isDefault && (
                          <View className="bg-primary px-2 py-0.5 rounded-md">
                            <Text className="text-white text-[9px] font-caption">
                              DEFAULT
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs font-body text-text-gray leading-4">
                        {address.street}, {address.city}, {address.state}
                      </Text>
                    </View>
                  </Pressable>

                  {/* Actions */}
                  <View className="flex-row items-center gap-1">
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/profile/edit-address" as any,
                          params: { id: address._id },
                        })
                      }
                      className="w-8 h-8 rounded-full bg-white items-center justify-center"
                    >
                      <HugeiconsIcon icon={Edit02Icon} size={15} color="#262B33" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(address)}
                      className="w-8 h-8 rounded-full bg-white items-center justify-center"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={15}
                        color="#EF4444"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
