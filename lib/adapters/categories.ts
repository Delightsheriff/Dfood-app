import { Category } from "@/types/api";

// TODO(phase4): add attribution for restaurant/food data sources
//
// Phase 2 curated category list. Each entry pairs a Yelp category alias
// (used to browse real restaurants) with a TheMealDB category whose meals
// stand in for the category's food items.
const CURATED_CATEGORY_DEFS = [
  { yelpAlias: "pizza", name: "Pizza", mealDbCategory: "Pasta" },
  { yelpAlias: "burgers", name: "Burgers", mealDbCategory: "Beef" },
  { yelpAlias: "sushi", name: "Sushi", mealDbCategory: "Seafood" },
  { yelpAlias: "italian", name: "Italian", mealDbCategory: "Pasta" },
  { yelpAlias: "chinese", name: "Chinese", mealDbCategory: "Pork" },
  { yelpAlias: "mexican", name: "Mexican", mealDbCategory: "Chicken" },
  {
    yelpAlias: "breakfast_brunch",
    name: "Breakfast",
    mealDbCategory: "Breakfast",
  },
  { yelpAlias: "desserts", name: "Desserts", mealDbCategory: "Dessert" },
  { yelpAlias: "vegan", name: "Vegan", mealDbCategory: "Vegan" },
  { yelpAlias: "chicken_wings", name: "Chicken", mealDbCategory: "Chicken" },
] as const;

// Fixed timestamps; no screen renders category createdAt/updatedAt.
const CREATED_AT = "2026-01-01T00:00:00.000Z";

export const CURATED_CATEGORIES: Category[] = CURATED_CATEGORY_DEFS.map(
  (def) => ({
    _id: def.yelpAlias,
    name: def.name,
    image: `https://www.themealdb.com/images/category/${def.mealDbCategory.toLowerCase()}.png`,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  }),
);

export const CATEGORY_TO_MEALDB: Record<string, string> = Object.fromEntries(
  CURATED_CATEGORY_DEFS.map((def) => [def.yelpAlias, def.mealDbCategory]),
);
