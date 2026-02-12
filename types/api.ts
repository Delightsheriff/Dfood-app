import { UserRole } from "./auth";

export type Category = {
  _id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type Restaurant = {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  deliveryFee: number;
  openingTime: string;
  closingTime: string;
  isOpen?: boolean;
  status?: string; // "Open" | "Closed"
  images: string[];
  owner: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
};

export type FoodItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  calories?: number;
  restaurantId: string | Restaurant;
  categories?: string[];
  categoryIds?: string[];
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
};

export type SearchRestaurant = {
  _id: string;
  name: string;
  openingTime: string;
  closingTime: string;
  status: "Open" | "Closed";
  description?: string;
  address?: string;
  deliveryFee: number;
  imageUrls: string[];
};

export type SearchFoodItem = FoodItem & {
  restaurant: {
    _id: string;
    name: string;
    images: string[];
    address: string;
    deliveryFee: number;
    openingTime: string;
    closingTime: string;
    rating: number;
    totalReviews: number;
    status: "Open" | "Closed";
  };
};
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  phone?: string;
};

export type FavoriteItem = {
  _id: string;
  foodItem: FoodItem & {
    restaurant: {
      _id: string;
      name: string;
      images: string[];
      address: string;
      deliveryFee: number;
      openingTime: string;
      closingTime: string;
      rating: number;
      totalReviews: number;
      status: "Open" | "Closed";
    } | null;
  };
  createdAt: string;
};

export type Address = {
  _id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressesResponse = {
  success: true;
  data: {
    addresses: Address[];
  };
};

export type AddressResponse = {
  success: true;
  data: {
    address: Address;
  };
};

export type CreateAddressRequest = {
  label: string;
  street: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type UpdateAddressRequest = Partial<CreateAddressRequest>;

export type FavoritesResponse = {
  success: true;
  data: {
    favorites: FavoriteItem[];
  };
};

export type FavoriteCheckResponse = {
  success: true;
  data: {
    isFavorite: boolean;
  };
};

export type ProfileResponse = {
  success: true;
  data: {
    profile: UserProfile;
  };
};

export type UpdateProfileRequest = {
  name?: string;
  phone?: string;
};

// API response types
export type CategoriesResponse = {
  success: true;
  data: {
    categories: Category[];
  };
};

export type RestaurantsResponse = {
  success: true;
  data: {
    restaurants: Restaurant[];
  };
};

export type RestaurantResponse = {
  success: true;
  data: {
    restaurant: Restaurant;
  };
};

export type FoodItemsResponse = {
  success: true;
  data: {
    foodItems: FoodItem[];
  };
};

export type FoodItemResponse = {
  success: true;
  data: {
    foodItem: FoodItem;
  };
};

export type SearchResponse = {
  success: true;
  data: {
    foods: SearchFoodItem[];
    restaurants: SearchRestaurant[];
  };
};
