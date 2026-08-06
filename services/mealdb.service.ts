import axios from "axios";

const MEALDB_API_URL = "https://www.themealdb.com/api/json/v1/1";

export type MealDBCategory = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
};

export type MealSummary = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export type MealDetail = MealSummary & {
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
  strDrinkAlternate?: string;
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
};

export type MealDBCategoriesResponse = {
  categories: MealDBCategory[];
};

export type MealDBListResponse = {
  meals: MealSummary[];
};

export type MealDBDetailResponse = {
  meals: MealDetail[];
};

const mealDbClient = axios.create({
  baseURL: MEALDB_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const mealDbService = {
  /**
   * Get all meal categories
   * GET /categories.php
   */
  async getCategories(): Promise<MealDBCategoriesResponse> {
    const response = await mealDbClient.get<MealDBCategoriesResponse>(
      "/categories.php",
    );
    return response.data;
  },

  /**
   * Get meals by category
   * GET /filter.php?c=Seafood
   */
  async getMealsByCategory(category: string): Promise<MealDBListResponse> {
    const response = await mealDbClient.get<{ meals: MealSummary[] | null }>(
      "/filter.php",
      { params: { c: category } },
    );
    return { meals: response.data.meals ?? [] };
  },

  /**
   * Get full meal details by ID
   * GET /lookup.php?i=52772
   */
  async getMealById(id: string): Promise<MealDetail | null> {
    const response = await mealDbClient.get<{ meals: MealDetail[] | null }>(
      "/lookup.php",
      { params: { i: id } },
    );
    return response.data.meals?.[0] ?? null;
  },

  /**
   * Search meals by name
   * GET /search.php?s=arrabiata
   */
  async searchMeals(query: string): Promise<MealDBDetailResponse> {
    const response = await mealDbClient.get<{ meals: MealDetail[] | null }>(
      "/search.php",
      { params: { s: query } },
    );
    return { meals: response.data.meals ?? [] };
  },
};
