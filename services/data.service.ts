import { useProfileStore } from "@/store/profileStore";
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
  restaurantFromOsmElement,
} from "@/lib/adapters/restaurant";
import { mealDbService } from "@/services/mealdb.service";
import { osmService } from "@/services/osm.service";
import {
  CategoriesResponse,
  FoodItemResponse,
  FoodItemsResponse,
  ProfileResponse,
  Restaurant,
  RestaurantResponse,
  RestaurantsResponse,
  SearchResponse,
  UpdateProfileRequest,
  UserProfile,
  UserRole,
} from "@/types/api";

const MEALDB_SEARCH_LIMIT = 10;
const RESTAURANT_SEARCH_LIMIT = 20;

// TODO(phase4): decide profile behavior without a backend. Phase 2
// returns a minimal local placeholder profile so screens render
// without network access.
const PLACEHOLDER_PROFILE: UserProfile = {
  id: "local-user",
  name: "Guest",
  email: "guest@dfood.local",
  role: UserRole.CUSTOMER,
};

// The OSM restaurant list is fetched once per session and reused for
// category browsing and search; Overpass is not called per category.
let cachedRestaurants: Restaurant[] | null = null;

async function ensureRestaurants(): Promise<Restaurant[]> {
  if (!cachedRestaurants) {
    const elements = await osmService.searchRestaurants();
    cachedRestaurants = elements.map(restaurantFromOsmElement);
  }
  return cachedRestaurants;
}

// Resolves a restaurant for food-item fabrication. Curated ids map to
// their category placeholder; OSM refs resolve from the session cache,
// falling back to a placeholder when an id arrived via a deep link.
async function getRestaurantForFoods(
  restaurantId: string,
): Promise<Restaurant> {
  if (restaurantId.startsWith("curated-")) {
    const categoryId = restaurantId.slice("curated-".length);
    const categoryName =
      CURATED_CATEGORIES.find((category) => category._id === categoryId)
        ?.name ?? categoryId;
    return placeholderRestaurant(restaurantId, categoryName);
  }

  const cached = cachedRestaurants?.find(
    (restaurant) => restaurant._id === restaurantId,
  );
  if (cached) {
    return cached;
  }

  const restaurants = await ensureRestaurants();
  return (
    restaurants.find((restaurant) => restaurant._id === restaurantId) ??
    placeholderRestaurant(restaurantId, restaurantId)
  );
}

async function searchRestaurants(query: string): Promise<Restaurant[]> {
  const normalized = query.trim().toLowerCase();
  const restaurants = await ensureRestaurants();
  if (!normalized) {
    return restaurants.slice(0, RESTAURANT_SEARCH_LIMIT);
  }
  return restaurants
    .filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(normalized) ||
        restaurant.cuisineTags?.some((tag) =>
          tag.toLowerCase().includes(normalized),
        ),
    )
    .slice(0, RESTAURANT_SEARCH_LIMIT);
}

export const dataService = {
  /**
   * Get curated restaurant categories (static Phase 2 list pairing
   * OSM `cuisine` tag values with TheMealDB menu categories).
   */
  async getCategories(): Promise<CategoriesResponse> {
    return { success: true, data: { categories: CURATED_CATEGORIES } };
  },

  /**
   * Get restaurants near the user, optionally filtered by open state.
   * The list is fetched once per session and reused by category
   * browsing and search.
   */
  async getRestaurants(isOpen?: boolean): Promise<RestaurantsResponse> {
    const restaurants = await ensureRestaurants();
    const filtered =
      isOpen === undefined
        ? restaurants
        : restaurants.filter((restaurant) => restaurant.isOpen === isOpen);
    return { success: true, data: { restaurants: filtered } };
  },

  /**
   * Get a restaurant by ID. Curated category placeholders (prefixed with
   * `curated-`) resolve to their category restaurant instead of OSM.
   */
  async getRestaurantById(id: string): Promise<RestaurantResponse> {
    if (id.startsWith("curated-")) {
      const categoryId = id.slice("curated-".length);
      const categoryName =
        CURATED_CATEGORIES.find((category) => category._id === categoryId)
          ?.name ?? categoryId;
      return {
        success: true,
        data: { restaurant: placeholderRestaurant(id, categoryName) },
      };
    }

    const restaurants = await ensureRestaurants();
    const restaurant = restaurants.find((candidate) => candidate._id === id);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    return { success: true, data: { restaurant } };
  },

  /**
   * Get a restaurant's menu. TheMealDB meals stand in for real menu items,
   * picked deterministically from the restaurant's hashed ID.
   */
  async getFoodItemsByRestaurant(
    restaurantId: string,
  ): Promise<FoodItemsResponse> {
    const mealDbCategory = mealDbCategoryForRestaurant(restaurantId);
    const restaurant = await getRestaurantForFoods(restaurantId);
    const { meals } = await mealDbService.getMealsByCategory(mealDbCategory);
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
   * where restaurantId is an OSM ref or a `curated-` alias.
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
    const restaurant = await getRestaurantForFoods(restaurantId);
    return {
      success: true,
      data: { foodItem: mealToFoodItem(meal, restaurant, category) },
    };
  },

  /**
   * Search restaurants (filtering the session's OSM list by name or
   * cuisine) and dishes (TheMealDB).
   */
  async search(query: string): Promise<SearchResponse> {
    const [restaurants, mealResults] = await Promise.all([
      searchRestaurants(query),
      mealDbService.searchMeals(query),
    ]);

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

  async getProfile(): Promise<ProfileResponse> {
    const profile = useProfileStore.getState().getProfile();
    return { success: true, data: { profile } };
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    if (data.name) {
      useProfileStore.getState().setName(data.name);
    }
    const profile = useProfileStore.getState().getProfile();
    return { success: true, data: { profile } };
  },

  async updateProfileImage(_imageFile: FormData): Promise<ProfileResponse> {
    return { success: true, data: { profile: PLACEHOLDER_PROFILE } };
  },

  async deleteProfileImage(): Promise<ProfileResponse> {
    return { success: true, data: { profile: PLACEHOLDER_PROFILE } };
  },
};
