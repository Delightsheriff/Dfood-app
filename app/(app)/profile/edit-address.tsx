/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateAddress } from "@/hooks/useAddressMutations";
import { useAddresses } from "@/hooks/useDataQueries";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(5, "Street must be at least 5 characters").max(200),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  state: z.string().min(2, "State must be at least 2 characters").max(100),
});

type AddressFormData = z.infer<typeof addressSchema>;

const LABEL_OPTIONS = ["Home", "Work", "Other"];

export default function EditAddress() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: addressesData, isLoading: addressesLoading } = useAddresses();
  const updateAddressMutation = useUpdateAddress();

  const address = addressesData?.data.addresses.find((a) => a._id === id);

  const [selectedLabel, setSelectedLabel] = useState(address?.label || "Home");
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: address?.coordinates.lat || 6.5244,
    longitude: address?.coordinates.lng || 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: address?.coordinates.lat || 6.5244,
    longitude: address?.coordinates.lng || 3.3792,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: address?.street || "",
      city: address?.city || "",
      state: address?.state || "",
    },
  });

  // Update form when address data loads
  useEffect(() => {
    if (address) {
      setValue("street", address.street);
      setValue("city", address.city);
      setValue("state", address.state);
      setSelectedLabel(address.label);
      setMapRegion({
        latitude: address.coordinates.lat,
        longitude: address.coordinates.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setMarkerPosition({
        latitude: address.coordinates.lat,
        longitude: address.coordinates.lng,
      });
    }
  }, [address]);

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });

    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        setValue("street", addr.street || "");
        setValue("city", addr.city || "");
        setValue("state", addr.region || "");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const onSubmit = (data: AddressFormData) => {
    updateAddressMutation.mutate(
      {
        id,
        data: {
          label: selectedLabel,
          street: data.street,
          city: data.city,
          state: data.state,
          coordinates: {
            lat: markerPosition.latitude,
            lng: markerPosition.longitude,
          },
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Address updated successfully");
          router.back();
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to update address";
          Alert.alert("Error", message);
        },
      },
    );
  };

  const LabelChip = ({ label }: { label: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedLabel(label)}
      className={`px-6 py-3 rounded-2xl mr-3 ${
        selectedLabel === label ? "bg-primary" : "bg-[#F0F5FA]"
      }`}
      style={
        selectedLabel === label
          ? {
              shadowColor: "#FF7622",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }
          : undefined
      }
    >
      <Text
        className={`font-sen-bold text-sm uppercase ${
          selectedLabel === label ? "text-white" : "text-text-gray"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (addressesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      </SafeAreaView>
    );
  }

  if (!address) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-[#F0F5FA] rounded-3xl items-center justify-center mb-5">
            <MapPin color="#A0A5BA" size={32} />
          </View>
          <Text className="text-base font-sen-bold text-secondary mb-2">
            Address not found
          </Text>
          <Text className="text-text-gray font-sen text-sm text-center">
            This address may have been deleted
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header overlaying Map */}
      <View className="z-10 absolute top-12 left-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-white rounded-2xl items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <ChevronLeft color="#181C2E" size={22} />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View className="h-[300px]">
        <MapView
          style={{ flex: 1 }}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={markerPosition}
            draggable
            onDragEnd={handleMapPress}
          />
        </MapView>

        <View
          className="absolute bottom-4 self-center bg-[#181C2E] py-2.5 px-4 rounded-2xl flex-row items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Text className="text-white text-xs font-sen mr-2">
            Tap or drag marker to update location
          </Text>
          <View className="w-2.5 h-2.5 bg-primary rounded-full" />
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-white -mt-6 rounded-t-[30px] px-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs text-text-gray font-sen uppercase mb-3 tracking-wide">
          SELECTED ADDRESS
        </Text>

        <View
          className="bg-[#F0F5FA] rounded-2xl p-4 flex-row items-center mb-6"
          style={{
            borderWidth: 1,
            borderColor: "#E8ECF2",
          }}
        >
          <View className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-3">
            <MapPin color="#2D8EFF" size={16} />
          </View>
          <Text className="text-sm font-sen text-secondary flex-1">
            {markerPosition.latitude.toFixed(4)},{" "}
            {markerPosition.longitude.toFixed(4)}
          </Text>
        </View>

        {/* Street Field */}
        <View className="mb-6">
          <Label className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide">
            STREET
          </Label>
          <Controller
            control={control}
            name="street"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="e.g., 123 Main Street"
                placeholderTextColor="#B4B9CA"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 rounded-2xl ${
                  errors.street ? "border border-red-500" : ""
                }`}
              />
            )}
          />
          {errors.street && (
            <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
              {errors.street.message}
            </Text>
          )}
        </View>

        {/* City & State Row */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <Label className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide">
              CITY
            </Label>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="City"
                  placeholderTextColor="#B4B9CA"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 rounded-2xl ${
                    errors.city ? "border border-red-500" : ""
                  }`}
                />
              )}
            />
            {errors.city && (
              <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
                {errors.city.message}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Label className="text-[#32343E] font-sen-bold text-[13px] mb-2 uppercase tracking-wide">
              STATE
            </Label>
            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="State"
                  placeholderTextColor="#B4B9CA"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 rounded-2xl ${
                    errors.state ? "border border-red-500" : ""
                  }`}
                />
              )}
            />
            {errors.state && (
              <Text className="text-red-500 text-[12px] font-sen mt-1.5 ml-1">
                {errors.state.message}
              </Text>
            )}
          </View>
        </View>

        <Text className="text-xs text-text-gray font-sen uppercase mb-3 tracking-wide">
          LABEL AS
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
        >
          {LABEL_OPTIONS.map((label) => (
            <LabelChip key={label} label={label} />
          ))}
        </ScrollView>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={updateAddressMutation.isPending}
          className="h-[56px] bg-primary mb-10 rounded-2xl"
          style={{
            shadowColor: "#FF7622",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {updateAddressMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-sen-bold text-sm uppercase tracking-wider">
              UPDATE LOCATION
            </Text>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
