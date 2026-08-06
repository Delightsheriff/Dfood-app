import { hashString } from "@/lib/utils";
import { MealDetail, MealSummary } from "@/services/mealdb.service";
import { FoodItem, Restaurant, SearchFoodItem } from "@/types/api";

// TODO(phase4): add attribution for restaurant/food data sources
//
// Phase 2: TheMealDB meals stand in for real menu items. TheMealDB has no
// prices, ratings, or calories, so this adapter synthesizes deterministic
// values from the restaurant and meal ids.
const MEALDB_CATEGORIES = [
  "Beef",
  "Breakfast",
  "Chicken",
  "Dessert",
  "Goat",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian",
];

const SYNTHETIC_DATE = "2026-01-01T00:00:00.000Z";

export type SearchRestaurantRef = {
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

// Deterministic TheMealDB category used to fabricate a restaurant's menu.
export function mealDbCategoryForRestaurant(restaurantId: string): string {
  return MEALDB_CATEGORIES[hashString(restaurantId) % MEALDB_CATEGORIES.length];
}

// Deterministic 8-12 item slice of a category's meals for a restaurant menu.
export function pickMenuMeals(
  meals: MealSummary[],
  restaurantId: string,
): MealSummary[] {
  const count = 8 + (hashString(restaurantId) % 5);
  const maxOffset = Math.max(0, meals.length - count);
  const offset = hashString(`${restaurantId}-menu-offset`) % (maxOffset + 1);
  return meals.slice(offset, offset + count);
}

function synthesizedDescription(
  meal: MealDetail | MealSummary,
  category: string,
): string {
  if ("strInstructions" in meal && meal.strInstructions) {
    const trimmed = meal.strInstructions.trim();
    return trimmed.length > 160
      ? `${trimmed.slice(0, 160)}...`
      : trimmed;
  }
  return `A classic ${category.toLowerCase()} dish, served fresh.`;
}

// TheMealDB lists ingredients as strIngredient1..20 paired with
// strMeasure1..20. Only MealDetail carries them (menu-list summaries
// don't), so the MealSummary-only path leaves ingredients undefined.
function ingredientsFromMeal(
  meal: MealDetail | MealSummary,
): { name: string; measure: string }[] | undefined {
  if (!("strIngredient1" in meal)) {
    return undefined;
  }
  const ingredients: { name: string; measure: string }[] = [];
  for (let index = 1; index <= 20; index++) {
    const name = meal[`strIngredient${index}`]?.trim();
    if (!name) {
      continue;
    }
    const measure = meal[`strMeasure${index}`]?.trim() ?? "";
    ingredients.push({ name, measure });
  }
  return ingredients.length > 0 ? ingredients : undefined;
}

/**
 * Maps a TheMealDB meal to a FoodItem with deterministic placeholder
 * price, rating, calories, and review count.
 */
export function mealToFoodItem(
  meal: MealDetail | MealSummary,
  restaurant: Restaurant,
  category: string,
): FoodItem {
  const hash = hashString(`${restaurant._id}-${meal.idMeal}`);

  return {
    _id: `${restaurant._id}__${meal.idMeal}`,
    name: meal.strMeal,
    description: synthesizedDescription(meal, category),
    price: ((hash % 25) + 10) * 100 + 99,
    images: [meal.strMealThumb],
    calories: ((hash % 9) + 3) * 50,
    ingredients: ingredientsFromMeal(meal),
    restaurantId: restaurant,
    categories: [category],
    categoryIds: [category],
    rating: Math.round((3.6 + (hash % 14) / 10) * 10) / 10,
    totalReviews: (hash % 180) + 20,
    createdAt: SYNTHETIC_DATE,
    updatedAt: SYNTHETIC_DATE,
  };
}

/**
 * Builds the nested restaurant shape used by SearchFoodItem from a
 * full Restaurant.
 */
export function searchRestaurantRefFromRestaurant(
  restaurant: Restaurant,
): SearchRestaurantRef {
  return {
    _id: restaurant._id,
    name: restaurant.name,
    images: restaurant.images,
    address: restaurant.address ?? "",
    deliveryFee: restaurant.deliveryFee,
    openingTime: restaurant.openingTime,
    closingTime: restaurant.closingTime,
    rating: restaurant.rating,
    totalReviews: restaurant.totalReviews,
    status: restaurant.status === "Open" ? "Open" : "Closed",
  };
}

/**
 * Placeholder restaurant used when a dish search has no matching OSM
 * restaurant to attach the food items to.
 */
export function mealToSearchFoodItem(
  meal: MealDetail,
  restaurant: Restaurant,
  category: string,
): SearchFoodItem {
  return {
    ...mealToFoodItem(meal, restaurant, category),
    restaurant: searchRestaurantRefFromRestaurant(restaurant),
  };
}
