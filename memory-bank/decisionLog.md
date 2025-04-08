x# Decision Log

## Significant Decisions
[2025-04-07 15:25:35] - Completed implementation of Search Filtering and Sorting logic.
- Implemented deterministic AI match percentage.
- Added sorting by multiple fields with toggle.
- Integrated filters: brand, occasion, price range, gender, day/night, season.
- Day/night and season filters use numerical mappings from mock data.
- [YYYY-MM-DD HH:MM:SS] - [Decision summary]
  - Rationale: [Explanation]
  - Implications: [Impact analysis]

[2025-03-31 19:06:30] - Fixed TypeScript import in manual-box.tsx
- Changed React import from `import React, { useCallback }` to separate imports
[2025-03-31 23:02:00] - Implemented price range filtering for predefined gift boxes. Added calculation of box prices based on selected decant count (4 or 8) and fixed 5mL size. Filter now applies to both gender selection and price range.
- Reason: TS1259 error due to esModuleInterop compatibility
- Impact: Ensures consistent React imports across the project
[2025-03-31 19:08:45] - Resolved tsconfig.json configuration: Confirmed correct path for Expo base config is 'expo/tsconfig.base' (resolves to node_modules/expo/tsconfig.base.json). Observed transient TypeScript server caching issues during resolution process.

[2025-03-31 19:53:05] - Decided to implement 'Filter by Occasion' feature.
  - Rationale: Enhance user experience by allowing browsing perfumes based on specific use cases.
  - Implications: Requires data model changes (Perfume type, mock data), a new screen (`app/occasion-selection.tsx`), and navigation updates (`app/(tabs)/aibox.tsx`). New route: `/occasion-selection`.

[2025-03-31 22:41:59] - Approved plan for Predefined Gift Box feature.
  - Rationale: Implement clickable themed boxes on giftbox screen, filtered by gender, showing contents in a modal with add-to-cart functionality.
  - Details: New data structure `data/predefinedBoxes.ts` with `PredefinedBox` interface (including strict 'masculino'/'femenino' gender). New component `components/product/PredefinedBoxModal.tsx`. Filtering logic added to `app/(tabs)/giftbox.tsx`. New cart type `'PREDEFINED_BOX'`. Fixed 5mL decant size for these boxes. Plan saved to `memory-bank/predefined-box-feature-plan.md`.


[2025-03-31 23:23:41] - Decided on local authentication implementation strategy.
  - Rationale: Need basic auth flow without a backend for initial development.
  - Details: Use AsyncStorage, plain text passwords (temporary), store user email in context, dedicated profile auth prompt screen (`app/(tabs)/(profile)/auth-prompt.tsx`), inline UI error messages, persistent session until logout. Plan saved to `memory-bank/local-auth-plan.md`.


[2025-04-01 10:41:39] - Decided on initial client-side implementation for AI Box Subscription feature.
  - Rationale: Provide core subscription functionality quickly, deferring backend and payment integration.
  - Details: Three tiers (Basic, Medium, Pro) with defined pricing/specs. UI elements in Profile and Checkout banner. State managed via React Context and persisted in AsyncStorage. Plan saved to `memory-bank/subscription-feature-plan.md`.

[2025-04-01 11:25:00] - [Subscription Feature Implementation]
- Chose client-side state management with AsyncStorage for initial implementation
- Designed three-tier subscription model (Basic, Premium, VIP)
- Created reusable TierCard component for consistent UI
- Integrated subscription status into Profile screen
- Added promotional banner to Checkout flow

[2025-04-01 14:27:01] - Decided to manage header configuration for nested screens within their parent layout file. Specifically, the header for `app/(tabs)/(profile)/favorites.tsx` (including title and back button) is now defined in `app/(tabs)/(profile)/_layout.tsx` because the layout's Stack navigator options override screen-level options.


[2025-04-01 19:59:00] - Approved plan for Profile Screen Features.
  - Rationale: Implement user-requested features (Personal Info, Change Password, Purchases) and update profile stats.
  - Details: Expand `AuthContext` user details (name, phone, address) post-signup. Implement local password change (new/confirm fields only). Use mock data for purchase history (`data/mockPurchases.ts`). Update profile stats (ratings, purchases, favorites). Plan saved to `memory-bank/profile-features-plan.md`.


[2025-04-02 10:43:00] - Decided on implementation strategy for Cart Coupon Feature.
  - Rationale: Provide discount functionality using mock coupons initially.
  - Details: New type `types/coupon.ts`, mock data `data/MOCK_COUPONS.ts`, extend `CartContext` with coupon state/logic, update Cart Screen UI (`app/(tabs)/(cart)/index.tsx`) with input/display logic, pass final price to checkout. Plan saved to `memory-bank/coupon-feature-plan.md`.


[2025-04-02 11:16:49] - Decided to implement Box Visualizer feature.
  - Rationale: Provide users with a visual representation of the selected decant count and size combination on box selection screens.
  - Details: Create reusable `components/product/BoxVisualizer.tsx` component to display dynamic images based on props. Integrate into `app/aibox-selection.tsx` and `app/manual-box.tsx` above the `DecantSelector`. Plan saved to `memory-bank/box-visualizer-plan.md`.


[2025-04-07 12:25:25] - Approved plan for Search Screen Filtering and Sorting.
  - Rationale: Enhance user experience by allowing detailed filtering and sorting of search results.
  - Details: Filter modal (Brand, Occasion, Price Range, Gender, Day/Night, Season) with Checkboxes/Range Slider. Sorting buttons (Price, AI Match, Rating, Longevity, Sillage, Price/Value) with asc/desc/null toggle. Requires adding `gender` field to `Perfume` type and data. Agreed on Day/Night and Season rating mappings. Plan saved to `memory-bank/search-filter-sort-plan.md`.

[2025-04-07 15:17:07] - Implemented Search Filtering & Sorting UI.
- Added gender to perfume data.
- Created FilterModal with right-to-left slide animation.
- Sorting buttons now in horizontal scroll view.
- Incorporated user feedback on animations and layout.

[2025-04-07 16:56:33] - Fixed navigation bug in app/landing/index.tsx: replaced incorrect router.push('../manual-box.tsx') with router.push('/manual-box') to use correct route path without file extension.
[2025-03-29 12:10:12] - Initialized decision log file

[2025-04-08 16:54:00] - Integrated Django backend with React Native Expo frontend using Djoser token authentication.
- Created `src/services/api.ts` with login, logout, register, and CRUD functions using fetch and AsyncStorage.
- Created `src/context/AuthContext.tsx` with context-based auth state, login, logout, register, and proper TypeScript types.
- Updated signup and login screens to use the context and API service.
- Configured Djoser and custom User model to use email as login field.
- Noted that API_BASE_URL must be set to the developer machine's IP for physical device testing.
- Added logging to API service for debugging network issues.
- Next: test on device, adjust API URL, and expand API usage.