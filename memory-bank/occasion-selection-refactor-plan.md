# Plan: Refactor `app/occasion-selection.tsx` to Filter by Occasion Name

**Project:** Sillefront
**Task:** Modify the occasion filtering mechanism to use occasion names instead of IDs, and update the refactor plan for `app/occasion-selection.tsx` accordingly.

**Goal:** Refactor `app/occasion-selection.tsx` to fetch perfumes from the backend using occasion *names* passed via navigation, integrate reusable components, and update the overall plan document. The product type for the cart item remains `OCCASION_BOX`.

**Overall Changes Required:**

1.  **Backend:** Modify filters to accept names, look up IDs.
2.  **Frontend:** Update API service, context provider, and eventually screens to use names.
3.  **Plan Document:** Update this document to reflect the name-based approach.

**Detailed Steps:**

1.  **Update Backend Filters (`SilleBack/api/filters.py`)**
    *   **Goal:** Update filter methods to accept occasion names, query their IDs, and filter the queryset.
    *   **`filter_occasions` (in `PerfumeFilter`):**
        *   Modify to process names: `occasion_names = [name.strip() for name in value.split(',') if name.strip()]`
        *   Query `Occasion` model: `occasions = Occasion.objects.filter(name__in=occasion_names)`
        *   Get IDs: `occasion_ids = [o.id for o in occasions]`
        *   Filter queryset: `return queryset.filter(occasions__id__in=occasion_ids).distinct()`
        *   Consider adding error handling/logging if `len(occasion_ids) != len(occasion_names)`.
    *   **`filter_perfume_occasions` (in `UserPerfumeMatchFilter`):**
        *   Apply the same logic as above, filtering the `UserPerfumeMatch` queryset: `return queryset.filter(perfume__occasions__id__in=occasion_ids).distinct()`

2.  **Update Frontend API Service (`SilleFront/src/services/api.ts`)**
    *   **Goal:** Update type definitions and API call logic to use occasion names.
    *   **`PerfumeFilters` Type:** Change `occasions?: number[];` to `occasions?: string[];`.
    *   **`fetchRecommendations` Function:** Modify parameter appending: `if (filters.occasions?.length) params.append('occasions', filters.occasions.join(','));`

3.  **Update Frontend Context Provider (`SilleFront/components/aibox/AIBoxProvider.tsx`)**
    *   **Goal:** Refactor state and functions to use occasion names.
    *   **State:** Rename `selectedOccasionIds` to `selectedOccasionNames` (type `string[]`).
    *   **State Setter:** Rename `setSelectedOccasionIds` to `setSelectedOccasionNames`.
    *   **Props Type (`AIBoxProviderProps`):** Update to use `selectedOccasionNames: string[]` and `setSelectedOccasionNames`.
    *   **`loadRecommendations` Function:** Update signature (`occasions?: string[]`) and ensure it passes names to `fetchRecommendations`.
    *   **`handleMaxPriceChange` Function:** Update call to `loadRecommendations` to pass `selectedOccasionNames`.
    *   **Initial Load Effect:** Update call to `loadRecommendations` to pass `selectedOccasionNames`.
    *   **Returned Props:** Return `selectedOccasionNames` and `setSelectedOccasionNames`.

4.  **Update This Refactor Plan Document (`SilleFront/memory-bank/occasion-selection-refactor-plan.md`)**
    *   **(This step is being done now by writing this file).**

5.  **Update `app/(tabs)/aibox.tsx` (Future Implementation)**
    *   **Goal:** Modify the navigation action to pass selected occasion *names*.
    *   **Details:**
        *   Identify the `Pressable` triggering navigation.
        *   Ensure the selected occasion data includes its name.
        *   Update `router.push` to include `occasionNames` (e.g., `occasionNames=Work,Date%20Night`).
    *   **Files Affected:** `app/(tabs)/aibox.tsx`

6.  **Refactor `app/occasion-selection.tsx` (Future Implementation)**
    *   **Goal:** Replace mock data with API calls using occasion names, integrate reusable components, implement remove/replace logic.
    *   **Details:**
        *   Update `useLocalSearchParams` to receive and parse the `occasionNames` parameter.
        *   Remove `MOCK_PERFUMES` import.
        *   Import necessary components and the updated context (`AIBoxProvider`).
        *   Wrap content with `AIBoxProvider`.
        *   Configure Provider to:
            *   Fetch data using `fetchRecommendations`, passing `occasionNames` and `priceRange`.
            *   Manage state via context (`isLoading`, `error`, `recommendedPerfumes`, `selectedPerfumeIds`).
            *   Implement `handleRemovePerfume`, `handleReplacePerfume`.
        *   Integrate context state/functions, loading/error states, interactions, reusable components, and search modal.
        *   Verify `handleAddToCart` uses `'OCCASION_BOX'`.
    *   **Files Affected:** `app/occasion-selection.tsx`, `components/aibox/AIBoxProvider.tsx`.

**Conceptual Mermaid Diagram:**

```mermaid
graph TD
    subgraph Backend Changes
        B1[api/filters.py] --> B2(Modify filter_occasions: Name -> ID Lookup -> Filter);
        B1 --> B3(Modify filter_perfume_occasions: Name -> ID Lookup -> Filter);
    end

    subgraph Frontend Changes
        F1[api.ts] --> F2(Update PerfumeFilters type: occasions: string[]);
        F1 --> F3(Modify fetchRecommendations: send names);
        F4[AIBoxProvider.tsx] --> F5(Rename state/props: ID -> Name);
        F4 --> F6(Update loadRecommendations call: pass names);
        F7[aibox.tsx] -- Future --> F8(Pass Occasion Names via Nav);
        F9[occasion-selection.tsx] -- Future --> F10(Use updated Context);
        F10 --> F6;
    end

    subgraph Plan Update
        P1[This Document] --> P2(Reflects Name-Based Approach);
    end

    B1 --> F1;
    F4 --> F9;
    P1 -- Guides --> F7;
    P1 -- Guides --> F9;