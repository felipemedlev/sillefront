# Decision Log

## Significant Decisions
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

[2025-03-29 12:10:12] - Initialized decision log file