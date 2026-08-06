import axios from "axios";
import * as Location from "expo-location";

const YELP_API_URL = "https://api.yelp.com/v3";
const YELP_API_KEY = process.env.EXPO_PUBLIC_YELP_API_KEY;

// Used when the user denies location permission or the device cannot
// resolve a position (e.g. simulator without a set location).
const FALLBACK_LOCATION = { latitude: 40.7128, longitude: -74.006 }; // New York, NY

export type YelpCoordinates = {
  latitude: number;
  longitude: number;
};

export type YelpCategory = {
  alias: string;
  title: string;
};

export type YelpOpenTime = {
  day: number;
  start: string;
  end: string;
  is_overnight: boolean;
};

export type YelpHours = {
  open: YelpOpenTime[];
  hours_type: string;
  is_open_now: boolean;
};

export type YelpLocation = {
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  display_address?: string[];
};

export type YelpBusiness = {
  id: string;
  alias: string;
  name: string;
  image_url: string;
  // is_closed means permanently shut down, not today's open/closed state
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: YelpCategory[];
  rating: number;
  coordinates: YelpCoordinates;
  transactions: string[];
  price?: string;
  location: YelpLocation;
  phone?: string;
  display_phone?: string;
  distance?: number;
};

export type YelpBusinessDetail = YelpBusiness & {
  photos: string[];
  hours: YelpHours[];
};

export type YelpSearchParams = {
  term?: string;
  categories?: string; // comma-separated category aliases
  radius?: number; // meters, max 40000
  limit?: number; // max 50
  offset?: number;
  sort_by?: "best_match" | "rating" | "review_count" | "distance";
  price?: string; // "1" | "2" | "3" | "4" or comma-separated levels
  open_now?: boolean;
};

export type YelpSearchResponse = {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: YelpCoordinates;
  };
};

const yelpClient = axios.create({
  baseURL: YELP_API_URL,
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${YELP_API_KEY}`,
    "Content-Type": "application/json",
  },
});

async function resolveCoordinates(): Promise<YelpCoordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return FALLBACK_LOCATION;
  }

  const position = await Location.getCurrentPositionAsync({});
  if (!position?.coords?.latitude) {
    return FALLBACK_LOCATION;
  }

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export const yelpService = {
  /**
   * Search businesses near the user's current location.
   * GET /businesses/search
   */
  async searchBusinesses(
    params: YelpSearchParams = {},
  ): Promise<YelpSearchResponse> {
    const { latitude, longitude } = await resolveCoordinates();
    const response = await yelpClient.get<YelpSearchResponse>(
      "/businesses/search",
      {
        params: { ...params, latitude, longitude },
      },
    );
    return response.data;
  },

  /**
   * Get a business by ID with photos and full hours.
   * GET /businesses/:id
   */
  async getBusiness(id: string): Promise<YelpBusinessDetail> {
    const response = await yelpClient.get<YelpBusinessDetail>(
      `/businesses/${id}`,
    );
    return response.data;
  },
};
