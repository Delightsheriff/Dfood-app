import axios from "axios";
import * as Location from "expo-location";

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

// Used when the user denies location permission or the device cannot
// resolve a position (e.g. simulator without a set location).
const FALLBACK_LOCATION = { latitude: 40.7128, longitude: -74.006 }; // New York, NY

const SEARCH_RADIUS_METERS = 2000;

const AMENITY_QUERY =
  'node["amenity"~"^(restaurant|cafe|fast_food)$"]; ' +
  'way["amenity"~"^(restaurant|cafe|fast_food)$"];';

export type OsmCoordinates = {
  latitude: number;
  longitude: number;
};

export type OsmElement = {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OsmElement[];
};

const osmClient = axios.create({
  baseURL: OVERPASS_API_URL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    // Overpass's Apache front-end returns 406 Not Acceptable for axios's
    // default headers (a generic "axios/x.x.x" User-Agent). A descriptive
    // one — which OSM-adjacent APIs generally ask for anyway as an
    // anti-abuse courtesy — fixes it. Confirmed by reproducing the 406
    // outside the app and testing headers directly against the live API.
    "User-Agent": "Dfood-app/1.0 (portfolio project)",
    Accept: "*/*",
  },
});

async function resolveCoordinates(): Promise<OsmCoordinates> {
  // Every failure mode here falls back rather than throwing: permission
  // denied, but also a granted permission that still can't produce a fix
  // (getCurrentPositionAsync throws LocationUnavailable on a simulator with
  // no location set, and on a real device that can't get a GPS lock). An
  // uncaught throw here kills the whole restaurant query.
  try {
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
  } catch {
    return FALLBACK_LOCATION;
  }
}

function isRetryableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  if (status === 429 || status === 503 || status === 504) {
    return true;
  }
  return /too busy|server error/i.test(error.message);
}

async function runQuery(query: string): Promise<OverpassResponse> {
  const attempt = async (): Promise<OverpassResponse> => {
    const response = await osmClient.post(
      "",
      new URLSearchParams({ data: query }).toString(),
    );
    const data = response.data as Partial<OverpassResponse>;
    if (!Array.isArray(data.elements)) {
      // The public instance answers HTTP 200 with an HTML error page
      // when it is too busy; treat that like a transient failure.
      throw new Error("Overpass server is too busy");
    }
    return data as OverpassResponse;
  };

  try {
    return await attempt();
  } catch (error) {
    if (!isRetryableError(error)) {
      throw error;
    }
    // The public Overpass instances rate-limit; retry once after a brief pause.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return attempt();
  }
}

function hasName(element: OsmElement): boolean {
  return Boolean(element.tags?.name);
}

function coordinatesOf(element: OsmElement): OsmCoordinates | undefined {
  if (element.center) {
    return {
      latitude: element.center.lat,
      longitude: element.center.lon,
    };
  }
  if (element.lat !== undefined && element.lon !== undefined) {
    return {
      latitude: element.lat,
      longitude: element.lon,
    };
  }
  return undefined;
}

export const osmService = {
  /**
   * Search restaurants, cafes, and fast-food places near the user's
   * current location. Every element carries a type + id (ids are only
   * unique per type in OSM) and an optional tags map.
   */
  async searchRestaurants(
    radiusMeters: number = SEARCH_RADIUS_METERS,
  ): Promise<OsmElement[]> {
    const { latitude, longitude } = await resolveCoordinates();
    const query =
      `[out:json][timeout:25]; (` +
      `node["amenity"~"^(restaurant|cafe|fast_food)$"]` +
      `(around:${radiusMeters},${latitude},${longitude}); ` +
      `way["amenity"~"^(restaurant|cafe|fast_food)$"]` +
      `(around:${radiusMeters},${latitude},${longitude});` +
      `); out center;`;
    const response = await runQuery(query);

    return response.elements.filter(
      (element) => hasName(element) && coordinatesOf(element) !== undefined,
    );
  },
};
