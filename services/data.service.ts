import {
  CATEGORY_TO_MEALDB,
  CURATED_CATEGORIES,
} from "@/lib/adapters/categories";
import {
  mealDbCategoryForRestaurant,
  mealToFoodItem,
  mealToSearchFoodItem,
  pickMenuMeals,
} from "@/lib/adapters/food-item";
import {
  placeholderRestaurant,
  restaurantFromYelpBusiness,
  restaurantFromYelpDetail,
} from "@/lib/adapters/restaurant";
import { mealDbService } from "@/services/mealdb.service";
import { yelpService } from "@/services/yelp.service";
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

const MEALDB_SEARCH_LIMIT = 10;
const YELP_SEARCH_LIMIT = 20;

export const dataService = {
  /**
   * Get curated restaurant categories (static Phase 2 list pairing
   * Yelp category aliases with TheMealDB menu categories).
   */
  async getCategories(): Promise<CategoriesResponse> {
    return { success: true, data: { categories: CURATED_CATEGORIES } };
  },

  /**
   * Get restaurants near the user, filtered by open state.
   * Defaults to businesses that are currently open.
   */
  async getRestaurants(isOpen?: boolean): Promise<RestaurantsResponse> {
    const response = await yelpService.searchBusinesses({
      open_now: isOpen ?? true,
      limit: YELP_SEARCH_LIMIT,
    });
    return {
      success: true,
      data: {
        restaurants: response.businesses.map(restaurantFromYelpBusiness),
      },
    };
  },

  /**
   * Get a restaurant by Yelp business ID.
   */
  async getRestaurantById(id: string): Promise<RestaurantResponse> {
    const business = await yelpService.getBusiness(id);
    return { success: true, data: { restaurant: restaurantFromYelpDetail(business) } };
  },

  /**
   * Get a restaurant's menu. TheMealDB meals stand in for real menu items,
   * picked deterministically from the restaurant's hashed ID.
   */
  async getFoodItemsByRestaurant(
    restaurantId: string,
  ): Promise<FoodItemsResponse> {
    const mealDbCategory = mealDbCategoryForRestaurant(restaurantId);
    const [business, { meals }] = await Promise.all([
      yelpService.getBusiness(restaurantId),
      mealDbService.getMealsByCategory(mealDbCategory),
    ]);
    const restaurant = restaurantFromYelpDetail(business);
    const foodItems = pickMenuMeals(meals, restaurantId).map((meal) =>
      mealToFoodItem(meal, restaurant, mealDbCategory),
    );
    return { success: true, data: { foodItems } };
  },

  /**
   * Get food items for a curated category, mapped to its TheMealDB category.
   */
  async getFoodItemsByCategory(categoryId: string): Promise<FoodItemsResponse> {
    const mealDbCategory = CATEGORY_TO_MEALDB[categoryId];
    if (!mealDbCategory) {
      return { success: true, data: { foodItems: [] } };
    }

    const { meals } = await mealDbService.getMealsByCategory(mealDbCategory);
    const categoryName =
      CURATED_CATEGORIES.find((category) => category._id === categoryId)?.name ??
      categoryId;
    const restaurant = placeholderRestaurant(
      `curated-${categoryId}`,
      categoryName,
    );
    const foodItems = pickMenuMeals(meals, categoryId).map((meal) =>
      mealToFoodItem(meal, restaurant, mealDbCategory),
    );
    return { success: true, data: { foodItems } };
  },

  /**
   * Get a food item by its composite ID (`<restaurantId>__<mealId>`),
   * where restaurantId may be a Yelp business ID or a `curated-` alias.
   */
  async getFoodItemById(id: string): Promise<FoodItemResponse> {
    const [restaurantId, mealId] = id.split("__");
    if (!mealId) {
      throw new Error("Food item not found");
    }

    const meal = await mealDbService.getMealById(mealId);
    if (!meal) {
      throw new Error("Food item not found");
    }

    const category = meal.strCategory ?? "Miscellaneous";
    if (restaurantId.startsWith("curated-")) {
      const categoryId = restaurantId.slice("curated-".length);
      const mealDbCategory = CATEGORY_TO_MEALDB[categoryId];
      const categoryName =
        CURATED_CATEGORIES.find((c) => c._id === categoryId)?.name ??
        categoryId;
      const restaurant = placeholderRestaurant(
        restaurantId,
        categoryName,
      );
      return {
        success: true,
        data: {
          foodItem: mealToFoodItem(
            meal,
            restaurant,
            mealDbCategory ?? category,
          ),
        },
      };
    }

    const business = await yelpService.getBusiness(restaurantId);
    const restaurant = restaurantFromYelpDetail(business);
    return {
      success: true,
      data: { foodItem: mealToFoodItem(meal, restaurant, category) },
    };
  },

  /**
   * Search for dishes (TheMealDB) and restaurants (Yelp).
   */
  async search(query: string): Promise<SearchResponse> {
    const [yelpResults, mealResults] = await Promise.all([
      yelpService.searchBusinesses({ term: query, limit: YELP_SEARCH_LIMIT }),
      mealDbService.searchMeals(query),
    ]);

    const restaurants = yelpResults.businesses.map(restaurantFromYelpBusiness);
    const restaurantForFoods =
      restaurants[0] ??
      placeholderRestaurant(`mealdb-${query}`, query);

    const foods = mealResults.meals
      .slice(0, MEALDB_SEARCH_LIMIT)
      .map((meal) =>
        mealToSearchFoodItem(
          meal,
          restaurantForFoods,
          meal.strCategory ?? "Miscellaneous",
        ),
      );

    return { success: true, data: { foods, restaurants } };
  },

  // TODO(phase4): decide profile behavior without a backend. No local
  // profile design was built in Phase 2, so profile calls fail instead
  // of pretending to be real; screens degrade to guest fallbacks.
  async getProfile(): Promise<ProfileResponse> {
    throw new Error("Profile is not available in Phase 2");
  },

  async updateProfile(_data: UpdateProfileRequest): Promise<ProfileResponse> {
    throw new Error("Profile is not available in Phase 2");
  },

  async updateProfileImage(_imageFile: FormData): Promise<ProfileResponse> {
    throw new Error("Profile is not available in Phase 2");
  },

  async deleteProfileImage(): Promise<ProfileResponse> {
    throw new Error("Profile is not available in Phase 2");
  },
};
