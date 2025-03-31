# Feature Plan: Filter Perfumes by Occasion

This document outlines the plan to implement a feature allowing users to view perfumes filtered by a selected occasion.

**1. Define New Route & Screen:**

*   Create a new screen for displaying perfumes filtered by occasion.
*   **Route/File:** `app/occasion-selection.tsx`

**2. Update Data Structures:**

*   **`types/perfume.ts`:**
    *   Modify the `Perfume` interface.
    *   Add `occasions?: string[];` (optional array of strings).
*   **`data/mockPerfumes.ts`:**
    *   Add the `occasions` array property to each perfume object in `MOCK_PERFUMES`.
    *   **Initial Data Assignment (Examples):**
        *   `Bleu de Chanel`: `['Formal', 'Oficina', 'Casual', 'Noche']`
        *   `Acqua di Gio`: `['Casual', 'Deportiva', 'Viaje', 'Relax']`
        *   `Sauvage`: `['Casual', 'Noche', 'Fiesta']`
        *   *(Assign occasions to all perfumes during implementation, using titles from `aibox.tsx`)*

**3. Implement Navigation:**

*   **`app/(tabs)/aibox.tsx`:**
    *   Modify the `Pressable` component for each occasion card.
    *   Add an `onPress` handler.
    *   Use `router.push` to navigate: `router.push(\`/occasion-selection?occasion=\${occasion.title}\`);`

**4. Create the Occasion Selection Screen (`app/occasion-selection.tsx`):**

*   **File Creation:** Create `app/occasion-selection.tsx`.
*   **Base Structure:** Copy content from `app/aibox-selection.tsx`.
*   **Get Occasion Parameter:**
    *   Import `useLocalSearchParams` from `expo-router`.
    *   Retrieve parameter: `const { occasion } = useLocalSearchParams<{ occasion: string }>();`
*   **Modify Initial Filtering (`useEffect` hook):**
    *   Filter `MOCK_PERFUMES` based on `occasion` parameter (check if `perfume.occasions.includes(occasion)`).
    *   Apply `rangoPrecio` filter *in addition* to the occasion filter.
    *   Set `selectedPerfumeIds` to the first `decantCount` perfumes from the doubly filtered list.
*   **Adjust Header:** Update `headerTitle` to include the occasion: `Box AI: ${occasion}`.
*   **Component Renaming:** Rename exported function to `OccasionSelectionScreen`.
*   **Review Components:** Ensure `DecantSelector`, `PriceRangeSlider`, `PerfumeList`, `BottomBar`, `PerfumeModal` function correctly.

**5. Update Memory Bank:**

*   Add decision to `decisionLog.md` (new screen, route `/occasion-selection`).
*   Add task to `progress.md`.
*   Update `activeContext.md` focus.

**Visual Flow (Mermaid Diagram):**

```mermaid
graph TD
    A[User Taps Occasion Card (aibox.tsx)] --> B{Navigation Triggered};
    B -- router.push('/occasion-selection?occasion=TITLE') --> C[Occasion Selection Screen (occasion-selection.tsx)];
    C -- Reads 'occasion' param --> D{Filter MOCK_PERFUMES};
    D -- Perfume.occasions.includes(param) &amp; Price Filter --> E[Display Filtered Perfumes];
    E --> F[User Interacts (Selects Decants, Filters Price, Adds to Cart)];
    F --> G[Cart Updated (CartContext)];

    subgraph Data Updates
        H[types/perfume.ts] --> I{Add 'occasions?: string[]'};
        J[data/mockPerfumes.ts] --> K{Add 'occasions' array to each perfume};
    end

    subgraph UI Changes
        L[app/(tabs)/aibox.tsx] --> M{Add onPress handler to Occasion Cards};
        N[Create app/occasion-selection.tsx] --> O{Copy UI from aibox-selection.tsx};
        O --> P{Modify filtering logic based on 'occasion' param};
    end

    I --> K;
    M --> B;
    P --> D;