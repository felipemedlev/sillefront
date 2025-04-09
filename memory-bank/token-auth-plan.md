# Token-Centric AuthContext Architecture Plan

**Date:** 2025-04-08

**Goal:** Create a robust, token-centric `AuthContext` for a web application interacting with a backend API.

**Target File:** `src/context/AuthContext.tsx`

## Proposed Architecture & Enhancements:

1.  **Refine State and Types:**
    *   Define a specific `User` TypeScript interface matching the backend's user profile endpoint response (e.g., `/api/auth/users/me/`). Replace `any` type for the `user` state.
    *   Introduce an `error` state (`string | null`) to the context for storing API errors.
    *   Update the `AuthContextType` interface accordingly.

2.  **Token Management Strategy:**
    *   **Storage:** Standardize token storage (e.g., `localStorage` for persistence). Ensure `authUtils` (within `src/services/api.ts`) uses this method consistently.
    *   **Security Note:** Consider HttpOnly cookies managed by the backend for enhanced security if feasible.
    *   **Token Handling:** Since the backend uses Django's standard TokenAuthentication (no refresh tokens), the frontend should handle 401 Unauthorized errors by clearing the token and prompting for re-login.

3.  **User Profile Management:**
    *   Implement `fetchUserProfile` function to get user details using the stored token.
    *   Call `fetchUserProfile` on initial app load (if token exists) and after successful login.
    *   Handle profile fetch errors by logging the user out (`handleLogout`).

4.  **API Service Integration (`src/services/api.ts`):**
    *   Ensure the API service automatically includes the `Authorization: Token <token>` header.
    *   Improve error handling in the API service for clearer messages.
    *   Consider using request/response interceptors (e.g., with `axios`) for centralized token/refresh logic.

5.  **Error Propagation:**
    *   Modify context functions (`handleLogin`, `handleRegister`, `handleLogout`, `fetchUserProfile`) to catch API errors and update the context's `error` state. Clear the error on subsequent successes.

6.  **Provider Setup:**
    *   Wrap the root of the web application (e.g., `_app.tsx` or `App.tsx`) with the `AuthProvider`.

7.  **Cleanup:**
    *   Delete the unused AsyncStorage-based `context/AuthContext.tsx` file.

## Visual Flow (Simplified):

```mermaid
graph TD
    A[App Load] --> B{Token in Storage?};
    B -- Yes --> C[Load Token];
    B -- No --> D[Show Login/Public View];
    C --> E{Fetch User Profile};
    E -- Success --> F[Set User State, isAuthenticated=true];
    E -- Failure/Invalid Token --> G[Clear Token, Logout, Show Login/Public View];
    F --> H[Show Authenticated App View];
    G --> D;

    I[User Action: Login] --> J[Call /api/auth/token/login/];
    J -- Success --> K[Store Token];
    K --> E;
    J -- Failure --> L[Set Error State];
    L --> D;

    M[User Action: Logout] --> N[Call /api/auth/token/logout/];
    N --> G;

    O[Authenticated Request] --> P{Attach Token Header};
    P --> Q[Call API Endpoint];
    Q -- Success --> R[Return Data];
    Q -- 401 Unauthorized --> G; # Logout on auth error
```

## Next Steps:

*   Implement these changes in `src/context/AuthContext.tsx` and `src/services/api.ts`.
*   Delete `context/AuthContext.tsx`.
*   Integrate `AuthProvider` at the application root.
*   Test the complete authentication flow.