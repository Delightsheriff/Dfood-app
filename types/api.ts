export type Category = {
  _id: string;
  name: string;
  imageUrl: string;
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
  isOpen: boolean;
  imageUrls: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
};

export type FoodItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  calories?: number;
  restaurant: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
};

// API Response wrappers
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

export type FoodItemsResponse = {
  success: true;
  data: {
    foodItems: FoodItem[];
  };
};
