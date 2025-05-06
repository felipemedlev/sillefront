# Shopping Cart Implementation Plan

This document outlines the steps to implement shopping cart functionality in the Sille application.

## 1. Define Cart Data Structures (`types/cart.ts`)

- Create a new file `types/cart.ts`.
- Define interfaces to represent items in the cart:
    - `ProductType`: An enum or union type for different product categories (e.g., `'AI_BOX'`, `'MANUAL_BOX'`, `'GIFT_BOX'`, `'OCCASION_BOX'`).
    - `BoxDetails`: An interface to hold specifics for box-type products (e.g., `decantCount: number`, `decantSize: number`, `perfumes: BasicPerfumeInfo[]`). Reuse/adapt existing types.
    - `CartItem`: The main interface for a cart entry.
        - `id: string` (Unique identifier, e.g., UUID).
        - `productType: ProductType`.
        - `name: string` (e.g., "AI Discovery Box").
        - `details: BoxDetails`.
        - `price: number`.
        - `thumbnail_url?: string`.

## 2. Create Cart Context (`context/CartContext.tsx`)

- Create a new file `context/CartContext.tsx`.
- Implement `CartProvider` using `React.Context`.
- **State:**
    - `cartItems: CartItem[]`.
    - `isLoading: boolean`.
- **Functions:**
    - `addItemToCart(itemData: Omit<CartItem, 'id'>)`: Generates ID, adds item, persists.
    - `removeItemFromCart(itemId: string)`: Removes item, persists.
    - `updateItemInCart(itemId: string, updates: Partial<CartItem>)`: (Optional for future use).
    - `clearCart()`: Clears state and storage.
- **Derived State:**
    - `totalCartPrice: number`.
    - `totalCartItems: number`.
- **Persistence:** Use `AsyncStorage` with key `STORAGE_KEYS.CART`.
- Export `useCart` hook.

## 3. Integrate Cart Provider (`app/_layout.tsx`)

- Import `CartProvider`.
- Wrap existing providers with `<CartProvider>`.

## 4. Update "Add to Cart" Logic

- **`app/aibox-selection.tsx`:**
    - Import `useCart`.
    - Modify `handleAddToCart` to construct `itemData` and call `addItemToCart`.
    - Add optional user feedback.
- **`app/manual-box.tsx`:**
    - Import `useCart`.
    - Modify `handleAddToCart` to construct `itemData` and call `addItemToCart`.
    - Add optional user feedback.

## 5. Build Cart Screen (`app/(tabs)/(cart)/index.tsx`)

- Import `useCart`.
- Display loading state.
- Show "Empty Cart" message if needed.
- Use `FlatList` to render `cartItems` via `CartItemComponent`.
- Display `totalCartPrice`.
- Add "Proceed to Checkout" button (future).
- Add "Clear Cart" button (optional).

## 6. Build Cart Item Component (`components/cart/CartItem.tsx`)

- Create/Update `components/cart/CartItem.tsx`.
- **Props:** `item: CartItem`, `onRemove: (itemId: string) => void`.
- **UI:** Display item details (name, price, key details, thumbnail). Include a "Remove" button calling `onRemove`.

## Mermaid Diagram

```mermaid
graph LR
    subgraph Core Logic
        CartContext[context/CartContext.tsx]
        CartTypes[types/cart.ts]
        AsyncStorage[(AsyncStorage)]
    end

    subgraph Screens & Components
        AppLayout[app/_layout.tsx]
        AIBoxScreen[app/aibox-selection.tsx]
        ManualBoxScreen[app/manual-box.tsx]
        CartScreen[app/(tabs)/(cart)/index.tsx]
        CartItemComp[components/cart/CartItem.tsx]
        BottomBar[components/product/BottomBar.tsx]
    end

    %% Relationships
    AppLayout -- Wraps with --> CartContext

    AIBoxScreen -- Uses --> BottomBar
    ManualBoxScreen -- Uses --> BottomBar

    BottomBar -- Triggers Add --> AIBoxScreen
    BottomBar -- Triggers Add --> ManualBoxScreen

    AIBoxScreen -- Calls --> CartContext
    ManualBoxScreen -- Calls --> CartContext

    CartScreen -- Uses --> CartContext
    CartScreen -- Renders --> CartItemComp

    CartItemComp -- Uses --> CartContext %% For remove action

    CartContext -- Manages State --> CartItemsArray[CartItem[]]
    CartContext -- Uses Types --> CartTypes
    CartContext -- Persists/Loads --> AsyncStorage

    CartItemsArray -- Contains --> CartItemType{CartItem}
    CartItemType -- Defined In --> CartTypes

    style CartContext fill:#f9f,stroke:#333,stroke-width:2px
    style CartTypes fill:#cfc,stroke:#333,stroke-width:2px
    style CartScreen fill:#ccf,stroke:#333,stroke-width:2px
    style CartItemComp fill:#ccf,stroke:#333,stroke-width:2px