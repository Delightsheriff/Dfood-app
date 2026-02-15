# DFood - Food Delivery App

A modern, full-featured food delivery mobile application built with React Native, Expo, and TypeScript. DFood provides a seamless experience for ordering food from local restaurants with secure payments, address management, and an intuitive user interface.

> **Live Demo**: _Coming soon_

## Screenshots

<table>
  <tr>
    <td align="center"><img src="screenshots/home.jpg" alt="Home" width="220"/><br/><strong>Home</strong></td>
    <td align="center"><img src="screenshots/restaurant-details.jpg" alt="Restaurant Details" width="220"/><br/><strong>Restaurant Details</strong></td>
    <td align="center"><img src="screenshots/cart.jpg" alt="Cart" width="220"/><br/><strong>Cart</strong></td>
    <td align="center"><img src="screenshots/checkout.jpg" alt="Checkout" width="220"/><br/><strong>Checkout</strong></td>
  </tr>
</table>

## Design

The UI is based on a community Figma design:
[View Figma Design](https://www.figma.com/design/H0HAOQyTT8cwNWAesP1qj5/Food-Delivery-App--Community-?node-id=223-3474&p=f&t=kocdsyHaTNUQPE3q-0)

## Features

### Authentication and User Management

- JWT-based authentication with secure token persistence
- User registration with email and password
- OTP-based password recovery flow
- Profile management (name, phone number, profile picture)
- Session persistence across app restarts

### Food Discovery

- Dynamic home feed with personalized restaurant recommendations
- Real-time search across restaurants and food items
- Category-based browsing
- Detailed restaurant profiles with menus and ratings
- Comprehensive food item details

### Shopping and Cart

- Persistent cart using Zustand with AsyncStorage
- Favorites system for saved dishes
- Single-restaurant cart enforcement with switching alerts
- Quantity management with increment/decrement controls

### Delivery and Addresses

- Interactive map integration for address selection
- Save multiple addresses (home, work, custom)
- GPS-based auto-location detection
- Full CRUD operations for saved addresses
- Default address selection

### Payment Processing

- Cash on delivery and card payment support
- Paystack integration for secure card verification
- Saved payment methods
- Payment history tracking

### Order Management

- Single-screen checkout flow
- Order confirmation with tracking number
- Order history with real-time status tracking
- Order cancellation with automatic refunds
- Custom delivery instructions

## Tech Stack

### Frontend

| Technology              | Purpose                       |
| ----------------------- | ----------------------------- |
| React Native            | Mobile framework              |
| Expo (SDK 54)           | Development platform          |
| TypeScript              | Type safety                   |
| Expo Router             | File-based routing            |
| NativeWind              | Tailwind CSS for React Native |
| React Native Reanimated | Animations                    |

### State Management

| Technology          | Purpose                 |
| ------------------- | ----------------------- |
| TanStack Query (v5) | Server state management |
| Zustand             | Client state (Cart)     |
| AsyncStorage        | Local data persistence  |
| Expo SecureStore    | Secure token storage    |

### Key Libraries

| Library                       | Purpose                      |
| ----------------------------- | ---------------------------- |
| @gorhom/bottom-sheet          | Bottom sheet modals          |
| react-native-maps             | Map integration              |
| expo-image                    | Optimized image loading      |
| lucide-react-native           | Icon set                     |
| react-hook-form + zod         | Form handling and validation |
| axios                         | HTTP client                  |
| react-native-paystack-webview | Payment processing           |

## Project Structure

```
food-app/
├── app/                          # Expo Router screens
│   ├── (app)/                    # Protected app screens
│   │   ├── index.tsx             # Home screen
│   │   ├── cart.tsx              # Shopping cart
│   │   ├── checkout.tsx          # Checkout flow
│   │   ├── search.tsx            # Search
│   │   ├── order-confirmation.tsx
│   │   ├── categories/           # Category screens
│   │   ├── restaurants/          # Restaurant screens
│   │   └── food/                 # Food item screens
│   ├── (auth)/                   # Authentication screens
│   ├── profile/                  # User profile screens
│   ├── onboarding.tsx            # First-time user flow
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable UI components
├── contexts/                     # React contexts (Auth)
├── hooks/                        # Custom hooks
├── lib/                          # Core utilities
├── providers/                    # App providers
├── services/                     # API service layer
├── store/                        # Zustand stores
├── types/                        # TypeScript type definitions
└── constants/                    # App constants
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
- Backend API running ([DFood API](https://github.com/Delightsheriff/Dfood-api))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Delightsheriff/Dfood-app.git
   cd food-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   EXPO_PUBLIC_PAYSTACK_KEY=pk_test_your_paystack_public_key
   ```

   For Android Emulator, use `http://10.0.2.2:3000/api` as the API URL.

4. Start the development server:

   ```bash
   npx expo start
   ```

5. Run on a device or emulator:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go for a physical device

## Configuration

### API

The app uses Axios with automatic token injection. API base URL is configured via the `EXPO_PUBLIC_API_URL` environment variable. In development, it defaults to `http://localhost:3000` (or `http://10.0.2.2:3000` on Android emulators).

### Paystack

Set `EXPO_PUBLIC_PAYSTACK_KEY` in your `.env` file with your Paystack public key. Use `pk_test_...` for testing and `pk_live_...` for production.

### Maps

The app uses `expo-location` and `react-native-maps`. No additional API keys are required for basic functionality.

## Environment Variables

| Variable                   | Description         | Example                     |
| -------------------------- | ------------------- | --------------------------- |
| `EXPO_PUBLIC_API_URL`      | Backend API URL     | `http://localhost:3000/api` |
| `EXPO_PUBLIC_PAYSTACK_KEY` | Paystack public key | `pk_test_...`               |

## Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

Configure environment variables for production builds in `eas.json`.

## Troubleshooting

| Issue                     | Solution                                                  |
| ------------------------- | --------------------------------------------------------- |
| Bottom sheets not opening | Ensure `GestureHandlerRootView` wraps the screen          |
| Maps not working          | Check location permissions and `app.json` config          |
| API timeout errors        | Verify backend is running and check `EXPO_PUBLIC_API_URL` |
| Images not loading        | Add `usesCleartextTraffic: true` in `app.json` for HTTP   |
| Paystack errors           | Verify public key and test with Paystack test cards       |

## Related Repositories

- **Backend API**: [Dfood-api](https://github.com/Delightsheriff/Dfood-api)

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
