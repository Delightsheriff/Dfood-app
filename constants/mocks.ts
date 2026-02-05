export interface Category {
  id: string;
  name: string;
  image: string; // URL or local require
}

export interface Ingredient {
  id: string;
  name: string;
  icon: string; // URL or mock icon name
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  calories?: number;
  ingredients: Ingredient[];
  sizes: string[];
  reviews: number;
  categoryId: string;
}

// export interface FoodItem {
//   id: string;
//   name: string;
//   restaurantName: string;
//   price: number;
//   image: string;
//   categoryId: string;
//   rating?: number;
//   description?: string;
// }

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string; // e.g. "20 min"
  deliveryFee: number; // 0 for free
  tags: string[]; // e.g. ["Burger", "Chicken", "Wings"]
  image: string;
  status: "Open" | "Closed";
  menu: FoodItem[];
  description?: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "All",
    image: "https://cdn-icons-png.flaticon.com/512/706/706997.png",
  },
  {
    id: "2",
    name: "Hot Dog",
    image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  },
  {
    id: "3",
    name: "Burger",
    image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  },
  {
    id: "4",
    name: "Pizza",
    image: "https://cdn-icons-png.flaticon.com/512/3595/3595458.png",
  },
  {
    id: "5",
    name: "Drink",
    image: "https://cdn-icons-png.flaticon.com/512/2738/2738730.png",
  },
];

export const INGREDIENTS: Ingredient[] = [
  {
    id: "1",
    name: "Salt",
    icon: "https://cdn-icons-png.flaticon.com/512/3314/3314383.png",
  },
  {
    id: "2",
    name: "Chicken",
    icon: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
  },
  {
    id: "3",
    name: "Onion",
    icon: "https://cdn-icons-png.flaticon.com/512/5029/5029236.png",
  },
  {
    id: "4",
    name: "Garlic",
    icon: "https://cdn-icons-png.flaticon.com/512/5029/5029314.png",
  },
  {
    id: "5",
    name: "Peppers",
    icon: "https://cdn-icons-png.flaticon.com/512/2918/2918115.png",
  },
];

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: "f1",
    restaurantId: "r1",
    name: "Burger Bistro",
    description: "Rose Garden",
    price: 40,
    image:
      "https://img.freepik.com/free-photo/view-3d-burger_23-2150914673.jpg",
    rating: 4.7,
    ingredients: INGREDIENTS,
    sizes: ['10"', '14"', '16"'],
    reviews: 99,
    categoryId: "3",
  },
  {
    id: "f2",
    restaurantId: "r2",
    name: "Smokin' Burger",
    description: "Cafenio Restaurant",
    price: 60,
    image:
      "https://img.freepik.com/free-photo/delicious-burger-with-fresh-ingredients_23-2150857908.jpg",
    rating: 4.9,
    ingredients: INGREDIENTS,
    sizes: ['10"', '14"', '16"'],
    reviews: 102,
    categoryId: "3",
  },
  {
    id: "f3",
    restaurantId: "r3",
    name: "Buffalo Burgers",
    description: "Kaji Firm Kitchen",
    price: 75,
    image:
      "https://img.freepik.com/free-photo/front-view-burger-stand_141793-15542.jpg",
    rating: 4.5,
    ingredients: INGREDIENTS,
    sizes: ['10"', '14"', '16"'],
    reviews: 34,
    categoryId: "3",
  },
  {
    id: "f4",
    restaurantId: "r4",
    name: "Bullseye Burgers",
    description: "Kabab Restaurant",
    price: 94,
    image:
      "https://img.freepik.com/free-photo/appetizing-hamburger-with-sesame-seeds_23-2148090595.jpg",
    rating: 4.2,
    ingredients: INGREDIENTS,
    sizes: ['10"', '14"', '16"'],
    reviews: 10,
    categoryId: "3",
  },
  {
    id: "f5",
    restaurantId: "r5",
    name: "Classic Burger",
    description: "Rose Garden",
    price: 50,
    image:
      "https://img.freepik.com/free-photo/delicious-burger-with-fresh-ingredients_23-2150857908.jpg",
    rating: 4.8,
    ingredients: INGREDIENTS,
    sizes: ['10"', '14"', '16"'],
    reviews: 56,
    categoryId: "3",
  },
  // Hot Dogs
  {
    id: "f6",
    restaurantId: "r1",
    name: "Classic Hot Dog",
    description: "Traditional American hot dog with mustard and ketchup",
    price: 25,
    image:
      "https://img.freepik.com/free-photo/delicious-hot-dog-with-toppings_23-2148725308.jpg",
    rating: 4.3,
    ingredients: [INGREDIENTS[0], INGREDIENTS[2]],
    sizes: ["Regular", "Large"],
    reviews: 67,
    categoryId: "2",
  },
  {
    id: "f7",
    restaurantId: "r2",
    name: "Chicago Style Dog",
    description: "All-beef hot dog with classic Chicago toppings",
    price: 35,
    image:
      "https://img.freepik.com/free-photo/hot-dog-with-vegetables_144627-20274.jpg",
    rating: 4.6,
    ingredients: [INGREDIENTS[0], INGREDIENTS[2], INGREDIENTS[4]],
    sizes: ["Regular", "Large"],
    reviews: 43,
    categoryId: "2",
  },
  // Pizzas
  {
    id: "f8",
    restaurantId: "r7",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, and basil",
    price: 85,
    image:
      "https://img.freepik.com/free-photo/pizza-pizza-filled-with-tomatoes-salami-olives_140725-1200.jpg",
    rating: 4.8,
    ingredients: [INGREDIENTS[0], INGREDIENTS[3]],
    sizes: ['12"', '16"', '20"'],
    reviews: 128,
    categoryId: "4",
  },
  {
    id: "f9",
    restaurantId: "r9",
    name: "Pepperoni Pizza",
    description: "Classic pepperoni with mozzarella cheese",
    price: 95,
    image:
      "https://img.freepik.com/free-photo/mixed-pizza-with-various-ingridients_140725-3790.jpg",
    rating: 4.7,
    ingredients: [INGREDIENTS[0], INGREDIENTS[4]],
    sizes: ['12"', '16"', '20"'],
    reviews: 89,
    categoryId: "4",
  },
  {
    id: "f10",
    restaurantId: "r7",
    name: "Supreme Pizza",
    description: "Loaded with pepperoni, sausage, peppers, and onions",
    price: 110,
    image:
      "https://img.freepik.com/free-photo/top-view-pepperoni-pizza-sliced-into-six-slices_141793-2157.jpg",
    rating: 4.9,
    ingredients: [INGREDIENTS[0], INGREDIENTS[2], INGREDIENTS[4]],
    sizes: ['12"', '16"', '20"'],
    reviews: 156,
    categoryId: "4",
  },
  // Drinks
  {
    id: "f11",
    restaurantId: "r1",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 15,
    image:
      "https://img.freepik.com/free-photo/fresh-orange-juice-glass-dark-background_1150-45560.jpg",
    rating: 4.5,
    ingredients: [],
    sizes: ["Small", "Medium", "Large"],
    reviews: 45,
    categoryId: "5",
  },
  {
    id: "f12",
    restaurantId: "r2",
    name: "Iced Coffee",
    description: "Cold brew coffee with ice",
    price: 20,
    image:
      "https://img.freepik.com/free-photo/iced-coffee-glass_1150-28947.jpg",
    rating: 4.4,
    ingredients: [],
    sizes: ["Small", "Medium", "Large"],
    reviews: 78,
    categoryId: "5",
  },
  {
    id: "f13",
    restaurantId: "r9",
    name: "Strawberry Smoothie",
    description: "Fresh strawberry smoothie with yogurt",
    price: 25,
    image:
      "https://img.freepik.com/free-photo/strawberry-smoothie-glass_144627-18149.jpg",
    rating: 4.6,
    ingredients: [],
    sizes: ["Small", "Medium", "Large"],
    reviews: 92,
    categoryId: "5",
  },
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: "r1",
    name: "Rose Garden Restaurant",
    rating: 4.7,
    deliveryTime: "20 min",
    deliveryFee: 0,
    tags: ["Burger", "Chicken", "Rice", "Wings"],
    image:
      "https://img.freepik.com/free-photo/restaurant-interior_1127-3394.jpg",
    status: "Open",
    menu: [FOOD_ITEMS[0]],
  },
  {
    id: "r2",
    name: "Rose Garden Restaurant",
    rating: 4.7,
    deliveryTime: "20 min",
    deliveryFee: 0,
    tags: ["Burger", "Chicken", "Rice", "Wings"],
    image:
      "https://img.freepik.com/free-photo/restaurant-interior_1127-3394.jpg",
    status: "Open",
    menu: [FOOD_ITEMS[0]],
  },
  {
    id: "r3",
    name: "Rose Garden Restaurant",
    rating: 4.7,
    deliveryTime: "20 min",
    deliveryFee: 0,
    tags: ["Burger", "Chicken", "Rice", "Wings"],
    image:
      "https://img.freepik.com/free-photo/restaurant-interior_1127-3394.jpg",
    status: "Open",
    menu: [FOOD_ITEMS[0]],
  },
  {
    id: "r5",
    name: "Rose Garden Restaurant",
    rating: 4.7,
    deliveryTime: "20 min",
    deliveryFee: 0,
    tags: ["Burger", "Chicken", "Rice", "Wings"],
    image:
      "https://img.freepik.com/free-photo/restaurant-interior_1127-3394.jpg",
    status: "Open",
    menu: [FOOD_ITEMS[0]],
  },
  {
    id: "r6",
    name: "Rose Garden Restaurant",
    rating: 4.7,
    deliveryTime: "20 min",
    deliveryFee: 0,
    tags: ["Burger", "Chicken", "Rice", "Wings"],
    image:
      "https://img.freepik.com/free-photo/restaurant-interior_1127-3394.jpg",
    status: "Open",
    menu: [FOOD_ITEMS[0]],
  },
  {
    id: "r7",
    name: "Rose Garden Restaurant",
    rating: 4.7,
    deliveryTime: "20 min",
    deliveryFee: 0,
    tags: ["Burger", "Chicken", "Rice", "Wings"],
    image:
      "https://img.freepik.com/free-photo/restaurant-interior_1127-3394.jpg",
    status: "Open",
    menu: [FOOD_ITEMS[0]],
  },
  {
    id: "r9",
    name: "Cafenio Restaurant",
    rating: 4.4,
    deliveryTime: "25 min",
    deliveryFee: 5,
    tags: ["Pizza", "Fast Food"],
    image:
      "https://img.freepik.com/free-photo/cozy-restaurant-with-people-waiter_1753-3796.jpg",
    status: "Open",
    menu: [FOOD_ITEMS[1]],
  },
];
