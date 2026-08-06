import { Category } from "@/types/api";

// TODO(phase4): add attribution for restaurant/food data sources
//
// Phase 2 curated category list. Each entry pairs an OSM `cuisine` tag
// value (used to filter the already-fetched restaurant list client-side,
// not a network call per category) with a TheMealDB category whose meals
// stand in for the category's food items.
const CURATED_CATEGORY_DEFS = [
  { cuisineTags: ["pizza"], name: "Pizza", mealDbCategory: "Pasta" },
  {
    cuisineTags: ["burger", "burgers", "hamburger"],
    name: "Burgers",
    mealDbCategory: "Beef",
  },
  { cuisineTags: ["sushi"], name: "Sushi", mealDbCategory: "Seafood" },
  { cuisineTags: ["italian"], name: "Italian", mealDbCategory: "Pasta" },
  { cuisineTags: ["mexican"], name: "Mexican", mealDbCategory: "Chicken" },
  { cuisineTags: ["chinese"], name: "Chinese", mealDbCategory: "Pork" },
  {
    cuisineTags: ["breakfast"],
    name: "Breakfast",
    mealDbCategory: "Breakfast",
  },
  {
    cuisineTags: ["coffee_shop", "coffee"],
    name: "Coffee",
    mealDbCategory: "Breakfast",
  },
  { cuisineTags: ["chicken"], name: "Chicken", mealDbCategory: "Chicken" },
  {
    cuisineTags: ["dessert", "ice_cream"],
    name: "Desserts",
    mealDbCategory: "Dessert",
  },
] as const;

// Fixed timestamps; no screen renders category createdAt/updatedAt.
const CREATED_AT = "2026-01-01T00:00:00.000Z";

export const CURATED_CATEGORIES: Category[] = CURATED_CATEGORY_DEFS.map(
  (def) => ({
    _id: def.cuisineTags[0],
    name: def.name,
    image: `https://www.themealdb.com/images/category/${def.mealDbCategory.toLowerCase()}.png`,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  }),
);

export const CATEGORY_TO_MEALDB: Record<string, string> = Object.fromEntries(
  CURATED_CATEGORY_DEFS.map((def) => [def.cuisineTags[0], def.mealDbCategory]),
);

/**
 * True when any of an OSM element's cuisine tags matches a curated
 * category. Tags vary in the wild ("coffee_shop" vs "coffee"), so each
 * category accepts a small list of known variants.
 */
export function matchesCategory(
  cuisineTags: string[] | undefined,
  categoryId: string,
): boolean {
  if (!cuisineTags?.length) {
    return false;
  }
  const def = CURATED_CATEGORY_DEFS.find(
    (candidate) => candidate.cuisineTags[0] === categoryId,
  );
  if (!def) {
    return false;
  }
  const normalized = cuisineTags.map((tag) => tag.toLowerCase());
  return def.cuisineTags.some((tag) => normalized.includes(tag));
}
