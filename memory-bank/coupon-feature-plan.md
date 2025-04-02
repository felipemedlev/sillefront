# Coupon Discount Feature Implementation Plan

1.  **Define Coupon Data Structure (`types/coupon.ts`):**
    *   Create a new file `types/coupon.ts`.
    *   Define the `Coupon` interface:
        ```typescript
        export type DiscountType = 'percentage' | 'fixed';

        export interface Coupon {
          id: string; // Unique ID for the coupon
          code: string; // User-facing code (e.g., "SUMMER10") - Make this uppercase for easier comparison
          discountType: DiscountType;
          value: number; // Percentage (e.g., 10 for 10%) or fixed amount (e.g., 5000 for $5000 CLP)
          description?: string; // Optional description
          minPurchaseAmount?: number; // Minimum cart total required to apply
          expiryDate?: number; // Optional expiry timestamp (milliseconds since epoch)
          // Add other potential restrictions later (e.g., specific products, usage limits)
        }
        ```

2.  **Create Mock Coupons (`data/MOCK_COUPONS.ts`):**
    *   Create the file `data/MOCK_COUPONS.ts`.
    *   Import the `Coupon` type.
    *   Define and export an array `MOCK_COUPONS: Coupon[]` with a few sample coupons:
        ```typescript
        import { Coupon } from '../types/coupon';

        export const MOCK_COUPONS: Coupon[] = [
          {
            id: 'coupon-001',
            code: 'SILLÉ10', // Uppercase
            discountType: 'percentage',
            value: 10, // 10%
            description: '10% de descuento en tu compra.',
            minPurchaseAmount: 20000,
          },
          {
            id: 'coupon-002',
            code: 'DESC5000', // Uppercase
            discountType: 'fixed',
            value: 5000, // $5000 CLP
            description: '$5.000 de descuento.',
            minPurchaseAmount: 30000,
          },
          {
            id: 'coupon-003',
            code: 'EXPIRADO', // Uppercase
            discountType: 'percentage',
            value: 20,
            description: 'Cupón expirado de prueba.',
            expiryDate: Date.now() - 86400000 // Expired yesterday
          },
        ];
        ```

3.  **Extend Cart Context (`context/CartContext.tsx`):**
    *   **State:**
        *   Add `appliedCoupon: Coupon | null` state (initially `null`).
        *   Add `couponError: string | null` state (initially `null`).
    *   **Functions:**
        *   Implement `applyCoupon(couponCode: string): Promise<void>`:
            *   Takes a `couponCode` string (convert to uppercase for comparison).
            *   Finds the coupon in `MOCK_COUPONS`.
            *   Performs validation:
                *   Exists?
                *   Expired? (`expiryDate`)
                *   Minimum purchase met? (`minPurchaseAmount` vs `totalCartPrice`)
            *   If valid: Set `appliedCoupon` state, clear `couponError`.
            *   If invalid: Set `couponError` state with an appropriate message (e.g., "Código inválido", "Cupón expirado", "Monto mínimo no alcanzado"), set `appliedCoupon` to `null`.
        *   Implement `removeCoupon(): Promise<void>`:
            *   Sets `appliedCoupon` to `null`.
            *   Clears `couponError`.
    *   **Derived State (Memoized):**
        *   Modify the existing `useMemo` for `totalCartPrice` (or create new ones) to calculate:
            *   `discountAmount: number`: Calculated based on `appliedCoupon` and `totalCartPrice`.
            *   `finalPrice: number`: Calculated as `totalCartPrice - discountAmount`. Ensure it doesn't go below zero.
    *   **Context Value:** Add `appliedCoupon`, `couponError`, `applyCoupon`, `removeCoupon`, `discountAmount`, `finalPrice` to the context value.

4.  **Update Cart Types (`types/cart.ts`):**
    *   Modify `CartContextType` to include the new state and functions added in step 3.

5.  **Update Cart Screen UI (`app/(tabs)/(cart)/index.tsx`):**
    *   **Import:** Import `TextInput`, `useState` from React, `MOCK_COUPONS`, `Coupon` type.
    *   **State:** Add local state for the coupon input field: `const [couponInput, setCouponInput] = useState('');`.
    *   **Modify `renderFooter`:**
        *   Add a `View` section *before* the `totalContainer`.
        *   Inside this new view:
            *   Add a `TextInput` component styled appropriately (placeholder: "Ingresa tu cupón"). Bind its value to `couponInput` and `onChangeText` to `setCouponInput`.
            *   Add a `TouchableOpacity` button ("Aplicar") next to the input. Its `onPress` should call `cartContext.applyCoupon(couponInput)`. Disable if `couponInput` is empty.
        *   Conditionally display `cartContext.couponError` below the input if it's not null.
        *   **If `cartContext.appliedCoupon` is not null:**
            *   Hide the input and "Aplicar" button.
            *   Display the applied coupon details:
                *   Text showing `Coupon: ${appliedCoupon.code}`.
                *   Text showing the discount: `Descuento: -$${discountAmount.toLocaleString('de-DE')}`.
                *   Add a "Quitar Cupón" `TouchableOpacity` that calls `cartContext.removeCoupon()`.
        *   **Update Total Display:** Modify the `totalContainer` to show the `finalPrice` instead of `totalCartPrice`.
            ```jsx
            <Text style={styles.totalPrice}>${finalPrice.toLocaleString('de-DE')}</Text>
            ```

6.  **Update Navigation to Checkout (`app/(tabs)/(cart)/index.tsx`):**
    *   Modify `handleCheckoutPress`:
        *   When calling `router.push('/checkout')`, pass the `finalPrice` as a parameter:
            ```javascript
            router.push({
              pathname: '/checkout',
              params: { finalPrice: finalPrice }, // Pass final price
            });
            ```
    *   **(Code Mode Task):** The `app/checkout.tsx` screen will need to be updated later to:
        *   Use `useLocalSearchParams` to retrieve the `finalPrice`.
        *   Display this `finalPrice` in the order summary.
        *   Use this `finalPrice` for the payment integration.

**Mermaid Diagram:**

```mermaid
graph TD
    subgraph Data & Types
        A[types/coupon.ts] --> B(Define Coupon Interface);
        C[data/MOCK_COUPONS.ts] -- Uses --> B;
        C --> D{Define Mock Coupon Array};
        E[types/cart.ts] --> F(Update CartContextType);
    end

    subgraph Context Logic (context/CartContext.tsx)
        G[CartProvider State] --> H{Add appliedCoupon, couponError};
        G --> I{Calculate discountAmount, finalPrice};
        J[CartProvider Functions] --> K{Implement applyCoupon};
        J --> L{Implement removeCoupon};
        M[Context Value] -- Includes --> H;
        M -- Includes --> I;
        M -- Includes --> K;
        M -- Includes --> L;
        K -- Validates Against --> D;
        I -- Uses --> H;
    end

    subgraph UI (app/(tabs)/(cart)/index.tsx)
        N[CartScreen UI] -- Uses --> M;
        N --> O(Add Coupon TextInput & Apply Button);
        O -- On Press --> K;
        N --> P{Display Applied Coupon & Remove Button};
        P -- On Remove Press --> L;
        N --> Q{Display Coupon Error};
        Q -- Reads --> H;
        N --> R(Display finalPrice);
        R -- Reads --> I;
        S[Checkout Button] -- On Press --> T{Navigate to /checkout};
        T -- Passes Param --> I;
    end

    subgraph Checkout Screen (app/checkout.tsx - Future Task)
        U[Checkout Screen] -- Reads Param --> I;
        U --> V(Display finalPrice in Summary);
        U --> W(Use finalPrice for Payment);
    end

    F -- Includes --> H;
    F -- Includes --> I;
    F -- Includes --> K;
    F -- Includes --> L;

    style A fill:#cfc,stroke:#333,stroke-width:2px
    style C fill:#cfc,stroke:#333,stroke-width:2px
    style E fill:#cfc,stroke:#333,stroke-width:2px
    style G fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#f9f,stroke:#333,stroke-width:2px
    style N fill:#ccf,stroke:#333,stroke-width:2px
    style U fill:#ccf,stroke:#333,stroke-width:2px