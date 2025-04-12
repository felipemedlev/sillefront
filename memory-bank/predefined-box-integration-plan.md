# Predefined Box API Integration Plan

This document outlines the steps to integrate the predefined gift box data from the backend API into the React Native frontend, replacing the current mock data implementation.

**Target Files:**

*   Backend:
    *   `SilleBack/api/serializers.py`
    *   `SilleBack/api/views.py`
*   Frontend:
    *   `SilleFront/src/services/api.ts`
    *   `SilleFront/app/(tabs)/giftbox.tsx`
    *   `SilleFront/components/product/PredefinedBoxModal.tsx`

**Analysis:**

*   The `PredefinedBox` model (`SilleBack/api/models.py`) contains the necessary fields (`id`, `title`, `description`, `icon`, `gender`, `perfumes`).
*   The `PredefinedBoxSerializer` (`SilleBack/api/serializers.py`) currently only exposes `id`, `name` (should be `title`?), `description`, and nested `perfumes` (with `id`, `name`, `brand`, `thumbnailUrl`, `pricePerML`). It needs to be updated to include `icon` and `gender`.
*   The `PredefinedBoxViewSet` (`SilleBack/api/views.py`) currently fetches all boxes without filtering. Backend filtering by `gender` is desirable for efficiency.
*   The frontend components (`giftbox.tsx`, `PredefinedBoxModal.tsx`) rely on mock data and need adaptation for API data fetching, state management, price calculation, and rendering.

**Proposed Plan:**

**Phase 1: Backend Modifications**

1.  **Update Serializer (`SilleBack/api/serializers.py`):**
    *   Modify `PredefinedBoxSerializer` to include the `icon` and `gender` fields. Ensure the `name` field in the serializer corresponds to the `title` field in the model, or adjust accordingly.
    ```python
    # Example modification in PredefinedBoxSerializer
    class Meta:
        model = PredefinedBox
        fields = ('id', 'title', 'description', 'icon', 'gender', 'perfumes') # Added icon, gender, corrected name->title
    ```
2.  **Add Backend Filtering (`SilleBack/api/views.py`):**
    *   Import `DjangoFilterBackend`: `from django_filters.rest_framework import DjangoFilterBackend`
    *   Add `DjangoFilterBackend` to `filter_backends` in `PredefinedBoxViewSet`.
    *   Define `filterset_fields = ['gender']` in `PredefinedBoxViewSet`.
    ```python
    # Example modification in PredefinedBoxViewSet
    from django_filters.rest_framework import DjangoFilterBackend # Add import

    class PredefinedBoxViewSet(viewsets.ReadOnlyModelViewSet):
        # ... existing queryset, serializer_class, permission_classes ...
        filter_backends = [DjangoFilterBackend] # Add filter backend
        filterset_fields = ['gender'] # Enable filtering by gender
    ```

**Phase 2: Frontend Modifications**

1.  **API Service (`SilleFront/src/services/api.ts`):**
    *   Create `getPredefinedBoxes(gender?: string)` function to fetch from `/api/predefined-boxes/` (adjust endpoint if needed). Append `?gender={gender}` if provided.
    *   Define TypeScript interfaces for the API response structure (e.g., `ApiPredefinedBox`, `ApiPerfumeSummary`).
2.  **Gift Box Screen (`SilleFront/app/(tabs)/giftbox.tsx`):**
    *   **Data Fetching:** Use `useState` and `useEffect` to call `getPredefinedBoxes`, passing `generoSeleccionado`.
    *   **State Update:** Remove mock data imports (`PREDEFINED_BOXES`, `MOCK_PERFUMES`). Use fetched data state.
    *   **Filtering/Calculation:**
        *   Update `calculateBoxPrice` to use `pricePerML` from fetched `perfumes`.
        *   Update `useMemo` for `filteredBoxes` to filter based on price range using the calculated price. Gender filtering is now primarily backend-driven.
    *   **Rendering:** Use fields from fetched data (`box.title`, `box.icon`, etc.). Pass fetched box object to modal.
3.  **Predefined Box Modal (`SilleFront/components/product/PredefinedBoxModal.tsx`):**
    *   **Data Handling:** Receive fetched `boxData` prop. Remove `MOCK_PERFUMES` import.
    *   **Calculations:** Update `perfumesToShow` and `totalPrice` based on `boxData.perfumes`.
    *   **Rendering:** Display data from `perfumesToShow`.
    *   **Add to Cart:** Update `handleAddToCart` to use fetched data and calculated price.

**Data Flow Diagram (Mermaid):**

```mermaid
sequenceDiagram
    participant User
    participant GiftboxScreen as GiftboxScreen (FE)
    participant APIService as API Service (FE)
    participant PredefinedBoxViewSet as PredefinedBoxViewSet (BE)
    participant PredefinedBoxModal as PredefinedBoxModal (FE)
    participant CartContext as CartContext (FE)

    User->>GiftboxScreen: Selects Gender Filter
    GiftboxScreen->>APIService: getPredefinedBoxes(gender)
    APIService->>PredefinedBoxViewSet: GET /api/predefined-boxes/?gender=...
    PredefinedBoxViewSet-->>APIService: Returns Filtered Boxes (with perfumes, gender, icon)
    APIService-->>GiftboxScreen: Returns Fetched Boxes
    GiftboxScreen->>GiftboxScreen: Calculates prices, filters by price range
    GiftboxScreen->>User: Displays Filtered Boxes
    User->>GiftboxScreen: Clicks on a Box
    GiftboxScreen->>PredefinedBoxModal: Opens Modal with selected Box Data (incl. perfumes)
    PredefinedBoxModal->>PredefinedBoxModal: Calculates Total Price from Box Data
    PredefinedBoxModal->>User: Displays Box Details & Perfumes
    User->>PredefinedBoxModal: Clicks "Add to Cart"
    PredefinedBoxModal->>CartContext: addItemToCart(boxItemData)
    CartContext-->>PredefinedBoxModal: Confirms Addition
    PredefinedBoxModal->>GiftboxScreen: Closes Modal