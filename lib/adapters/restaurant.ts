import { mealDbCategoryForRestaurant } from "@/lib/adapters/food-item";
import { hashString } from "@/lib/utils";
import { OsmElement } from "@/services/osm.service";
import { Restaurant } from "@/types/api";

// TODO(phase4): add attribution for restaurant/food data sources
//
// Fixed timestamps; no screen renders restaurant createdAt/updatedAt.
const SYNTHETIC_DATE = "2026-01-01T00:00:00.000Z";

const OPENING_TIMES = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"];
const CLOSING_TIMES = ["9:00 PM", "10:00 PM", "11:00 PM"];
const DELIVERY_FEES = [1000, 1500, 2500, 3500];
const DELIVERY_TIMES = ["15–25 min", "20–30 min", "25–35 min", "30–45 min"];

export function deliveryTimeForRestaurant(idOrRef: string): string {
  const hash = hashString(idOrRef);
  return DELIVERY_TIMES[hash % DELIVERY_TIMES.length];
}

// OSM has no photos, so a deterministic TheMealDB category thumbnail
// (the same category that stands in for the restaurant's menu) is used.
function categoryThumbFor(element: OsmElement): string {
  const category = mealDbCategoryForRestaurant(osmElementRef(element));
  return `https://www.themealdb.com/images/category/${category.toLowerCase()}.png`;
}

// OSM numeric ids collide across element types (a node and a way can both
// be id 5), so the composite ref includes the type.
export function osmElementRef(element: {
  type: string;
  id: number;
}): string {
  return `${element.type}/${element.id}`;
}

function cuisineTagsOf(element: OsmElement): string[] {
  const cuisine = element.tags?.cuisine;
  if (!cuisine) {
    return [];
  }
  return cuisine
    .split(";")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function addressFromElement(element: OsmElement): string | undefined {
  const street = element.tags?.["addr:street"];
  const city = element.tags?.["addr:city"];
  if (street && city) {
    return `${street}, ${city}`;
  }
  return street ?? city;
}

function descriptionFromElement(element: OsmElement): string {
  const tags = cuisineTagsOf(element);
  return tags.length > 0 ? tags.join(", ") : "A local favourite";
}

/**
 * Maps an OSM restaurant/cafe/fast_food element to a Restaurant. OSM
 * carries no ratings, prices, or hours, so those are fabricated
 * deterministically from the element ref: the same place always gets the
 * same numbers. `opening_hours` tags are deliberately not parsed.
 */
export function restaurantFromOsmElement(element: OsmElement): Restaurant {
  const ref = osmElementRef(element);
  const hash = hashString(ref);

  // Unsigned shifts throughout: `>>` is signed, so any hash above 2^31
  // (hashString returns unsigned) shifts to a negative number, and a
  // negative `%` remainder then yields a negative count.
  const isOpen = hash % 10 < 8; // ~80% of places open at any given moment
  const rating = Math.round((3.5 + (hash % 15) / 10) * 10) / 10; // 3.5-4.9
  const totalReviews = ((hash >>> 3) % 480) + 20;

  return {
    _id: ref,
    osmId: String(element.id),
    name: element.tags?.name ?? "Unnamed restaurant",
    description: descriptionFromElement(element),
    address: addressFromElement(element),
    deliveryFee: DELIVERY_FEES[hash % DELIVERY_FEES.length],
    openingTime: OPENING_TIMES[hash % OPENING_TIMES.length],
    closingTime: CLOSING_TIMES[(hash >>> 2) % CLOSING_TIMES.length],
    isOpen,
    status: isOpen ? "Open" : "Closed",
    images: [categoryThumbFor(element)],
    rating,
    totalReviews,
    priceLevel: "$".repeat(((hash >>> 4) % 4) + 1),
    cuisineTags: cuisineTagsOf(element),
    createdAt: SYNTHETIC_DATE,
    updatedAt: SYNTHETIC_DATE,
  };
}

/**
 * Stand-in restaurant used to attach fabricated menu items when no real
 * OSM element backs them (e.g. curated category pages).
 */
export function placeholderRestaurant(_id: string, name: string): Restaurant {
  return {
    _id,
    name,
    address: undefined,
    deliveryFee: 1500,
    openingTime: "8:00 AM",
    closingTime: "10:00 PM",
    isOpen: true,
    status: "Open",
    images: [],
    rating: 4.5,
    totalReviews: 0,
    createdAt: SYNTHETIC_DATE,
    updatedAt: SYNTHETIC_DATE,
  };
}
