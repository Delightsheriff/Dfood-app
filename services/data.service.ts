import { apiClient } from "@/lib/api-client";
import {
  CategoriesResponse,
  FoodItemResponse,
  FoodItemsResponse,
  ProfileResponse,
  RestaurantResponse,
  RestaurantsResponse,
  SearchResponse,
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
};
