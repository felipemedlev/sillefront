# Plan: Search Screen Filtering and Sorting

**Overall Goal:** Enhance the Search screen (`app/(tabs)/(search)/index.tsx`) with a filter modal (Brand, Occasion, Price Range, Gender, Day/Night, Season) and sorting buttons (Price, AI Match, Rating, Longevity, Sillage, Price/Value).

---

**Phase 1: Data Model Update (Prerequisite - Requires Code Mode)**

*   **Objective:** Add the necessary `gender` field to the perfume data.
*   **Files to Modify:**
    *   `types/perfume.ts`
    *   `data/mockPerfumes.ts`
*   **Steps (Code Mode):**
    1.  **Update `Perfume` Type:** In `types/perfume.ts`, add `gender: 'masculino' | 'femenino' | 'unisex';` to the `Perfume` interface.
    2.  **Update Mock Data:** In `data/mockPerfumes.ts`, add the `gender` property with the appropriate value (`'masculino'`, `'femenino'`, or `'unisex'`) to *each* perfume object within the `MOCK_PERFUMES` array.

---

**Phase 2: State Management Setup (`app/(tabs)/(search)/index.tsx`)**

*   **Objective:** Add state variables to manage filters, sorting, and modal visibility.
*   **Files to Modify:**
    *   `app/(tabs)/(search)/index.tsx`
*   **Steps (Code Mode):**
    1.  **Import `useState`:** Ensure `useState` is imported from 'react'.
    2.  **Define Filter State Type:** Create an interface for the filter state, e.g.:
        ```typescript
        interface ActiveFilters {
          brands: string[];
          occasions: string[];
          priceRange: { min: number; max: number } | null;
          genders: string[]; // 'masculino', 'femenino', 'unisex'
          dayNights: string[]; // 'Día', 'Noche', 'Ambos'
          seasons: string[]; // 'Invierno', 'Otoño', 'Primavera', 'Verano'
        }
        const initialFilters: ActiveFilters = {
          brands: [],
          occasions: [],
          priceRange: null, // Or set initial min/max based on data
          genders: [],
          dayNights: [],
          seasons: [],
        };
        ```
    3.  **Add Filter State:** `const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initialFilters);`
    4.  **Define Sort State Type:**
        ```typescript
        type SortDirection = 'asc' | 'desc' | null;
        interface ActiveSort {
          field: keyof Perfume | 'matchPercentage' | null; // Allow sorting by fields in Perfume or matchPercentage
          direction: SortDirection;
        }
        const initialSort: ActiveSort = { field: null, direction: null };
        ```
    5.  **Add Sort State:** `const [activeSort, setActiveSort] = useState<ActiveSort>(initialSort);`
    6.  **Add Modal Visibility State:** `const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);`

---

**Phase 3: UI Updates (Search Bar & Sort Buttons)**

*   **Objective:** Add the filter icon to the search bar and create the row of sorting buttons below it.
*   **Files to Modify:**
    *   `components/search/SearchBar.tsx`
    *   `app/(tabs)/(search)/index.tsx`
*   **Steps (Code Mode):**
    1.  **Update `SearchBar.tsx`:**
        *   Add `onFilterPress?: () => void;` to `SearchBarProps`.
        *   Destructure `onFilterPress` from props.
        *   Add a `TouchableOpacity` wrapping a `Feather` icon (e.g., `name="filter"`) next to the `TextInput` container (inside `searchContainer` or adjacent to it). Style appropriately.
        *   Set the `onPress` of this `TouchableOpacity` to `onFilterPress`.
    2.  **Update `SearchScreen` (`app/(tabs)/(search)/index.tsx`):**
        *   Pass the `onFilterPress` handler to the `<SearchBar>` component: `onFilterPress={() => setIsFilterModalVisible(true)}`.
        *   **Create Sort Buttons:**
            *   Define an array for sort button configurations:
                ```typescript
                const sortOptions: { label: string; field: ActiveSort['field'] }[] = [
                  { label: 'Precio', field: 'pricePerML' },
                  { label: 'Match AI', field: 'matchPercentage' },
                  { label: 'Valoración', field: 'overallRating' },
                  { label: 'Duración', field: 'longevityRating' },
                  { label: 'Estela', field: 'sillageRating' },
                  { label: 'Calidad/Precio', field: 'priceValueRating' },
                ];
                ```
            *   Implement the `handleSortPress` function:
                ```typescript
                const handleSortPress = (field: ActiveSort['field']) => {
                  setActiveSort(currentSort => {
                    let newDirection: SortDirection = 'asc'; // Default to ascending
                    if (currentSort.field === field) {
                      // Toggle direction if same field is pressed
                      if (currentSort.direction === 'asc') newDirection = 'desc';
                      else if (currentSort.direction === 'desc') newDirection = null; // Third press clears
                      else newDirection = 'asc'; // If null, start with asc
                    }
                    // If direction becomes null, clear the field too
                    const newField = newDirection === null ? null : field;
                    return { field: newField, direction: newDirection };
                  });
                };
                ```
            *   Render the sort buttons below the `<SearchBar>`:
                *   Use a `View` with `flexDirection: 'row'`, `flexWrap: 'wrap'`, `justifyContent: 'space-around'`, and appropriate padding/margin.
                *   Map over `sortOptions` to create `TouchableOpacity` buttons.
                *   Set `onPress={() => handleSortPress(option.field)}` for each button.
                *   Style the buttons. Add visual indication (e.g., background color, icon `arrow-up`/`arrow-down`) for the `activeSort.field` and `activeSort.direction`.

---

**Phase 4: Filter Modal Implementation (`components/search/FilterModal.tsx`)**

*   **Objective:** Create a reusable modal component for applying filters.
*   **Files to Create/Modify:**
    *   `components/search/FilterModal.tsx` (New File)
    *   `app/(tabs)/(search)/index.tsx`
*   **Steps (Code Mode):**
    1.  **Create `FilterModal.tsx`:**
        *   **Props:** `isVisible: boolean`, `onClose: () => void`, `initialFilters: ActiveFilters`, `onApplyFilters: (filters: ActiveFilters) => void`, `allBrands: string[]`, `allOccasions: string[]`, `minPrice: number`, `maxPrice: number`.
        *   **Internal State:** Use `useState` to manage the *temporary* filter selections within the modal, initialized from `initialFilters`.
        *   **UI:**
            *   Use `Modal` component (or a side-drawer/bottom-sheet library adapted for right-side opening). Style for slide-in from right.
            *   Add overlay background.
            *   Add container view with padding, header ("Filtros", Close Button), and `ScrollView`.
            *   **Sections:** Create sections for "Marca", "Ocasión", "Rango de Precio", "Género", "Uso (Día/Noche)", "Temporada".
            *   **Marca/Ocasión/Género/Uso/Temporada:** Use checkboxes (build a custom Checkbox component or use a library) mapped from available options (`allBrands`, `allOccasions`, etc.). Manage selected values in the temporary state.
            *   **Rango de Precio:** Use a slider component (e.g., `@react-native-community/slider` with custom styling for range, or a dedicated range slider library) bound to the temporary price range state. Display min/max values.
            *   **Buttons:** Add "Limpiar Filtros" and "Aplicar Filtros" buttons at the bottom.
        *   **Logic:**
            *   `handleApply`: Call `onApplyFilters` with the temporary filter state and then call `onClose`.
            *   `handleClear`: Reset the temporary filter state to `initialFilters` (or completely empty state) and call `onApplyFilters` with the cleared state, then call `onClose`.
            *   `handleClose`: Call `onClose` without applying changes.
    2.  **Update `SearchScreen` (`app/(tabs)/(search)/index.tsx`):**
        *   Import `FilterModal`.
        *   **Prepare Modal Data:** Before rendering, derive `allBrands`, `allOccasions`, `minPrice`, `maxPrice` from `perfumesWithMatch`.
        *   Render `<FilterModal>` conditionally based on `isFilterModalVisible`.
        *   Pass required props: `isVisible`, `onClose={() => setIsFilterModalVisible(false)}`, `initialFilters={activeFilters}`, `onApplyFilters={setActiveFilters}`, `allBrands`, `allOccasions`, `minPrice`, `maxPrice`.

---

**Phase 5: Filtering & Sorting Logic Integration (`app/(tabs)/(search)/index.tsx`)**

*   **Objective:** Apply the selected filters and sorting criteria to the perfume list.
*   **Files to Modify:**
    *   `app/(tabs)/(search)/index.tsx`
*   **Steps (Code Mode):**
    1.  **Modify `filteredPerfumes` Memo:**
        *   Update dependencies: `[searchQuery, perfumesWithMatch, activeFilters]`.
        *   Inside the memo function:
            *   Start with `perfumesWithMatch`.
            *   Apply `searchQuery` filter.
            *   Apply `activeFilters`: Iterate through each filter type (brands, occasions, priceRange, genders, dayNights, seasons). If the filter array/value is set, filter the perfumes accordingly. Use the agreed mappings for `dayNightRating` and `seasonRating`.
            *   Return the filtered list.
    2.  **Create `sortedAndFilteredPerfumes` Memo:**
        *   **Dependencies:** `[filteredPerfumes, activeSort]`.
        *   Inside the memo function:
            *   Take `filteredPerfumes` as input.
            *   If `activeSort.field` and `activeSort.direction` are set:
                *   Create a sortable copy of the array (`[...filteredPerfumes]`).
                *   Use the `.sort((a, b) => { ... })` method.
                *   Inside the sort function, compare `a[activeSort.field]` and `b[activeSort.field]`. Handle potential `undefined` values and different data types (string vs. number).
                *   Apply `activeSort.direction` ('asc' or 'desc').
            *   Return the sorted (or original if no sort applied) array.
    3.  **Update `SearchResults` Prop:** Pass `sortedAndFilteredPerfumes` to the `perfumes` prop of the `<SearchResults>` component.

---

**Phase 6: Memory Bank Update (Architect Mode)**

*   **Objective:** Document the plan and decisions.
*   **Files to Create/Modify:**
    *   `memory-bank/search-filter-sort-plan.md` (New File)
    *   `memory-bank/decisionLog.md`
    *   `memory-bank/progress.md`
    *   `memory-bank/activeContext.md`
*   **Steps (Architect Mode):**
    1.  **Create Plan File:** Use `write_to_file` to save this plan to `memory-bank/search-filter-sort-plan.md`.
    2.  **Update Decision Log:** Use `insert_content` to add entries to `decisionLog.md` summarizing the key decisions:
        *   Filter modal content (Brand, Occasion, Price Range, Gender, Day/Night, Season).
        *   UI elements for filters (Checkboxes, Range Slider).
        *   Sorting button criteria and toggle behavior (Price, AI Match, etc.; asc/desc/null toggle).
        *   Requirement to add `gender` field to data.
        *   Agreed mappings for `dayNightRating` and `seasonRating`.
    3.  **Update Progress:** Use `insert_content` to add tasks to `progress.md` under "Upcoming Tasks" corresponding to the phases above (e.g., "Implement Search Filter Modal UI", "Integrate Search Filtering Logic", "Implement Search Sorting Buttons").
    4.  **Update Active Context:** Use `insert_content` to update `activeContext.md`'s "Current Focus" section to "Implementing Search Screen Filtering and Sorting".

---

**Mermaid Diagram (High-Level):**

```mermaid
graph TD
    subgraph Search Screen (index.tsx)
        A[User Interaction] --> B(SearchBar);
        A --> C(Sort Buttons);
        A --> D(SearchResults List);
        B -- Input --> E{Update searchQuery State};
        B -- Filter Icon Press --> F{Set isFilterModalVisible = true};
        C -- Button Press --> G{Update activeSort State};
        F --> H[Render FilterModal];
    end

    subgraph State Management (index.tsx)
        I[perfumesWithMatch] --> J{Filtering Logic};
        E --> J;
        K[activeFilters State] --> J;
        J -- Filtered List --> L{Sorting Logic};
        G --> L;
        L -- Sorted & Filtered List --> D;
    end

    subgraph Filter Modal (FilterModal.tsx)
        H -- Props (isVisible, initialFilters, onApply, onClose) --> M[Modal UI];
        M -- User Changes Filters --> N{Update Temporary Filter State};
        M -- Apply Press --> O[Call onApplyFilters(tempState)];
        M -- Clear Press --> P[Call onApplyFilters(clearedState)];
        M -- Close Press --> Q[Call onClose];
        O --> K;
        P --> K;
        O & P & Q --> R{Set isFilterModalVisible = false};
    end

    subgraph Data (Prerequisite)
        S[types/perfume.ts] --> T{Add gender field};
        U[data/mockPerfumes.ts] --> V{Add gender data};
        T & V --> I;
    end

    style J fill:#ccf,stroke:#333,stroke-width:1px
    style L fill:#ccf,stroke:#333,stroke-width:1px
    style M fill:#cfc,stroke:#333,stroke-width:1px