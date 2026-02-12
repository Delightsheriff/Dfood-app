// import { Button } from "@/components/ui/button";
// import { useFoodItem } from "@/hooks/useDataQueries";
// import { useCartStore } from "@/store/cartStore";
// import { Image } from "expo-image";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import {
//   ChevronLeft,
//   Clock,
//   Heart,
//   Minus,
//   Plus,
//   Star,
// } from "lucide-react-native";
// import { useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Carousel from "react-native-reanimated-carousel";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// export default function FoodDetails() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const [quantity, setQuantity] = useState(1);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [activeImageIndex, setActiveImageIndex] = useState(0);

//   const { data: foodData, isLoading: foodLoading } = useFoodItem(id);
//   const food = foodData?.data.foodItem;

//   // Extract restaurant data from food item (it's populated in the response)
//   const restaurant =
//     food?.restaurantId && typeof food.restaurantId === "object"
//       ? food.restaurantId
//       : null;

//   // Cart store
//   const addToCart = useCartStore((state) => state.addItem);
//   const currentRestaurantId = useCartStore((state) => state.getRestaurantId());

//   if (foodLoading) {
//     return (
//       <View className="flex-1 bg-white items-center justify-center">
//         <ActivityIndicator size="large" color="#FF7622" />
//       </View>
//     );
//   }

//   if (!food) {
//     return (
//       <View className="flex-1 bg-white items-center justify-center">
//         <Text className="text-text-gray font-sen">Food item not found</Text>
//       </View>
//     );
//   }

//   const totalPrice = food.price * quantity;

//   const handleAddToCart = () => {
//     if (!food) return;

//     // Check if we have restaurant data
//     if (!restaurant) return;

//     // Warn if switching restaurants
//     if (currentRestaurantId && currentRestaurantId !== restaurant._id) {
//       Alert.alert(
//         "Switch Restaurant?",
//         "Your cart contains items from another restaurant. Adding this item will clear your current cart.",
//         [
//           { text: "Cancel", style: "cancel" },
//           {
//             text: "Continue",
//             onPress: () => {
//               addToCart({
//                 foodItem: food,
//                 quantity,
//                 restaurantId: restaurant._id,
//                 restaurantName: restaurant.name,
//               });
//               router.back();
//             },
//           },
//         ],
//       );
//       return;
//     }

//     addToCart({
//       foodItem: food,
//       quantity,
//       restaurantId: restaurant._id,
//       restaurantName: restaurant.name,
//     });
//     router.back();
//   };

//   return (
//     <View className="flex-1 bg-white">
//       {/* Image Carousel */}
//       <View className="h-[280px] relative">
//         <Carousel
//           loop={false}
//           width={SCREEN_WIDTH}
//           height={280}
//           data={food.images}
//           onSnapToItem={(index) => setActiveImageIndex(index)}
//           renderItem={({ item }) => (
//             <Image
//               source={{ uri: item }}
//               className="w-full h-full"
//               contentFit="cover"
//               style={{ width: "100%", height: "100%" }}
//               transition={200}
//             />
//           )}
//         />

//         {/* Navigation Buttons */}
//         <View className="absolute top-12 left-6 right-6 flex-row items-center justify-between">
//           <TouchableOpacity
//             onPress={() => router.back()}
//             className="w-11 h-11 bg-white/90 rounded-full items-center justify-center"
//           >
//             <ChevronLeft color="#181C2E" size={22} />
//           </TouchableOpacity>

//           {/* Favorite Button */}
//           <TouchableOpacity
//             onPress={() => setIsFavorite(!isFavorite)}
//             className="w-12 h-12 bg-white rounded-full items-center justify-center"
//             style={{
//               shadowColor: "#000",
//               shadowOffset: { width: 0, height: 2 },
//               shadowOpacity: 0.1,
//               shadowRadius: 8,
//               elevation: 4,
//             }}
//           >
//             <Heart
//               color={isFavorite ? "#FF7622" : "#181C2E"}
//               size={22}
//               fill={isFavorite ? "#FF7622" : "transparent"}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Pagination Dots */}
//         {food.images.length > 1 && (
//           <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center gap-2">
//             {food.images.map((_, index) => (
//               <View
//                 key={index}
//                 className={`h-2 w-2 rounded-full ${
//                   index === activeImageIndex
//                     ? "bg-white border-2 border-white"
//                     : "bg-white/50"
//                 }`}
//               />
//             ))}
//           </View>
//         )}
//       </View>

//       {/* Content Sheet */}
//       <View className="flex-1 bg-white -mt-[30px] rounded-t-[30px]">
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32 }}
//         >
//           {/* Restaurant Badge */}
//           {restaurant && (
//             <View className="mb-4">
//               <View className="self-start flex-row items-center bg-white border border-[#F0F5FA] rounded-full px-4 py-2">
//                 <View className="w-2 h-2 bg-primary rounded-full mr-2" />
//                 <Text className="text-secondary font-sen text-sm">
//                   {restaurant.name}
//                 </Text>
//               </View>
//             </View>
//           )}

//           {/* Food Name & Description */}
//           <View className="mb-4">
//             <Text className="text-2xl font-sen-bold text-secondary mb-2">
//               {food.name}
//             </Text>
//             <Text className="text-text-gray font-sen text-sm leading-5">
//               {food.description}
//             </Text>
//           </View>

//           {/* Rating, Delivery, Time */}
//           <View className="flex-row items-center mb-6">
//             <View className="flex-row items-center mr-6">
//               <Star color="#FF7622" size={18} fill="#FF7622" />
//               <Text className="ml-1.5 font-sen-bold text-secondary text-sm">
//                 {food.rating > 0 ? food.rating.toFixed(1) : "4.5"}
//               </Text>
//             </View>

//             {restaurant && (
//               <>
//                 <View className="flex-row items-center mr-6">
//                   <Text className="ml-1.5 font-sen text-secondary text-xs">
//                     ₦
//                     {restaurant.deliveryFee === 0
//                       ? "Free"
//                       : restaurant.deliveryFee}
//                   </Text>
//                 </View>

//                 <View className="flex-row items-center mr-6">
//                   <Clock color="#FF7622" size={18} />
//                   <Text className="ml-1.5 font-sen text-secondary text-xs">
//                     Currently {restaurant.status}
//                   </Text>
//                 </View>

//                 <View className="flex-row items-center">
//                   <Clock color="#FF7622" size={18} />
//                   <Text className="ml-1.5 font-sen text-secondary text-xs">
//                     {restaurant.openingTime} - {restaurant.closingTime}
//                   </Text>
//                 </View>
//               </>
//             )}
//           </View>

//           {/* Calories */}
//           {food.calories && (
//             <View className="mb-6">
//               <Text className="text-base font-sen-bold text-secondary mb-2">
//                 NUTRITIONAL INFO
//               </Text>
//               <View className="flex-row items-center bg-[#FFF5EE] rounded-xl px-4 py-3">
//                 <Text className="text-2xl mr-2">🔥</Text>
//                 <Text className="text-secondary font-sen">
//                   {food.calories} calories
//                 </Text>
//               </View>
//             </View>
//           )}
//         </ScrollView>
//       </View>

//       {/* Bottom Bar */}
//       <View className="px-6 py-4 border-t border-[#F0F5FA] bg-white">
//         <View className="flex-row items-center justify-between">
//           <Text className="text-3xl font-sen-bold text-secondary">
//             ₦{totalPrice.toLocaleString()}
//           </Text>

//           <View className="flex-row items-center bg-secondary rounded-full">
//             <TouchableOpacity
//               onPress={() => setQuantity(Math.max(1, quantity - 1))}
//               className="w-12 h-12 items-center justify-center"
//             >
//               <Minus color="white" size={20} />
//             </TouchableOpacity>

//             <Text className="text-white font-sen-bold text-lg px-4">
//               {quantity}
//             </Text>

//             <TouchableOpacity
//               onPress={() => setQuantity(quantity + 1)}
//               className="w-12 h-12 items-center justify-center"
//             >
//               <Plus color="white" size={20} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <Button
//           className="w-full mt-4 h-14"
//           onPress={handleAddToCart}
//           disabled={!restaurant || restaurant.status !== "Open"}
//         >
//           <Text className="text-white font-sen-bold uppercase tracking-wide">
//             Add to Cart
//           </Text>
//         </Button>
//       </View>
//     </View>
//   );
// }

import { Button } from "@/components/ui/button";
import { useCheckFavorite, useFoodItem } from "@/hooks/useDataQueries";
import {
  useAddFavorite,
  useRemoveFavorite,
} from "@/hooks/useFavoriteMutations";
import { useCartStore } from "@/store/cartStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Heart,
  Minus,
  Plus,
  Star,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FoodDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: foodData, isLoading: foodLoading } = useFoodItem(id);
  const { data: favoriteCheck } = useCheckFavorite(id);
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const food = foodData?.data.foodItem;
  const isFavorite = favoriteCheck?.data.isFavorite || false;

  // Extract restaurant data from food item (it's populated in the response)
  const restaurant =
    food?.restaurantId && typeof food.restaurantId === "object"
      ? food.restaurantId
      : null;

  // Cart store
  const addToCart = useCartStore((state) => state.addItem);
  const currentRestaurantId = useCartStore((state) => state.getRestaurantId());

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteMutation.mutate(id, {
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to remove from favorites";
          Alert.alert("Error", message);
        },
      });
    } else {
      addFavoriteMutation.mutate(id, {
        onError: (error: any) => {
          const message =
            error.response?.data?.message || "Failed to add to favorites";
          Alert.alert("Error", message);
        },
      });
    }
  };

  if (foodLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  if (!food) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-text-gray font-sen">Food item not found</Text>
      </View>
    );
  }

  const totalPrice = food.price * quantity;

  const handleAddToCart = () => {
    if (!food || !restaurant) return;

    // Warn if switching restaurants
    if (currentRestaurantId && currentRestaurantId !== restaurant._id) {
      Alert.alert(
        "Switch Restaurant?",
        "Your cart contains items from another restaurant. Adding this item will clear your current cart.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              addToCart({
                foodItem: food,
                quantity,
                restaurantId: restaurant._id,
                restaurantName: restaurant.name,
              });
              router.back();
            },
          },
        ],
      );
      return;
    }

    addToCart({
      foodItem: food,
      quantity,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Image Carousel */}
      <View className="h-[280px] relative">
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={280}
          data={food.images}
          onSnapToItem={(index) => setActiveImageIndex(index)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              className="w-full h-full"
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              transition={200}
            />
          )}
        />

        {/* Navigation Buttons */}
        <View className="absolute top-12 left-6 right-6 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 bg-white/90 rounded-full items-center justify-center"
          >
            <ChevronLeft color="#181C2E" size={22} />
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={
              addFavoriteMutation.isPending || removeFavoriteMutation.isPending
            }
            className="w-12 h-12 bg-white rounded-full items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {addFavoriteMutation.isPending ||
            removeFavoriteMutation.isPending ? (
              <ActivityIndicator size="small" color="#FF7622" />
            ) : (
              <Heart
                color={isFavorite ? "#FF7622" : "#181C2E"}
                size={22}
                fill={isFavorite ? "#FF7622" : "transparent"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Pagination Dots */}
        {food.images.length > 1 && (
          <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center gap-2">
            {food.images.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === activeImageIndex
                    ? "bg-white border-2 border-white"
                    : "bg-white/50"
                }`}
              />
            ))}
          </View>
        )}
      </View>

      {/* Content Sheet */}
      <View className="flex-1 bg-white -mt-[30px] rounded-t-[30px]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32 }}
        >
          {/* Restaurant Badge */}
          {restaurant && (
            <View className="mb-4">
              <View className="self-start flex-row items-center bg-white border border-[#F0F5FA] rounded-full px-4 py-2">
                <View className="w-2 h-2 bg-primary rounded-full mr-2" />
                <Text className="text-secondary font-sen text-sm">
                  {restaurant.name}
                </Text>
              </View>
            </View>
          )}

          {/* Food Name & Description */}
          <View className="mb-4">
            <Text className="text-2xl font-sen-bold text-secondary mb-2">
              {food.name}
            </Text>
            <Text className="text-text-gray font-sen text-sm leading-5">
              {food.description}
            </Text>
          </View>

          {/* Rating, Delivery, Time */}
          <View className="flex-row items-center mb-6">
            <View className="flex-row items-center mr-6">
              <Star color="#FF7622" size={18} fill="#FF7622" />
              <Text className="ml-1.5 font-sen-bold text-secondary text-sm">
                4.5
              </Text>
            </View>

            {restaurant && (
              <>
                <View className="flex-row items-center mr-6">
                  <Text className="ml-1.5 font-sen text-secondary text-xs">
                    ₦
                    {restaurant.deliveryFee === 0
                      ? "Free"
                      : restaurant.deliveryFee}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Clock color="#FF7622" size={18} />
                  <Text className="ml-1.5 font-sen text-secondary text-xs">
                    {restaurant.openingTime} - {restaurant.closingTime}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Calories */}
          {food.calories && (
            <View className="mb-6">
              <Text className="text-base font-sen-bold text-secondary mb-2">
                NUTRITIONAL INFO
              </Text>
              <View className="flex-row items-center bg-[#FFF5EE] rounded-xl px-4 py-3">
                <Text className="text-2xl mr-2">🔥</Text>
                <Text className="text-secondary font-sen">
                  {food.calories} calories
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Bar */}
      <View className="px-6 py-4 border-t border-[#F0F5FA] bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-sen-bold text-secondary">
            ₦{totalPrice.toLocaleString()}
          </Text>

          <View className="flex-row items-center bg-secondary rounded-full">
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 items-center justify-center"
            >
              <Minus color="white" size={20} />
            </TouchableOpacity>

            <Text className="text-white font-sen-bold text-lg px-4">
              {quantity}
            </Text>

            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              className="w-12 h-12 items-center justify-center"
            >
              <Plus color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          className="w-full mt-4 h-14"
          onPress={handleAddToCart}
          disabled={!restaurant}
        >
          <Text className="text-white font-sen-bold uppercase tracking-wide">
            Add to Cart
          </Text>
        </Button>
      </View>
    </View>
  );
}
