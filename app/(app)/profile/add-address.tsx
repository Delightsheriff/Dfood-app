/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAddress } from "@/hooks/useAddressMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { ChevronLeft, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
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

export default function AddAddress() {
  const router = useRouter();
  const createAddressMutation = useCreateAddress();

  const [selectedLabel, setSelectedLabel] = useState("Home");
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 6.5244, // Lagos, Nigeria
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
  });
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
    },
  });

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature",
        );
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setMapRegion(newRegion);
      setMarkerPosition({ latitude, longitude });

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        setValue("street", address.street || "");
        setValue("city", address.city || "");
        setValue("state", address.region || "");
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });

    // Reverse geocode to update address fields
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        setValue("street", address.street || "");
        setValue("city", address.city || "");
        setValue("state", address.region || "");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const onSubmit = (data: AddressFormData) => {
    createAddressMutation.mutate(
      {
        label: selectedLabel,
        street: data.street,
        city: data.city,
        state: data.state,
        coordinates: {
          lat: markerPosition.latitude,
          lng: markerPosition.longitude,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Address added successfully");
          router.back();
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to add address";
          Alert.alert("Error", message);
        },
      },
    );
  };

  const LabelChip = ({ label }: { label: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedLabel(label)}
      className={`px-6 py-3 rounded-full mr-4 ${
        selectedLabel === label ? "bg-primary" : "bg-[#F0F5FA]"
      }`}
    >
      <Text
        className={`font-sen text-[14px] uppercase ${
          selectedLabel === label ? "text-white" : "text-[#A0A5BA]"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header overlaying Map */}
      <View className="z-10 absolute top-12 left-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
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

        {/* Location Loading Indicator */}
        {locationLoading && (
          <View className="absolute inset-0 bg-black/20 items-center justify-center">
            <View className="bg-white rounded-xl p-4">
              <ActivityIndicator size="large" color="#FF7622" />
              <Text className="text-secondary font-sen mt-2">
                Getting location...
              </Text>
            </View>
          </View>
        )}

        {/* Instruction Badge */}
        <View className="absolute bottom-4 self-center bg-[#181C2E] py-2 px-4 rounded-lg flex-row items-center">
          <Text className="text-white text-[12px] font-sen mr-2">
            Tap or drag marker to set location
          </Text>
          <View className="w-3 h-3 bg-primary rounded-full" />
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-white -mt-6 rounded-t-[30px] px-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Current Address Display */}
        <Text className="text-[#A0A5BA] font-sen text-[14px] uppercase mb-4">
          SELECTED ADDRESS
        </Text>

        <View className="bg-[#F0F5FA] rounded-[15px] p-4 flex-row items-center mb-6">
          <MapPin color="#2D8EFF" size={24} />
          <Text className="ml-3 text-[14px] font-sen text-[#181C2E] flex-1">
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
                className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${
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
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${
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
                  className={`h-[62px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${
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

        {/* Label Selection */}
        <Text className="text-[#A0A5BA] font-sen text-[14px] uppercase mb-4">
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

        {/* Save Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={createAddressMutation.isPending}
          className="h-[62px] bg-primary mb-10"
        >
          {createAddressMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-sen-bold text-[14px] uppercase tracking-wider">
              SAVE LOCATION
            </Text>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
