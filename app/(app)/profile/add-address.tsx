import { ButtonText } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useCreateAddress } from "@/hooks/useAddressMutations";
import {
  ArrowLeft01Icon,
  Briefcase01Icon,
  Gps01Icon,
  Home01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import MapView, { Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";
const DEFAULT_COORDS = { latitude: 6.5244, longitude: 3.3792 }; // Lagos

export default function AddAddress() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createAddressMutation = useCreateAddress();
  const mapRef = useRef<MapView>(null);

  const [label, setLabel] = useState<string>("Home");
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [mapRegion, setMapRegion] = useState<Region>({
    ...DEFAULT_COORDS,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });
  const [locationLoading, setLocationLoading] = useState(false);

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
        if (streetName) setStreet(streetName);
        if (item.city || item.subregion)
          setCity(item.city || item.subregion || "");
        if (item.region) setState(item.region);
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

      setCoords(newCoords);
      const newRegion: Region = {
        ...newCoords,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      };
      setMapRegion(newRegion);
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
    setCoords(newCoords);
    await reverseGeocode(newCoords.latitude, newCoords.longitude);
  };

  const handleSave = () => {
    if (!street.trim()) {
      Alert.alert("Street Required", "Please enter the street address.");
      return;
    }
    if (!city.trim()) {
      Alert.alert("City Required", "Please enter the city.");
      return;
    }

    createAddressMutation.mutate(
      {
        label,
        street: street.trim(),
        city: city.trim(),
        state: state.trim() || "Lagos",
        coordinates: { lat: coords.latitude, lng: coords.longitude },
      },
      {
        onSuccess: () => {
          Alert.alert("Saved", "Address added successfully.");
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err.message || "Failed to save address.");
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View
          className="px-5 pt-3 pb-3 border-b border-gray-100 flex-row items-center justify-between bg-white z-10"
          style={{ paddingTop: insets.top + 4 }}
        >
          <IconButton
            icon={ArrowLeft01Icon}
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
          <Text className="text-[17px] font-sen-bold text-secondary">
            Add Address
          </Text>
          <View className="w-11" />
        </View>

        {/* Map Header Area */}
        <View className="h-56 w-full relative bg-surface-muted">
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 40,
          }}
        >
          {/* Label selector */}
          <View className="mb-4">
            <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
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
                    onPress={() => setLabel(item.key)}
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
                          ? "font-sen-bold text-primary"
                          : "font-sen text-secondary"
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
            <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
              Street Address
            </Text>
            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="e.g. 12 Adeola Odeku St"
              placeholderTextColor="#A0A5BA"
              className="p-4 bg-surface-muted rounded-[18px] font-sen text-sm text-secondary"
              style={{ borderCurve: "continuous" }}
            />
          </View>

          {/* City */}
          <View className="mb-4">
            <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
              City
            </Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Victoria Island"
              placeholderTextColor="#A0A5BA"
              className="p-4 bg-surface-muted rounded-[18px] font-sen text-sm text-secondary"
              style={{ borderCurve: "continuous" }}
            />
          </View>

          {/* State */}
          <View className="mb-6">
            <Text className="text-[11px] font-sen-bold uppercase tracking-wider text-text-gray mb-2">
              State / Region
            </Text>
            <TextInput
              value={state}
              onChangeText={setState}
              placeholder="e.g. Lagos"
              placeholderTextColor="#A0A5BA"
              className="p-4 bg-surface-muted rounded-[18px] font-sen text-sm text-secondary"
              style={{ borderCurve: "continuous" }}
            />
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSave}
            disabled={createAddressMutation.isPending}
            className="w-full h-14 bg-secondary rounded-full items-center justify-center"
            style={{
              borderCurve: "continuous",
              boxShadow: "0px 4px 12px rgba(38,43,51,0.2)",
            }}
          >
            {createAddressMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ButtonText className="font-sen-bold text-base text-white">
                Save Address
              </ButtonText>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
