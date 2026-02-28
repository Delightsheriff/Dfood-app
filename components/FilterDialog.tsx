import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, X } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export type FilterOptions = {
  offers: string[];
  deliveryTime: string;
  pricing: string;
  rating: number;
};

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

export default function FilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
}: FilterDialogProps) {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>("");
  const [selectedPricing, setSelectedPricing] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const offers = ["Delivery", "Pick Up", "Offer", "Online payment available"];
  const deliveryTimes = ["10-15 min", "20 min", "30 min"];
  const pricingOptions = ["$", "$$", "$$$"];
  const ratings = [1, 2, 3, 4, 5];

  const toggleOffer = (offer: string) => {
    setSelectedOffers((prev) =>
      prev.includes(offer) ? prev.filter((o) => o !== offer) : [...prev, offer],
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      offers: selectedOffers,
      deliveryTime: selectedDeliveryTime,
      pricing: selectedPricing,
      rating: selectedRating,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md bg-white rounded-[20px] p-6">
        <DialogHeader className="mb-6">
          <View className="flex-row items-center justify-between">
            <DialogTitle className="text-[#181C2E] font-sen text-[18px]">
              Filter your search
            </DialogTitle>
            <DialogClose asChild>
              <Pressable className="w-10 h-10 bg-[#F6F6F6] rounded-full items-center justify-center">
                <X size={20} color="#181C2E" />
              </Pressable>
            </DialogClose>
          </View>
        </DialogHeader>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* OFFERS */}
          <View className="mb-6">
            <Text className="text-[#32343E] font-sen text-[13px] uppercase tracking-wide mb-3">
              OFFERS
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {offers.map((offer) => (
                <Pressable
                  key={offer}
                  onPress={() => toggleOffer(offer)}
                  className={`px-4 py-2.5 rounded-full border ${
                    selectedOffers.includes(offer)
                      ? "bg-primary border-primary"
                      : "bg-white border-[#E3EBF2]"
                  }`}
                >
                  <Text
                    className={`font-sen text-[13px] ${
                      selectedOffers.includes(offer)
                        ? "text-white"
                        : "text-[#32343E]"
                    }`}
                  >
                    {offer}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* DELIVERY TIME */}
          <View className="mb-6">
            <Text className="text-[#32343E] font-sen text-[13px] uppercase tracking-wide mb-3">
              DELIVER TIME
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {deliveryTimes.map((time) => (
                <Pressable
                  key={time}
                  onPress={() => setSelectedDeliveryTime(time)}
                  className={`px-6 py-2.5 rounded-full border ${
                    selectedDeliveryTime === time
                      ? "bg-primary border-primary"
                      : "bg-white border-[#E3EBF2]"
                  }`}
                >
                  <Text
                    className={`font-sen text-[13px] ${
                      selectedDeliveryTime === time
                        ? "text-white"
                        : "text-[#32343E]"
                    }`}
                  >
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* PRICING */}
          <View className="mb-6">
            <Text className="text-[#32343E] font-sen text-[13px] uppercase tracking-wide mb-3">
              PRICING
            </Text>
            <View className="flex-row gap-3">
              {pricingOptions.map((price) => (
                <Pressable
                  key={price}
                  onPress={() => setSelectedPricing(price)}
                  className={`w-14 h-14 rounded-full items-center justify-center ${
                    selectedPricing === price ? "bg-primary" : "bg-[#F6F6F6]"
                  }`}
                >
                  <Text
                    className={`font-sen-bold text-[16px] ${
                      selectedPricing === price
                        ? "text-white"
                        : "text-[#32343E]"
                    }`}
                  >
                    {price}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* RATING */}
          <View className="mb-8">
            <Text className="text-[#32343E] font-sen text-[13px] uppercase tracking-wide mb-3">
              RATING
            </Text>
            <View className="flex-row gap-3">
              {ratings.map((rating) => (
                <Pressable
                  key={rating}
                  onPress={() => setSelectedRating(rating)}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    selectedRating >= rating ? "bg-white" : "bg-white"
                  } border ${
                    selectedRating >= rating
                      ? "border-primary"
                      : "border-[#E3EBF2]"
                  }`}
                >
                  <Star
                    size={20}
                    color="#FF7622"
                    fill={selectedRating >= rating ? "#FF7622" : "transparent"}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* FILTER BUTTON */}
          <Button
            onPress={handleApplyFilters}
            className="h-[56px] bg-primary rounded-[12px]"
          >
            <Text className="text-white font-sen-bold text-[15px] uppercase tracking-wider">
              FILTER
            </Text>
          </Button>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}
