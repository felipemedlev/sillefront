# Feature Plan: Predefined Gift Boxes (Strict Gender Filtering)

This document outlines the plan to implement a feature allowing users to select predefined gift boxes based on gender, view their contents in a modal, and add them to the cart.

**Phase 1: Data Structure and Setup**

1.  **Define Predefined Box Data (`data/predefinedBoxes.ts`):**
    *   Create/Modify file: `data/predefinedBoxes.ts`.
    *   Define/Modify the `PredefinedBox` interface and `BoxGender` type:
        ```typescript
        import { Feather } from '@expo/vector-icons';

        export type BoxGender = 'masculino' | 'femenino'; // Strict gender type

        export interface PredefinedBox {
          id: string;
          title: string; // Thematic name
          description: string;
          icon: keyof typeof Feather.glyphMap;
          gender: BoxGender; // Uses updated type
          perfumeIds: string[]; // Array of perfume IDs (at least 8)
        }
        ```
    *   Create/Modify and export the array `PREDEFINED_BOXES: PredefinedBox[]`.
    *   Ensure each box has the `gender` property set to either `'masculino'` or `'femenino'`. Ensure sufficient boxes for both.
        *   *Example Entry:*
            ```typescript
            {
              id: 'box-summer-vibes-m',
              title: 'Summer Vibes Box (Him)',
              description: 'Fresh and vibrant scents perfect for sunny days.',
              icon: 'sun',
              gender: 'masculino', // Must be 'masculino' or 'femenino'
              perfumeIds: ['410', '485', '72158', '9099', '...', '...', '...', '...']
            },
            // ... other boxes
            ```

2.  **Update Cart Types (`types/cart.ts`):**
    *   Locate the `ProductType` definition.
    *   Ensure `'PREDEFINED_BOX'` is included as a possible type.

**Phase 2: Update Gift Box Screen (`app/(tabs)/giftbox.tsx`)**

1.  **Import and Replace Data:**
    *   Remove old `cajasRegalo` and `TarjetaCajaRegalo`.
    *   Import `PREDEFINED_BOXES` and `PredefinedBox` from `data/predefinedBoxes.ts`.
2.  **State Management:**
    *   Add state for modal visibility and selected box:
        ```typescript
        const [isModalVisible, setIsModalVisible] = useState(false);
        const [selectedBox, setSelectedBox] = useState<PredefinedBox | null>(null);
        ```
3.  **Render Cards (with Filtering):**
    *   Modify the rendering logic. Update the filter to strictly match `generoSeleccionado`:
        ```jsx
        <View style={styles.cardsContainer}>
          {PREDEFINED_BOXES
            .filter(box => box.gender === generoSeleccionado) // Strict gender match
            .map((box) => (
              <TouchableOpacity
                key={box.id}
                style={[styles.card, { backgroundColor: getCardBgColor() }]}
                activeOpacity={0.8}
                onPress={() => handleBoxPress(box)}
              >
                {/* Card content using box.title, box.description, box.icon */}
                {/* ... */}
              </TouchableOpacity>
            ))}
        </View>
        ```
4.  **Implement Card Press Handler:**
    *   Create `handleBoxPress`:
        ```typescript
        const handleBoxPress = (box: PredefinedBox) => {
          setSelectedBox(box);
          setIsModalVisible(true);
        };
        ```
5.  **Render Modal:**
    *   Import `PredefinedBoxModal`.
    *   Add conditional rendering for the modal:
        ```jsx
        {selectedBox && (
          <PredefinedBoxModal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            boxData={selectedBox}
            decantCount={decantCount}
          />
        )}
        ```

**Phase 3: Create Predefined Box Modal (`components/product/PredefinedBoxModal.tsx`)**

1.  **Create File:** Create `components/product/PredefinedBoxModal.tsx`.
2.  **Component Structure:**
    *   Use `React.Modal`.
    *   Define props: `isVisible`, `onClose`, `boxData`, `decantCount`.
    *   Import `useCart`, `MOCK_PERFUMES`, React Native components.
3.  **Data Fetching and Calculation:**
    *   Use `useMemo` to get `perfumesToShow` based on `boxData.perfumeIds` and `decantCount`.
    *   Use `useMemo` to calculate `totalPrice` (fixed 5mL size).
4.  **Render Perfume List:**
    *   Use `ScrollView`/`FlatList`.
    *   Style items similar to `PerfumeList.tsx`. Include image, decant icon, name, brand, price/mL, total price (5mL).
5.  **Render "Add to Cart" Button:**
    *   Add a `Pressable` button ("Añadir al carro").
    *   Implement `onPress` handler (`handleAddToCart`).
6.  **Implement `handleAddToCart`:**
    *   Get `addItemToCart` from `useCart()`.
    *   Construct `itemData` (`productType: 'PREDEFINED_BOX'`, name, details with `decantCount`, `decantSize: 5`, `perfumes: BasicPerfumeInfo[]`, price, thumbnail).
    *   Call `addItemToCart` within a try/catch block.
    *   Provide user feedback (success/error).
    *   Call `onClose()` on success.
7.  **Styling:** Create `StyleSheet`, reuse styles from `PerfumeList.tsx` where applicable.

**Phase 4: Memory Bank Update (To be done after this file is written)**

1.  **Update Logs:**
    *   Append entries to `decisionLog.md`, `progress.md`, `activeContext.md` reflecting this plan and the strict gender filtering decision.

**Mermaid Diagram:**

```mermaid
graph TD
    subgraph Giftbox Screen (giftbox.tsx)
        A[User Selects Gender (generoSeleccionado)] --> B;
        B[User Selects Decant Count (4/8)] --> C{Filter PREDEFINED_BOXES};
        C -- by gender (strict) --> D[Render Filtered Predefined Box Cards];
        D -- User Clicks Card --> E{handleBoxPress};
        E -- Sets State --> F[Show PredefinedBoxModal];
    end

    subgraph Data
        G[data/predefinedBoxes.ts (no unisex)] --> C;
        H[data/mockPerfumes.ts] --> J;
    end

    subgraph Modal (PredefinedBoxModal.tsx)
        F -- Passes Props (boxData, decantCount) --> J[Modal Renders];
        J -- Uses boxData, decantCount --> K{Fetches Perfumes from mockPerfumes};
        K --> L[Displays Perfume List (5mL size)];
        L --> M[Displays Total Price];
        M --> N[Add to Cart Button];
        N -- User Clicks --> O{handleAddToCart};
    end

    subgraph Cart Logic
        O -- Uses CartContext --> P[Constructs CartItem (PREDEFINED_BOX)];
        P --> Q[Calls addItemToCart];
        Q --> R[Updates Cart State & AsyncStorage];
        O -- On Success --> S[Close Modal];
    end

    style F fill:#ccf,stroke:#333,stroke-width:2px
    style J fill:#ccf,stroke:#333,stroke-width:2px
    style Q fill:#f9f,stroke:#333,stroke-width:2px