/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAddress } from "@/hooks/useAddressMutations";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { ChevronLeft, Crosshair, MapPin } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
  Pressable,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, { Region } from "react-native-maps";
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
  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const [selectedLabel, setSelectedLabel] = useState("Home");
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 6.5244, // Lagos, Nigeria
    longitude: 3.3792,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [centerCoords, setCenterCoords] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const snapPoints = useMemo(() => ["38%", "85%"], []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
    },
  });

  const streetValue = watch("street");
  const cityValue = watch("city");

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
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setMapRegion(newRegion);
      setCenterCoords({ latitude, longitude });
      mapRef.current?.animateToRegion(newRegion, 500);

      // Reverse geocode to get address
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setLocationLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    setGeocoding(true);
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
    } finally {
      setGeocoding(false);
    }
  };

  const handleRegionChangeComplete = useCallback((region: Region) => {
    setMapRegion(region);
    setCenterCoords({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    reverseGeocode(region.latitude, region.longitude);
  }, []);

  const onSubmit = (data: AddressFormData) => {
    createAddressMutation.mutate(
      {
        label: selectedLabel,
        street: data.street,
        city: data.city,
        state: data.state,
        coordinates: {
          lat: centerCoords.latitude,
          lng: centerCoords.longitude,
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

  const displayAddress =
    streetValue && cityValue
      ? `${streetValue}, ${cityValue}`
      : "Move the map to select location";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />

        {/* Full-screen Map */}
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={mapRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
        />

        {/* Center Pin (fixed in the middle of the map) */}
        <View
          pointerEvents="none"
          className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center"
          style={{ marginBottom: 48 }}
        >
          <View className="items-center">
            <MapPin color="#FF7622" size={36} fill="#FF7622" />
            <View className="w-2 h-2 bg-[#FF7622] rounded-full mt-[-2px] opacity-40" />
          </View>
        </View>

        {/* Back Button */}
        <SafeAreaView
          edges={["top"]}
          className="absolute top-0 left-0 right-0"
          pointerEvents="box-none"
        >
          <View
            className="px-6 pt-2 flex-row justify-between"
            pointerEvents="box-none"
          >
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 bg-white rounded-full items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <ChevronLeft color="#181C2E" size={22} />
            </Pressable>

            {/* My Location Button */}
            <Pressable
              onPress={getCurrentLocation}
              disabled={locationLoading}
              className="w-11 h-11 bg-white rounded-full items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#FF7622" />
              ) : (
                <Crosshair color="#FF7622" size={20} />
              )}
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Geocoding indicator */}
        {geocoding && (
          <View className="absolute top-1/2 self-center bg-[#181C2E] py-2 px-4 rounded-full">
            <Text className="text-white text-xs font-sen">
              Finding address...
            </Text>
          </View>
        )}

        {/* Bottom Sheet Form */}
        <BottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
          backgroundStyle={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <BottomSheetScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Detected Address Display */}
            <View className="flex-row items-center bg-[#F0F5FA] rounded-2xl p-4 mb-5">
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <MapPin color="#FF7622" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-[#A0A5BA] font-sen uppercase mb-0.5">
                  SELECTED LOCATION
                </Text>
                <Text
                  className="text-sm font-sen-bold text-[#181C2E]"
                  numberOfLines={2}
                >
                  {displayAddress}
                </Text>
              </View>
            </View>

            {/* Label Selection */}
            <Text className="text-[#A0A5BA] font-sen text-xs uppercase mb-3">
              LABEL AS
            </Text>
            <View className="flex-row mb-5">
              {LABEL_OPTIONS.map((label) => (
                <Pressable
                  key={label}
                  onPress={() => setSelectedLabel(label)}
                  className={`px-5 py-2.5 rounded-full mr-3 ${
                    selectedLabel === label ? "bg-primary" : "bg-[#F0F5FA]"
                  }`}
                >
                  <Text
                    className={`font-sen text-sm ${
                      selectedLabel === label ? "text-white" : "text-[#A0A5BA]"
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Street Field */}
            <View className="mb-4">
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
                    className={`h-[52px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${
                      errors.street ? "border border-red-500" : ""
                    }`}
                  />
                )}
              />
              {errors.street && (
                <Text className="text-red-500 text-[12px] font-sen mt-1 ml-1">
                  {errors.street.message}
                </Text>
              )}
            </View>

            {/* City & State Row */}
            <View className="flex-row gap-3 mb-5">
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
                      className={`h-[52px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${
                        errors.city ? "border border-red-500" : ""
                      }`}
                    />
                  )}
                />
                {errors.city && (
                  <Text className="text-red-500 text-[12px] font-sen mt-1 ml-1">
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
                      className={`h-[52px] !bg-[#F0F5FA] text-text-gray-dark border-0 ${
                        errors.state ? "border border-red-500" : ""
                      }`}
                    />
                  )}
                />
                {errors.state && (
                  <Text className="text-red-500 text-[12px] font-sen mt-1 ml-1">
                    {errors.state.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Save Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={createAddressMutation.isPending}
              className="h-[56px] bg-primary"
            >
              {createAddressMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-sen-bold text-[14px] uppercase tracking-wider">
                  SAVE ADDRESS
                </Text>
              )}
            </Button>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}
