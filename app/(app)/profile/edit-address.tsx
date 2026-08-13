import { ButtonText } from "@/components/ui/button";
import { useProgressiveBlurScroll } from "@/components/ui/progressive-blur";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useUpdateAddress } from "@/hooks/useAddressMutations";
import { useAddresses } from "@/hooks/useDataQueries";
import {
  Briefcase01Icon,
  Gps01Icon,
  Home01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function EditAddress() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll } = useProgressiveBlurScroll();
  const { data: addressesData, isLoading: addressesLoading } = useAddresses();
  const updateAddressMutation = useUpdateAddress();
  const mapRef = useRef<MapView>(null);

  const address = addressesData?.data.addresses.find((a) => a._id === id);

  const [labelOverride, setLabelOverride] = useState<string | null>(null);
  const [streetOverride, setStreetOverride] = useState<string | null>(null);
  const [cityOverride, setCityOverride] = useState<string | null>(null);
  const [stateOverride, setStateOverride] = useState<string | null>(null);
  const [coordsOverride, setCoordsOverride] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const label = labelOverride ?? address?.label ?? "Home";
  const street = streetOverride ?? address?.street ?? "";
  const city = cityOverride ?? address?.city ?? "";
  const state = stateOverride ?? address?.state ?? "Lagos";
  const coords = coordsOverride ?? {
    latitude: (address as any)?.latitude || address?.coordinates?.lat || 6.5244,
    longitude: (address as any)?.longitude || address?.coordinates?.lng || 3.3792,
  };
  const mapRegion: Region = {
    ...coords,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (results.length > 0) {
        const item = results[0];
        const streetName = [item.streetNumber, item.street, item.name]
          .filter(Boolean)
          .join(" ");
        if (streetName) setStreetOverride(streetName);
        if (item.city || item.subregion)
          setCityOverride(item.city || item.subregion || "");
        if (item.region) setStateOverride(item.region);
      }
    } catch {
      // Graceful fallback to manual entry
    }
  };

  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to find your current spot. You can also enter the address manually.",
        );
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoordsOverride(newCoords);
      const newRegion: Region = {
        ...newCoords,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      };
      mapRef.current?.animateToRegion(newRegion, 400);

      await reverseGeocode(newCoords.latitude, newCoords.longitude);
    } catch (err) {
      console.log("GPS lookup failed:", err);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapPress = async (e: any) => {
    const newCoords = e.nativeEvent.coordinate;
    setCoordsOverride(newCoords);
    await reverseGeocode(newCoords.latitude, newCoords.longitude);
  };

  const handleSave = () => {
    if (!id) return;
    if (!street.trim()) {
      Alert.alert("Street Required", "Please enter the street address.");
      return;
    }
    if (!city.trim()) {
      Alert.alert("City Required", "Please enter the city.");
      return;
    }

    updateAddressMutation.mutate(
      {
        id,
        data: {
          label,
          street: street.trim(),
          city: city.trim(),
          state: state.trim() || "Lagos",
          coordinates: { lat: coords.latitude, lng: coords.longitude },
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Saved", "Address updated successfully.");
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err.message || "Failed to update address.");
        },
      },
    );
  };

  if (addressesLoading && !address) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        <ScreenHeader
          variant="detail"
          title="Edit Address"
          scrollY={scrollY}
          alwaysShowTitle
        />

        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 56,
            paddingBottom: insets.bottom + 40,
          }}
        >
          {/* Map Header Area */}
          <View className="h-52 w-full relative bg-surface-muted">
            <MapView
              ref={mapRef}
              style={{ width: "100%", height: "100%" }}
              region={mapRegion}
              onPress={handleMapPress}
            >
              <Marker coordinate={coords} pinColor={ACCENT} />
            </MapView>

            {/* Floating GPS button */}
            <Pressable
              onPress={handleGetCurrentLocation}
              className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full items-center justify-center"
              style={{
                boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color={ACCENT} />
              ) : (
                <HugeiconsIcon icon={Gps01Icon} size={20} color={ACCENT} />
              )}
            </Pressable>
          </View>

          {/* Form Fields */}
          <View className="px-5 pt-4">
            {/* Label selector */}
            <View className="mb-4">
              <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
                Address Label
              </Text>
              <View className="flex-row gap-2">
                {[
                  { key: "Home", icon: Home01Icon },
                  { key: "Work", icon: Briefcase01Icon },
                  { key: "Other", icon: Location01Icon },
                ].map((item) => {
                  const isSelected = label === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => setLabelOverride(item.key)}
                      className={`flex-1 py-3 px-2 rounded-2xl border flex-row items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-[#FFF5F3] border-primary"
                          : "bg-surface-muted border-transparent"
                      }`}
                      style={{ borderCurve: "continuous" }}
                    >
                      <HugeiconsIcon
                        icon={item.icon}
                        size={16}
                        color={isSelected ? ACCENT : "#646982"}
                      />
                      <Text
                        className={`text-xs ${
                          isSelected
                            ? "font-label text-primary"
                            : "font-body text-secondary"
                        }`}
                      >
                        {item.key}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

          {/* Street Address */}
          <View className="mb-4">
            <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
              Street Address
            </Text>
            <TextInput
              value={street}
              onChangeText={setStreetOverride}
              placeholder="e.g. 12 Adeola Odeku St"
              placeholderTextColor="#A0A5BA"
              className="p-4 bg-surface-muted rounded-[18px] font-body text-sm text-secondary"
              style={{ borderCurve: "continuous" }}
            />
          </View>

          {/* City */}
          <View className="mb-4">
            <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
              City
            </Text>
            <TextInput
              value={city}
              onChangeText={setCityOverride}
              placeholder="e.g. Victoria Island"
              placeholderTextColor="#A0A5BA"
              className="p-4 bg-surface-muted rounded-[18px] font-body text-sm text-secondary"
              style={{ borderCurve: "continuous" }}
            />
          </View>

          {/* State */}
          <View className="mb-6">
            <Text className="text-[11px] font-caption uppercase tracking-wider text-text-gray mb-2">
              State / Region
            </Text>
            <TextInput
              value={state}
              onChangeText={setStateOverride}
              placeholder="e.g. Lagos"
              placeholderTextColor="#A0A5BA"
              className="p-4 bg-surface-muted rounded-[18px] font-body text-sm text-secondary"
              style={{ borderCurve: "continuous" }}
            />
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSave}
            disabled={updateAddressMutation.isPending}
            className="w-full h-14 bg-secondary rounded-full items-center justify-center"
            style={{
              borderCurve: "continuous",
              boxShadow: "0px 4px 12px rgba(38,43,51,0.2)",
            }}
          >
            {updateAddressMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ButtonText className="font-label text-base text-white">
                Update Address
              </ButtonText>
            )}
          </Pressable>
        </View>
      </Animated.ScrollView>
    </View>
  </KeyboardAvoidingView>
  );
}
