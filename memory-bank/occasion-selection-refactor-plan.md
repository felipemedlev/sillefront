# Plan: Refactor `app/occasion-selection.tsx`

**Project:** Sillefront
**Task:** Implement `app/occasion-selection.tsx` using backend data and reusing `aibox-selection.tsx` components.

**Goal:** Refactor `app/occasion-selection.tsx` to fetch perfumes from the backend using the occasion filter, similar to how `app/aibox-selection.tsx` fetches recommendations, while reusing components and maintaining the remove/replace functionality. The product type for the cart item should be `OCCASION_BOX`.

**Steps:**

1.  **Update `app/(tabs)/aibox.tsx`:**
    *   **Goal:** Modify the navigation action that leads to `app/occasion-selection.tsx` to pass the selected occasion's ID(s) instead of its name.
    *   **Details:**
        *   Identify the `Pressable` or equivalent component in `app/(tabs)/aibox.tsx` that triggers navigation to `app/occasion-selection.tsx`.
        *   Ensure that the data structure representing the selected occasion at this point includes its ID. If not, the occasion data might need to be fetched or structured differently in `app/(tabs)/aibox.tsx`.
        *   Update the `router.push` call to include the occasion ID(s) in the URL parameters (e.g., as a comma-separated string: `occasionIds=1,5`).
    *   **Files Affected:** `app/(tabs)/aibox.tsx`

2.  **Refactor `app/occasion-selection.tsx`:**
    *   **Goal:** Replace mock data usage with API calls, integrate reusable components from `aibox-selection.tsx`, and implement remove/replace logic.
    *   **Details:**
        *   Update `useLocalSearchParams` to receive and parse the `occasionIds` parameter.
        *   Remove `MOCK_PERFUMES` import and related filtering logic.
        *   Import necessary components and context: `AIBoxProvider`, `AIBoxInteractions`, `AIBoxLoadingState`, `AIBoxErrorState`, `PerfumeSearchModal`.
        *   Wrap the main content with `AIBoxProvider` (or a similar dedicated context).
        *   Adapt/Configure the Provider to:
            *   Fetch data using `fetchRecommendations` from `src/services/api.ts`, passing `occasionIds` and `priceRange` in the `filters`.
            *   Manage loading, error, and `recommendedPerfumes` state.
            *   Manage `selectedPerfumeIds` state.
            *   Implement `handleRemovePerfume` and `handleReplacePerfume` logic.
            *   Provide necessary state and functions via context.
        *   Replace existing state management with context-provided state/functions.
        *   Integrate `AIBoxLoadingState` and `AIBoxErrorState`.
        *   Integrate `AIBoxInteractions` for user actions.
        *   Ensure reusable components (`BoxVisualizer`, `DecantSelector`, `PriceRangeSlider`, `PerfumeList`, `BottomBar`) receive props from the context.
        *   Integrate `PerfumeSearchModal` for replacement functionality.
        *   Verify `handleAddToCart` uses `'OCCASION_BOX'` product type.
    *   **Files Affected:** `app/occasion-selection.tsx`, potentially `components/aibox/AIBoxProvider.tsx`.

3.  **Review `src/services/api.ts`:**
    *   **Goal:** Ensure `fetchRecommendations` correctly handles the `occasions` filter.
    *   **Details:** Confirm the function appends the `occasions` parameter correctly. (Likely no changes needed).
    *   **Files Affected:** `src/services/api.ts` (Review only)

4.  **Review `types/cart.ts`:**
    *   **Goal:** Confirm `OCCASION_BOX` product type exists.
    *   **Details:** Verify `OCCASION_BOX` is in the `ProductType` union. (Likely no changes needed).
    *   **Files Affected:** `types/cart.ts` (Review only)

**Mermaid Diagram:**

```mermaid
graph TD
    A[app/(tabs)/aibox.tsx] --> B{User Selects Occasion};
    B --> C[Pass Occasion ID(s) via Navigation Params];
    C --> D[app/occasion-selection.tsx];
    D --> E[Wrap with AIBoxProvider/Occasion Context];
    E --> F[Context: Call API.fetchRecommendations];
    F --> G[src/services/api.ts];
    G --> F;
    F --> H{Context State Update};
    H -- Loading --> I[Display AIBoxLoadingState];
    H -- Error --> J[Display AIBoxErrorState];
    H -- Success --> K[Display PerfumeList via AIBoxInteractions];
    K --> L{User Interaction (Remove/Replace)};
    L -- Remove --> M[Context: Update Selected Perfumes];
    L -- Replace --> N[Context: Open PerfumeSearchModal];
    N --> O[PerfumeSearchModal];
    O --> P{User Selects Replacement};
    P --> M;
    M --> Q[Context: Update UI State];
    Q --> K;
    Q --> R[BottomBar (Calculate Total Price)];
    R --> S{Add to Cart};
    S --> T[Call useCart().addItemToCart];
    T --> U[CartContext (Add OCCASION_BOX item)];
    U --> V[types/cart.ts];

    subgraph Reused Components
        K --> PerfumeList;
        R --> BottomBar;
        D --> BoxVisualizer;
        D --> DecantSelector;
        D --> PriceRangeSlider;
        O --> PerfumeSearchModal;
        I --> AIBoxLoadingState;
        J --> AIBoxErrorState;
        K --> AIBoxInteractions;
    end

    subgraph New/Modified Logic
        A, C --> app/(tabs)/aibox.tsx;
        D, E, F, H, M, Q --> app/occasion-selection.tsx / AIBoxProvider;
        G --> src/services/api.ts;
        S, T, U --> context/CartContext.tsx;
        V --> types/cart.ts;
    end