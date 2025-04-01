# Implementation Plan: Profile Screen Features

**Overall Goal:** Enhance the profile section (`app/(tabs)/(profile)/`) by adding screens for Personal Information, Change Password, and Purchase History (using mock data), and updating the displayed user statistics.

**Phase 1: Update Authentication Context & Storage (Revised)**

*   **Objective:** Modify the authentication system to handle additional user details (added post-signup) and password updates locally.
*   **Files to Modify (via Code Mode):**
    *   `context/AuthContext.tsx`
*   **Steps:**
    1.  **Modify `User` Type:** In `AuthContext.tsx`, update the `User` type to include the new optional fields:
        ```typescript
        type User = {
          email: string;
          name?: string | null; // Optional & Nullable
          phone?: string | null; // Optional & Nullable
          address?: string | null; // Optional & Nullable
        };
        ```
    2.  **Update `AuthContextType`:** Add new functions for updating profile and password:
        ```typescript
        type AuthContextType = {
          // ... existing properties
          updateProfile: (updates: Omit<User, 'email'>) => Promise<void>;
          updatePassword: (newPassword: string) => Promise<void>;
        };
        ```
    3.  **Update `AuthProvider` State:** Ensure the `user` state can hold the new fields (which might be null initially).
    4.  **Update `loadUserFromStorage`:** Modify this function to load the *full* user object (including potentially null name, phone, address) from the `USER_${email}` storage entry. If the entry only contains the password (from an older signup), initialize the other fields as null in the context state.
    5.  **Update `login`:** Modify to load the *full* user object (including potentially null new fields) into the `user` state upon successful login.
    6.  **Implement `updateProfile` Function:**
        *   Accepts an `updates` object containing `name`, `phone`, `address`.
        *   Retrieves the current user's data from `AsyncStorage` (`USER_${email}`).
        *   Merges the `updates` with the existing data (which might only contain the password initially).
        *   Saves the updated user object back to `AsyncStorage`.
        *   Updates the `user` state in the context.
    7.  **Implement `updatePassword` Function:**
        *   Accepts `newPassword`.
        *   Retrieves the current user's data from `AsyncStorage` (`USER_${email}`).
        *   Updates the `password` field within the retrieved data.
        *   Saves the updated user object back to `AsyncStorage`.
    8.  **Update Context Value:** Include the new functions (`updateProfile`, `updatePassword`) in the memoized context value.
    9.  **(No Change)** The `signUp` function remains as is, only storing email and password in the `USER_${email}` entry.

**Phase 2: Implement "Información personal" Screen**

*   **Objective:** Create a screen for users to view and edit their profile details.
*   **Files to Create/Modify (via Code Mode):**
    *   `app/(tabs)/(profile)/personal-info.tsx` (New File)
    *   `app/(tabs)/(profile)/_layout.tsx`
    *   `app/(tabs)/(profile)/index.tsx`
*   **Steps:**
    1.  **Create Screen File:** Create `app/(tabs)/(profile)/personal-info.tsx`.
    2.  **Build UI:**
        *   Use standard React Native components (`View`, `Text`, `TextInput`, `TouchableOpacity`).
        *   Include a header with a title ("Información Personal") and a back button.
        *   Display input fields for:
            *   Email (consider making this read-only).
            *   Name.
            *   Phone.
            *   Address (potentially multi-line).
        *   Add a "Guardar Cambios" (Save Changes) button.
    3.  **Implement Logic:**
        *   Import `useAuth` to get the current `user` data and the `updateProfile` function.
        *   Use `useState` to manage the input field values, initialized with the `user` data from context.
        *   Implement the `onPress` handler for the save button:
            *   Call `auth.updateProfile` with the current state of the input fields.
            *   Provide user feedback (e.g., success message, loading indicator).
            *   Consider navigating back or showing a confirmation.
    4.  **Update Profile Layout:** In `app/(tabs)/(profile)/_layout.tsx`, add a `Stack.Screen` definition for `personal-info`, configuring the header title and back button.
    5.  **Update Profile Menu:** In `app/(tabs)/(profile)/index.tsx`, find the `personal` menu item and update its `onPress` handler to navigate to the new screen: `router.push('/(tabs)/(profile)/personal-info')`.

**Phase 3: Implement "Cambiar Contraseña" Screen**

*   **Objective:** Create a screen for users to change their password locally.
*   **Files to Create/Modify (via Code Mode):**
    *   `app/(tabs)/(profile)/change-password.tsx` (New File)
    *   `app/(tabs)/(profile)/_layout.tsx`
    *   `app/(tabs)/(profile)/index.tsx`
*   **Steps:**
    1.  **Create Screen File:** Create `app/(tabs)/(profile)/change-password.tsx`.
    2.  **Build UI:**
        *   Include a header ("Cambiar Contraseña") and back button.
        *   Add `TextInput` fields (secure entry) for:
            *   "Nueva Contraseña" (New Password).
            *   "Confirmar Nueva Contraseña" (Confirm New Password).
        *   Add a "Actualizar Contraseña" (Update Password) button.
    3.  **Implement Logic:**
        *   Import `useAuth` to get the `updatePassword` function.
        *   Use `useState` to manage the input field values.
        *   Implement the `onPress` handler for the update button:
            *   **Validation:** Check if the two password fields match. If not, show an error. (Optional: Add password complexity rules).
            *   If valid, call `auth.updatePassword` with the new password value.
            *   Provide user feedback (success/error).
            *   Navigate back or show confirmation upon success.
    4.  **Update Profile Layout:** In `app/(tabs)/(profile)/_layout.tsx`, add a `Stack.Screen` definition for `change-password`.
    5.  **Update Profile Menu:** In `app/(tabs)/(profile)/index.tsx`, find the `password` menu item and update its `onPress` handler: `router.push('/(tabs)/(profile)/change-password')`.

**Phase 4: Implement "Mis compras" Screen (with Mock Data)**

*   **Objective:** Create a screen displaying a list of past purchases using mock data.
*   **Files to Create/Modify (via Code Mode):**
    *   `data/mockPurchases.ts` (New File)
    *   `app/(tabs)/(profile)/purchases.tsx` (New File)
    *   `app/(tabs)/(profile)/_layout.tsx`
    *   `app/(tabs)/(profile)/index.tsx`
*   **Steps:**
    1.  **Create Mock Data File:** Create `data/mockPurchases.ts`.
        *   Define a `Purchase` type:
            ```typescript
            type PurchaseItem = {
              name: string; // e.g., "AI Box (4x5ml)"
              quantity: number;
              price: number; // Price for this item line
            };

            type Purchase = {
              id: string; // e.g., 'ORD-12345'
              date: string; // e.g., '2025-03-15'
              totalPrice: number;
              items: PurchaseItem[];
              status: 'Entregado' | 'En Camino' | 'Procesando'; // Example statuses
            };
            ```
        *   Export an array `MOCK_PURCHASES: Purchase[]` populated with 3-5 sample purchase objects.
    2.  **Create Screen File:** Create `app/(tabs)/(profile)/purchases.tsx`.
    3.  **Build UI:**
        *   Include a header ("Mis Compras") and back button.
        *   Use a `FlatList` to display the purchases.
        *   Create a component (`PurchaseListItem`) to render each purchase, showing:
            *   Order ID (`purchase.id`)
            *   Date (`purchase.date`)
            *   Total Price (`purchase.totalPrice`)
            *   Status (`purchase.status`)
            *   (Optional) A summary of items or a way to view details.
    4.  **Implement Logic:**
        *   Import `MOCK_PURCHASES` from `data/mockPurchases.ts`.
        *   Pass the mock data to the `FlatList`.
    5.  **Update Profile Layout:** In `app/(tabs)/(profile)/_layout.tsx`, add a `Stack.Screen` definition for `purchases`.
    6.  **Update Profile Menu:** In `app/(tabs)/(profile)/index.tsx`, find the `purchases` menu item and update its `onPress` handler: `router.push('/(tabs)/(profile)/purchases')`.

**Phase 5: Update Profile Screen Statistics**

*   **Objective:** Update the statistics displayed on the main profile screen to reflect actual data (or mock data).
*   **Files to Modify (via Code Mode):**
    *   `app/(tabs)/(profile)/index.tsx`
*   **Steps:**
    1.  **Import Hooks/Data:**
        *   Import `useRatings` from `context/RatingsContext`.
        *   Import `MOCK_PURCHASES` from `data/mockPurchases.ts`.
    2.  **Get Data:** Inside the `ProfileScreen` component:
        *   Get `ratings` and `favorites` from `useRatings()`.
        *   Get `MOCK_PURCHASES`.
    3.  **Update Stats Display:**
        *   **Calificaciones:** Find the `statItem` for "Calificaciones". Replace the hardcoded number (`32`) with `{ratings.length}`. Add a check for `isLoadingRatings` from `useRatings` if necessary.
        *   **Compras:** Find the `statItem` for "Compras". Replace the hardcoded number (`4`) with `{MOCK_PURCHASES.length}`.
        *   **Favoritos:**
            *   Add a new `statItem` view within `statsContainer`.
            *   Include a `statDivider` before it if desired.
            *   Display `{favorites.length}` as the `statNumber`.
            *   Set "Favoritos" as the `statLabel`.
            *   Add a check for `isLoadingFavorites` from `useRatings` if necessary.

**Phase 6: Memory Bank Update (Architect Mode)**

*   **Objective:** Document the plan and decisions.
*   **Files to Create/Modify (Architect Mode):**
    *   `memory-bank/profile-features-plan.md` (This File)
    *   `memory-bank/decisionLog.md`
    *   `memory-bank/progress.md`
    *   `memory-bank/activeContext.md`
*   **Steps:**
    1.  **Create Plan File:** Use `write_to_file` to save this plan to `memory-bank/profile-features-plan.md`.
    2.  **Update Decision Log:** Use `insert_content` to add entries to `decisionLog.md`:
        *   Decision to implement Personal Info, Change Password, Purchases screens.
        *   Decision to expand `AuthContext` user details (name, phone, address) post-signup.
        *   Decision for local password change (new/confirm fields only).
        *   Decision to use mock data for purchase history (`data/mockPurchases.ts`).
        *   Decision to update profile stats (ratings, purchases, favorites).
    3.  **Update Progress:** Use `insert_content` to add tasks to `progress.md` under "Upcoming Tasks":
        *   Implement Personal Info screen.
        *   Implement Change Password screen.
        *   Implement Purchases screen (mock data).
        *   Update AuthContext for profile details.
        *   Update Profile screen statistics.
    4.  **Update Active Context:** Use `insert_content` to update `activeContext.md`'s "Current Focus" section to "Implementing Profile Screen Features (Personal Info, Password, Purchases, Stats)".

**Mermaid Diagram (High-Level Flow):**

```mermaid
graph TD
    subgraph Profile Screen (index.tsx)
        A[User Views Profile] --> B(Stats Displayed);
        A --> C{Menu Items};
        C -- Clicks 'Info Personal' --> NAV1;
        C -- Clicks 'Cambiar Contraseña' --> NAV2;
        C -- Clicks 'Mis Compras' --> NAV3;
        B -- Reads --> RContext[RatingsContext];
        B -- Reads --> MPurchases[data/mockPurchases.ts];
    end

    subgraph Navigation & Screens
        NAV1 --> PIScreen[PersonalInfo Screen (personal-info.tsx)];
        NAV2 --> CPScreen[ChangePassword Screen (change-password.tsx)];
        NAV3 --> PurScreen[Purchases Screen (purchases.tsx)];
    end

    subgraph Data & Context
        PIScreen -- Reads/Writes --> AuthContext[AuthContext];
        CPScreen -- Writes --> AuthContext;
        PurScreen -- Reads --> MPurchases;
        AuthContext -- Reads/Writes --> Storage[(AsyncStorage: USER_email)];
        RContext -- Reads --> RStorage[(AsyncStorage: RATINGS, FAVORITES)];
    end

    style AuthContext fill:#ccf,stroke:#333,stroke-width:2px
    style RContext fill:#cfc,stroke:#333,stroke-width:2px
    style MPurchases fill:#ffc,stroke:#333,stroke-width:1px