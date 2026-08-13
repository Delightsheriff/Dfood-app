import { ButtonText } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useDefaultAddress, useRestaurant } from "@/hooks/useDataQueries";
import { useCartStore } from "@/store/cartStore";
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Clock01Icon,
  Coupon01Icon,
  Delete02Icon,
  MinusSignIcon,
  Note01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#E0533A";

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = useCartStore((state) => state.items);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice());
  const restaurantId = useCartStore((state) => state.getRestaurantId());

  const { data: restaurantData } = useRestaurant(restaurantId || "");
  const restaurant = restaurantData?.data.restaurant;

  const { data: defaultAddressData } = useDefaultAddress();
  const defaultAddress = defaultAddressData?.data.address;

  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const restaurantName = items.length > 0 ? items[0].restaurantName : "";
  const subtotal = getTotalPrice;
  const deliveryFee = restaurant ? restaurant.deliveryFee : 0;
  const discount = appliedPromo ? Math.min(500, subtotal * 0.15) : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const checkoutPressed = useSharedValue(0);
  const checkoutStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(checkoutPressed.get(), [0, 1], [1, 0.97]) }],
    opacity: interpolate(checkoutPressed.get(), [0, 1], [1, 0.9]),
  }));

  const checkoutTap = Gesture.Tap()
    .runOnJS(true)
    .enabled(items.length > 0)
    .onBegin(() => {
      checkoutPressed.set(1);
    })
    .onFinalize(() => {
      checkoutPressed.set(0);
    })
    .onEnd((_event, success) => {
      if (success) {
        router.push("/(app)/checkout");
      }
    });

  const renderHeader = () => (
    <View
      className="pb-2"
      style={{ paddingTop: insets.top }}
    >
      {/* Restaurant Header Block */}
      <View className="px-5 pt-3 pb-3 border-b border-gray-100 flex-row items-center justify-between">
        <IconButton
          icon={ArrowLeft01Icon}
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <View className="items-center flex-1 mx-2">
          <Text
            numberOfLines={1}
            className="text-[17px] font-title text-secondary"
          >
            {restaurantName || "Your Cart"}
          </Text>
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3">
              <HugeiconsIcon icon={Clock01Icon} size={18} color={ACCENT} />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-title text-secondary">
                Delivery in 25–35 min
              </Text>
              <Text
                numberOfLines={1}
                className="text-[11px] font-body text-text-gray mt-0.5"
              >
                {defaultAddress
                  ? defaultAddress.label || defaultAddress.street
                  : "Select delivery address"}
              </Text>
            </View>
          </View>
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#646982" />
        </Pressable>
      </View>

      {/* Section Title */}
      <View className="px-5 mt-2 mb-1">
        <Text className="text-[16px] font-title text-secondary">
          Items from {restaurantName || "Restaurant"}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (items.length === 0) return null;

    return (
      <View className="px-5 pt-3 pb-8">
        {/* 3. Promo & Notes Rows */}
        <View
          className="bg-surface-muted rounded-[20px] overflow-hidden mb-6"
          style={{ borderCurve: "continuous" }}
        >
          {/* Promo code row */}
          <Pressable
            onPress={() => setPromoModalVisible(true)}
            className="flex-row items-center justify-between p-4 border-b border-gray-200/50"
          >
            <View className="flex-row items-center gap-3">
              <HugeiconsIcon icon={Coupon01Icon} size={18} color={ACCENT} />
              <Text className="text-[14px] font-label text-secondary">
                {appliedPromo ? `Promo: ${appliedPromo}` : "Add a promo code"}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              {appliedPromo && (
                <Text className="text-xs font-numeric text-green-600">
                  Applied
                </Text>
              )}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                color="#646982"
              />
            </View>
          </Pressable>

          {/* Delivery instructions row */}
          <Pressable
            onPress={() => setNotesModalVisible(true)}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center gap-3 flex-1 mr-2">
              <HugeiconsIcon icon={Note01Icon} size={18} color="#646982" />
              <Text
                numberOfLines={1}
                className="text-[14px] font-body text-secondary flex-1"
              >
                {deliveryInstructions
                  ? `Notes: ${deliveryInstructions}`
                  : "Add delivery instructions"}
              </Text>
            </View>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#646982" />
          </Pressable>
        </View>

        {/* 4. Order Summary */}
        <View
          className="bg-surface-muted rounded-[20px] p-5 mb-4"
          style={{ borderCurve: "continuous" }}
        >
          <Text className="text-[15px] font-title text-secondary mb-3.5">
            Order Summary
          </Text>

          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="text-[13px] font-body text-text-gray">Subtotal</Text>
            <Text className="text-[13px] font-numeric text-secondary">
              ₦{subtotal.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="text-[13px] font-body text-text-gray">Delivery Fee</Text>
            <Text className="text-[13px] font-numeric text-secondary">
              {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
            </Text>
          </View>

          {appliedPromo && (
            <View className="flex-row justify-between items-center mb-2.5">
              <Text className="text-[13px] font-body text-green-600">Discount</Text>
              <Text className="text-[13px] font-numeric text-green-600">
                -₦{discount.toLocaleString()}
              </Text>
            </View>
          )}

          <View className="h-[1px] bg-gray-200 my-2" />

          <View className="flex-row justify-between items-center pt-1">
            <Text className="text-[16px] font-title text-secondary">Total</Text>
            <Text className="text-[20px] font-numeric text-secondary">
              ₦{total.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {items.length === 0 ? (
        /* Empty Cart State */
        <View className="flex-1">
          <View
            className="px-5 pt-3 pb-3 border-b border-gray-100 flex-row items-center"
            style={{ paddingTop: insets.top + 4 }}
          >
            <IconButton
              icon={ArrowLeft01Icon}
              accessibilityLabel="Go back"
              onPress={() => router.back()}
            />
            <Text className="text-lg font-title text-secondary ml-4">
              Your Cart
            </Text>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <View className="w-20 h-20 rounded-full bg-surface-muted items-center justify-center mb-4">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={36} color="#646982" />
            </View>
            <Text className="text-xl font-title text-secondary mb-1">
              Your cart is empty
            </Text>
            <Text className="text-xs font-body text-text-gray text-center max-w-[260px] mb-6">
              Explore restaurants and add delicious dishes to start your order.
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/(tabs)" as any)}
              className="px-8 py-3.5 rounded-full bg-secondary"
              style={{ borderCurve: "continuous" }}
            >
              <Text className="text-white font-label text-sm">
                Browse Restaurants
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        /* Populated Cart */
        <View className="flex-1">
          <FlashList
            data={items}
            keyExtractor={(item) => item.foodItem._id}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View className="px-5 mb-3">
                <View
                  className="flex-row items-center p-3.5 bg-white border border-gray-100 rounded-[18px]"
                  style={{
                    borderCurve: "continuous",
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Item thumbnail */}
                  <Image
                    source={{ uri: item.foodItem.images[0] }}
                    style={{ width: 68, height: 68, borderRadius: 14 }}
                    contentFit="cover"
                    transition={150}
                  />

                  {/* Details */}
                  <View className="flex-1 ml-3.5 justify-center">
                    <Text
                      numberOfLines={1}
                      className="text-[15px] font-title text-secondary mb-1"
                    >
                      {item.foodItem.name}
                    </Text>
                    <Text className="text-[14px] font-numeric text-secondary">
                      ₦{(item.foodItem.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>

                  {/* Gopuff-style Stepper: minus becomes trash at qty 1 */}
                  <View
                    className="flex-row items-center bg-surface-muted rounded-full px-1.5 py-1"
                    style={{ borderCurve: "continuous" }}
                  >
                    <Pressable
                      onPress={() => decrementItem(item.foodItem._id)}
                      className="w-7 h-7 rounded-full items-center justify-center bg-white"
                      accessibilityLabel={
                        item.quantity === 1
                          ? "Remove item"
                          : "Decrease quantity"
                      }
                    >
                      {item.quantity === 1 ? (
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          size={14}
                          color={ACCENT}
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={MinusSignIcon}
                          size={14}
                          color="#262B33"
                        />
                      )}
                    </Pressable>

                    <Text className="min-w-[28px] text-center font-numeric text-[13px] text-secondary">
                      {item.quantity}
                    </Text>

                    <Pressable
                      onPress={() => incrementItem(item.foodItem._id)}
                      className="w-7 h-7 rounded-full items-center justify-center bg-white"
                      accessibilityLabel="Increase quantity"
                    >
                      <HugeiconsIcon
                        icon={Add01Icon}
                        size={14}
                        color="#262B33"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Sticky Bottom Bar — Full-width Ink CTA with Total Docked */}
          <View
            className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3 border-t border-gray-100"
            style={{
              paddingBottom: insets.bottom + 12,
              boxShadow: "0px -4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <GestureDetector gesture={checkoutTap}>
              <Animated.View
                accessibilityRole="button"
                accessibilityLabel="Proceed to checkout"
                className="h-14 w-full flex-row items-center justify-between px-6 bg-secondary rounded-full"
                style={checkoutStyle}
              >
                <ButtonText className="font-label text-[15px]">
                  Proceed to Checkout
                </ButtonText>
                <ButtonText className="font-numeric text-[16px]">
                  ₦{total.toLocaleString()}
                </ButtonText>
              </Animated.View>
            </GestureDetector>
          </View>
        </View>
      )}

      {/* Notes Modal */}
      <Modal
        visible={notesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotesModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-white rounded-[24px] p-6">
            <Text className="text-lg font-title text-secondary mb-2">
              Delivery Instructions
            </Text>
            <Text className="text-xs font-body text-text-gray mb-4">
              Add notes for the rider or restaurant (e.g. gate code, leave at door).
            </Text>
            <TextInput
              placeholder="Enter delivery instructions..."
              placeholderTextColor="#A0A5BA"
              value={deliveryInstructions}
              onChangeText={setDeliveryInstructions}
              className="bg-surface-muted rounded-2xl p-4 font-body text-sm text-secondary min-h-[90px] text-top mb-5"
              multiline
            />
            <Pressable
              onPress={() => setNotesModalVisible(false)}
              className="w-full h-12 bg-secondary rounded-full items-center justify-center"
            >
              <Text className="text-white font-label text-sm">Save Notes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Promo Modal */}
      <Modal
        visible={promoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPromoModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-white rounded-[24px] p-6">
            <Text className="text-lg font-title text-secondary mb-2">
              Add Promo Code
            </Text>
            <Text className="text-xs font-body text-text-gray mb-4">
              Enter code WELCOME for 15% off your order.
            </Text>
            <TextInput
              placeholder="e.g. WELCOME"
              placeholderTextColor="#A0A5BA"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              className="bg-surface-muted rounded-2xl p-4 font-body text-sm text-secondary uppercase font-title mb-5"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setAppliedPromo(null);
                  setPromoCode("");
                  setPromoModalVisible(false);
                }}
                className="flex-1 h-12 bg-surface-muted rounded-full items-center justify-center"
              >
                <Text className="text-secondary font-label text-sm">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (promoCode.trim().toUpperCase() === "WELCOME") {
                    setAppliedPromo("WELCOME");
                  }
                  setPromoModalVisible(false);
                }}
                className="flex-1 h-12 bg-primary rounded-full items-center justify-center"
              >
                <Text className="text-white font-label text-sm">Apply Code</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
