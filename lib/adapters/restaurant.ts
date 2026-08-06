import { Restaurant } from "@/types/api";
import { YelpBusiness, YelpBusinessDetail, YelpHours } from "@/services/yelp.service";

// TODO(phase4): add attribution for restaurant/food data sources
//
// Fixed timestamps; no screen renders restaurant createdAt/updatedAt.
const SYNTHETIC_DATE = "2026-01-01T00:00:00.000Z";

const FALLBACK_OPENING_TIME = "8:00 AM";
const FALLBACK_CLOSING_TIME = "10:00 PM";

// Yelp has no delivery fee; synthesize a naira fee from the price tier.
function deliveryFeeFromPriceLevel(price?: string): number {
  switch (price) {
    case "$":
      return 1000;
    case "$$":
      return 1500;
    case "$$$":
      return 2500;
    case "$$$$":
      return 3500;
    default:
      return 1500;
  }
}

// Converts Yelp's 24h HHmm format ("0900") to display format ("9:00 AM").
function formatYelpTime(hhmm: string): string {
  const minutes = Number(hhmm);
  if (Number.isNaN(minutes)) return hhmm;

  const hours = Math.floor(minutes / 100);
  const mins = minutes % 100;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hour12}:${String(mins).padStart(2, "0")} ${period}`;
}

// Derives today's opening/closing times from Yelp's weekly hours.
function hoursRange(hours?: YelpHours[]): {
  openingTime: string;
  closingTime: string;
} {
  const openSlots = hours?.[0]?.open;
  if (!openSlots?.length) {
    return {
      openingTime: FALLBACK_OPENING_TIME,
      closingTime: FALLBACK_CLOSING_TIME,
    };
  }

  // Yelp day index: 0 = Monday; JS getDay(): 0 = Sunday.
  const yelpToday = (new Date().getDay() + 6) % 7;
  const todaySlots = openSlots.filter((slot) => slot.day === yelpToday);
  const slots = todaySlots.length > 0 ? todaySlots : openSlots;

  const opening = Math.min(...slots.map((slot) => Number(slot.start)));
  const closing = Math.max(...slots.map((slot) => Number(slot.end)));

  return {
    openingTime: formatYelpTime(String(opening)),
    closingTime: formatYelpTime(String(closing)),
  };
}

function addressFromYelp(business: YelpBusiness): string | undefined {
  return (
    business.location.display_address?.join(", ") ??
    business.location.address1 ??
    undefined
  );
}

function descriptionFromYelp(business: YelpBusiness): string {
  return business.categories.map((category) => category.title).join(", ");
}

function baseRestaurantFields(
  business: YelpBusiness,
  hours?: YelpHours[],
): Restaurant {
  const { openingTime, closingTime } = hoursRange(hours);

  return {
    _id: business.id,
    name: business.name,
    description: descriptionFromYelp(business),
    address: addressFromYelp(business),
    deliveryFee: deliveryFeeFromPriceLevel(business.price),
    openingTime,
    closingTime,
    // Search results are filtered with open_now, so anything not permanently
    // closed is currently open.
    isOpen: !business.is_closed,
    status: business.is_closed ? "Closed" : "Open",
    images: [business.image_url],
    rating: business.rating,
    totalReviews: business.review_count,
    priceLevel: business.price,
    distanceMeters: business.distance,
    yelpUrl: business.url,
    createdAt: SYNTHETIC_DATE,
    updatedAt: SYNTHETIC_DATE,
  };
}

/**
 * Maps a Yelp Business Search result to a Restaurant.
 */
export function restaurantFromYelpBusiness(
  business: YelpBusiness,
): Restaurant {
  return baseRestaurantFields(business);
}

/**
 * Maps a Yelp Business Details result to a Restaurant, enriching it with
 * photos and real open/closed state from the business hours.
 */
export function restaurantFromYelpDetail(
  business: YelpBusinessDetail,
): Restaurant {
  const restaurant = baseRestaurantFields(business, business.hours);
  const isOpen = business.hours?.[0]?.is_open_now;

  return {
    ...restaurant,
    isOpen,
    status: isOpen ? "Open" : "Closed",
    images: [business.image_url, ...business.photos.slice(0, 4)],
  };
}

/**
 * Stand-in restaurant used to attach fabricated menu items when no real
 * Yelp business backs them (e.g. curated category pages).
 */
export function placeholderRestaurant(_id: string, name: string): Restaurant {
  return {
    _id,
    name,
    address: undefined,
    deliveryFee: 1500,
    openingTime: FALLBACK_OPENING_TIME,
    closingTime: FALLBACK_CLOSING_TIME,
    isOpen: true,
    status: "Open",
    images: [],
    rating: 4.5,
    totalReviews: 0,
    createdAt: SYNTHETIC_DATE,
    updatedAt: SYNTHETIC_DATE,
  };
}
