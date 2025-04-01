# Implementation Plan: AI Box Subscription

**Overall Goal:** Implement a client-side subscription feature allowing users to subscribe to a monthly AI-matched perfume box with three tiers. Subscription status will be managed locally using `AsyncStorage` and reflected in the user's profile. A banner in the checkout screen will promote the subscription. Payment integration is deferred.

---

## Phase 1: Data Structures, Types & Storage

1.  **Define Subscription Types (`types/subscription.ts`):**
    *   Create `types/subscription.ts`.
    *   Define `SubscriptionTier`: `'basic' | 'medium' | 'pro'`.
    *   Define `SubscriptionStatus`: `{ isActive: boolean, tier: SubscriptionTier | null, startDate: number | null }`.
    *   Define `SubscriptionTierDetails`: `{ id: SubscriptionTier, name: string, priceCLP: number, decantSizeML: 3 | 5, maxPricePerML?: number, minPricePerML?: number, description: string }`.
2.  **Define Subscription Constants (`types/constants.ts`):**
    *   Add `SUBSCRIPTION_TIERS`: Array/object with details for Basic ($20k, 3mL, <$2k/mL), Medium ($30k, 5mL, <$2k/mL), Pro ($50k, 5mL, >$2k/mL). All tiers include 4 decants.
    *   Add `STORAGE_KEYS.SUBSCRIPTION_STATUS`.
3.  **Update Cart Types (`types/cart.ts`):**
    *   No update needed for now as subscription is handled outside the cart flow.

## Phase 2: Subscription Context & State Management

1.  **Create Subscription Context (`context/SubscriptionContext.tsx`):**
    *   Create `context/SubscriptionContext.tsx`.
    *   **State:** `subscriptionStatus: SubscriptionStatus | null`, `isLoading: boolean`.
    *   **`useEffect`:** Load status from `AsyncStorage` on mount.
    *   **Functions:** `subscribe(tier)`, `unsubscribe()`. Both update state and `AsyncStorage`.
    *   Export `SubscriptionProvider` and `useSubscription` hook.
2.  **Integrate Provider (`app/_layout.tsx`):**
    *   Wrap existing providers with `<SubscriptionProvider>`.

## Phase 3: UI Implementation

1.  **Create Subscription Screen (`app/subscription.tsx`):**
    *   Create `app/subscription.tsx`.
    *   **UI:** Header ("Suscripción Sillé AI Box"), `ScrollView`, display tiers using `TierCard`, explanation text.
    *   **Logic:** Use `useSubscription`, handle tier selection, call `subscribe()`, show confirmation ("¡Suscripción [Tier Name] activada!"), navigate back.
2.  **Create Tier Card Component (`components/subscription/TierCard.tsx`):**
    *   Create `components/subscription/TierCard.tsx`.
    *   **Props:** `tierDetails`, `onSelect`.
    *   **UI (Apple-inspired):** Clean card, Tier Name, Price (`$X / mes`), Key Features ("4 x YmL", price/mL limits), "Suscribirse" button. Use constants.
3.  **Update Profile Screen (`app/(tabs)/(profile)/index.tsx`):**
    *   Use `useSubscription`.
    *   Conditionally render status: "Suscripción Activa: [Tier Name]" or "Ver Planes de Suscripción" button/MenuItem linking to `/subscription`. Add "Administrar Suscripción" link if active.
4.  **Update Checkout Screen (`app/checkout.tsx`):**
    *   Add a banner component at the top.
    *   **Banner UI:** Text like "✨ ¡Suscríbete al AI Box mensual y ahorra! Ver planes".
    *   Add `onPress={() => router.push('/subscription')}` to the banner.

## Phase 4: Navigation

1.  Ensure `app/subscription.tsx` is a route.
2.  Implement `router.push('/subscription')` from Profile and Checkout banner.

## Phase 5: Memory Bank Update (Post-Save Actions)

1.  Update `decisionLog.md`: Decision to implement client-side subscription, tiers/pricing, UI placement (Profile/Checkout banner), local storage tracking.
2.  Update `progress.md`: Add "Implement AI Box Subscription Feature (Client-side)" to Upcoming Tasks.
3.  Update `activeContext.md`: Update Current Focus.
4.  Update `productContext.md`: Add "AI Box Subscription" to Key Features.

---

## Mermaid Diagram: Subscription Flow

```mermaid
graph TD
    subgraph User Journey
        U1[User in Profile Tab] --> P[Profile Screen (profile/index.tsx)];
        U2[User in Checkout] --> C[Checkout Screen (checkout.tsx)];
    end

    subgraph UI & Navigation
        P -- Sees 'Ver Planes'/'Administrar' --> NAV1{Navigates};
        C -- Sees Banner --> BANNER[Subscription Banner];
        BANNER -- Clicks Banner --> NAV2{Navigates};

        NAV1 --> SUB[Subscription Screen (subscription.tsx)];
        NAV2 --> SUB;

        SUB -- Displays Tiers --> TC[TierCard Component (subscription/TierCard.tsx)];
        TC -- User Clicks 'Suscribirse' --> SEL[Tier Selected];
    end

    subgraph State & Logic
        P -- Reads --> SUBCTX[SubscriptionContext];
        SUB -- Reads Tiers --> CONST[constants.ts];
        TC -- Uses Details --> CONST;

        SEL -- Calls --> SUBCTX_FUNC(subscribe(tier));
        SUBCTX_FUNC -- Updates --> ASYNC[(AsyncStorage: SUBSCRIPTION_STATUS)];
        ASYNC -- On Load --> SUBCTX_LOAD(Load Status);
        SUBCTX_LOAD -- Updates --> SUBCTX_STATE{subscriptionStatus};
        SUBCTX_FUNC -- Updates --> SUBCTX_STATE;

        SUB -- Shows --> CONFIRM[Confirmation Message];
        CONFIRM --> NAV_BACK{Navigate Back};
    end

    subgraph Data Types
        SUBCTX -- Uses --> TYPES[types/subscription.ts];
        CONST -- Uses --> TYPES;
        TC -- Uses --> TYPES;
    end