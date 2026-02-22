import { apiClient } from "@/lib/api-client";
import {
  AddressesResponse,
  AddressResponse,
  CategoriesResponse,
  CreateAddressRequest,
  CreateOrderRequest,
  FavoriteCheckResponse,
  FavoritesResponse,
  FoodItemResponse,
  FoodItemsResponse,
  OrderResponse,
  OrdersResponse,
  PaymentMethodResponse,
  PaymentMethodsResponse,
  ProfileResponse,
  RestaurantResponse,
  RestaurantsResponse,
  SearchResponse,
  UpdateAddressRequest,
  UpdateProfileRequest,
} from "@/types/api";
import { AxiosResponse } from "axios";

export const dataService = {
  /**
   * Get all categories
   * GET /categories
   */
  async getCategories(): Promise<CategoriesResponse> {
    const response: AxiosResponse<CategoriesResponse> =
      await apiClient.get("/categories");
    return response.data;
  },

  /**
   * Get all restaurants
   * GET /restaurants?isOpen=true
   */
  async getRestaurants(isOpen?: boolean): Promise<RestaurantsResponse> {
    const response: AxiosResponse<RestaurantsResponse> = await apiClient.get(
      "/restaurants",
      {
        params: isOpen !== undefined ? { isOpen } : undefined,
      },
    );
    return response.data;
  },

  /**
   * Get restaurant by ID
   * GET /restaurants/:id
   */
  async getRestaurantById(id: string): Promise<RestaurantResponse> {
    const response: AxiosResponse<RestaurantResponse> = await apiClient.get(
      `/restaurants/${id}`,
    );
    return response.data;
  },

  /**
   * Get food items by restaurant
   * GET /food-items/restaurant/:restaurantId
   */
  async getFoodItemsByRestaurant(
    restaurantId: string,
  ): Promise<FoodItemsResponse> {
    const response: AxiosResponse<FoodItemsResponse> = await apiClient.get(
      `/food-items/restaurant/${restaurantId}`,
    );
    return response.data;
  },

  /**
   * Get food items by category
   * GET /food-items/category/:categoryId
   */
  async getFoodItemsByCategory(categoryId: string): Promise<FoodItemsResponse> {
    const response: AxiosResponse<FoodItemsResponse> = await apiClient.get(
      `/food-items/category/${categoryId}`,
    );
    return response.data;
  },

  /**
   * Get food item by ID
   * GET /food-items/:id
   */
  async getFoodItemById(id: string): Promise<FoodItemResponse> {
    const response: AxiosResponse<FoodItemResponse> = await apiClient.get(
      `/food-items/${id}`,
    );
    return response.data;
  },

  /**
   * Search for food items and restaurants
   * GET /search?q=pizza
   */
  async search(query: string): Promise<SearchResponse> {
    const response: AxiosResponse<SearchResponse> = await apiClient.get(
      "/search",
      {
        params: { q: query },
      },
    );
    return response.data;
  },

  /**
   * Get user profile
   * GET /profile
   */
  async getProfile(): Promise<ProfileResponse> {
    const response: AxiosResponse<ProfileResponse> =
      await apiClient.get("/profile");
    return response.data;
  },

  /**
   * Update user profile
   * PATCH /profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const response: AxiosResponse<ProfileResponse> = await apiClient.patch(
      "/profile",
      data,
    );
    return response.data;
  },

  /**
   * Update profile image
   * POST /profile/image
   */
  async updateProfileImage(imageFile: FormData): Promise<ProfileResponse> {
    const response: AxiosResponse<ProfileResponse> = await apiClient.post(
      "/profile/image",
      imageFile,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Delete profile image
   * DELETE /profile/image
   */
  async deleteProfileImage(): Promise<ProfileResponse> {
    const response: AxiosResponse<ProfileResponse> =
      await apiClient.delete("/profile/image");
    return response.data;
  },

  /**
   * Get user favorites
   * GET /favorites
   */
  async getFavorites(): Promise<FavoritesResponse> {
    const response: AxiosResponse<FavoritesResponse> =
      await apiClient.get("/favorites");
    return response.data;
  },

  /**
   * Add food item to favorites
   * POST /favorites/:foodItemId
   */
  async addFavorite(
    foodItemId: string,
  ): Promise<{ success: true; message: string }> {
    const response = await apiClient.post(`/favorites/${foodItemId}`);
    return response.data;
  },

  /**
   * Remove food item from favorites
   * DELETE /favorites/:foodItemId
   */
  async removeFavorite(
    foodItemId: string,
  ): Promise<{ success: true; message: string }> {
    const response = await apiClient.delete(`/favorites/${foodItemId}`);
    return response.data;
  },

  /**
   * Check if food item is favorited
   * GET /favorites/:foodItemId/check
   */
  async checkFavorite(foodItemId: string): Promise<FavoriteCheckResponse> {
    const response: AxiosResponse<FavoriteCheckResponse> = await apiClient.get(
      `/favorites/${foodItemId}/check`,
    );
    return response.data;
  },

  /**
   * Get all addresses
   * GET /addresses
   */
  async getAddresses(): Promise<AddressesResponse> {
    const response: AxiosResponse<AddressesResponse> =
      await apiClient.get("/addresses");
    return response.data;
  },

  /**
   * Get default address
   * GET /addresses/default
   */
  async getDefaultAddress(): Promise<AddressResponse> {
    const response: AxiosResponse<AddressResponse> =
      await apiClient.get("/addresses/default");
    return response.data;
  },

  /**
   * Get address by ID
   * GET /addresses/:id
   */
  async getAddressById(id: string): Promise<AddressResponse> {
    const response: AxiosResponse<AddressResponse> = await apiClient.get(
      `/addresses/${id}`,
    );
    return response.data;
  },

  /**
   * Create address
   * POST /addresses
   */
  async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    const response: AxiosResponse<AddressResponse> = await apiClient.post(
      "/addresses",
      data,
    );
    return response.data;
  },

  /**
   * Update address
   * PATCH /addresses/:id
   */
  async updateAddress(
    id: string,
    data: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    const response: AxiosResponse<AddressResponse> = await apiClient.patch(
      `/addresses/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Set default address
   * PATCH /addresses/:id/default
   */
  async setDefaultAddress(id: string): Promise<AddressResponse> {
    const response: AxiosResponse<AddressResponse> = await apiClient.patch(
      `/addresses/${id}/default`,
    );
    return response.data;
  },

  /**
   * Delete address
   * DELETE /addresses/:id
   */
  async deleteAddress(id: string): Promise<{ success: true; message: string }> {
    const response = await apiClient.delete(`/addresses/${id}`);
    return response.data;
  },

  /**
   * Get all payment methods
   * GET /payment-methods
   */
  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    const response: AxiosResponse<PaymentMethodsResponse> =
      await apiClient.get("/payment-methods");
    return response.data;
  },

  /**
   * Get default payment method
   * GET /payment-methods/default
   */
  async getDefaultPaymentMethod(): Promise<PaymentMethodResponse> {
    const response: AxiosResponse<PaymentMethodResponse> = await apiClient.get(
      "/payment-methods/default",
    );
    return response.data;
  },

  /**
   * Add card payment method
   * POST /payment-methods/card
   */
  async addCard(reference: string): Promise<PaymentMethodResponse> {
    const response: AxiosResponse<PaymentMethodResponse> = await apiClient.post(
      "/payment-methods/card",
      { reference },
    );
    return response.data;
  },

  /**
   * Set default payment method
   * PATCH /payment-methods/:id/default
   */
  async setDefaultPaymentMethod(id: string): Promise<PaymentMethodResponse> {
    const response: AxiosResponse<PaymentMethodResponse> =
      await apiClient.patch(`/payment-methods/${id}/default`);
    return response.data;
  },

  /**
   * Delete payment method
   * DELETE /payment-methods/:id
   */
  async deletePaymentMethod(
    id: string,
  ): Promise<{ success: true; message: string }> {
    const response = await apiClient.delete(`/payment-methods/${id}`);
    return response.data;
  },

  /**
   * Create order
   * POST /orders
   */
  // async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
  //   const response: AxiosResponse<OrderResponse> = await apiClient.post(
  //     "/orders",
  //     data,
  //   );
  //   return response.data;
  // },
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await apiClient.post(
      "/orders", // Make sure this matches your backend route
      data,
    );
    return response.data;
  },

  /**
   * Get user's orders
   * GET /orders
   */
  async getOrders(): Promise<OrdersResponse> {
    const response: AxiosResponse<OrdersResponse> =
      await apiClient.get("/orders");
    return response.data;
  },

  /**
   * Get order by ID
   * GET /orders/:id
   */
  async getOrderById(id: string): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await apiClient.get(
      `/orders/${id}`,
    );
    return response.data;
  },

  /**
   * Get order by order number
   * GET /orders/number/:orderNumber
   */
  async getOrderByNumber(orderNumber: string): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await apiClient.get(
      `/orders/number/${orderNumber}`,
    );
    return response.data;
  },

  /**
   * Cancel order
   * PATCH /orders/:id/cancel
   */
  async cancelOrder(id: string): Promise<OrderResponse> {
    const response: AxiosResponse<OrderResponse> = await apiClient.patch(
      `/orders/${id}/cancel`,
    );
    return response.data;
  },
};
