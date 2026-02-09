import { apiClient } from "@/lib/api-client";
import {
  CategoriesResponse,
  FoodItemsResponse,
  RestaurantsResponse,
} from "@/types/api";
import { AxiosResponse } from "axios";

export const dataService = {
  /**
   * Get all categories
   * GET    /categories
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
   * Get food items by category
   * GET /food-items/category/:categoryId
   */
  async getFoodItemsByCategory(categoryId: string): Promise<FoodItemsResponse> {
    const response: AxiosResponse<FoodItemsResponse> = await apiClient.get(
      `/food-items/category/${categoryId}`,
    );
    return response.data;
  },
};
