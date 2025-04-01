# Implementation Plan: Local Authentication

**Overall Goal:** Implement a local authentication system using `AsyncStorage` to manage user signup and login, protecting specific routes (Checkout, Profile) and prompting users to authenticate when necessary. All user-facing text will be in Spanish.

**Key Decisions:**

*   **Password Storage:** Plain text in `AsyncStorage` (temporary solution).
*   **Auth State:** Store user's email in context (`user: { email: string } | null`).
*   **Profile Auth Prompt:** Dedicated screen (`app/(tabs)/(profile)/auth-prompt.tsx`).
*   **Error Handling:** Inline text messages within UI components.
*   **Session:** Persistent until explicit logout.
*   **Language:** Spanish.

---

## Phase 1: Auth Context Setup

1.  **Create Auth Context File:**
    *   Create `context/AuthContext.tsx`.
2.  **Define Types:**
    *   `User`: `{ email: string }`
    *   `AuthContextType`: `{ user: User | null; isLoading: boolean; signUp: (email: string, pass: string) => Promise<void>; login: (email: string, pass: string) => Promise<void>; logout: () => Promise<void>; }`
3.  **Implement `AuthProvider` Component:**
    *   **State:**
        *   `user: User | null` (initially null)
        *   `isLoading: boolean` (initially true)
    *   **`useEffect` for Initial Load:**
        *   On mount, attempt to load user email from `AsyncStorage` (e.g., key `AUTH_USER_EMAIL`).
        *   If email found, set `user` state.
        *   Set `isLoading` to `false` after loading attempt.
    *   **`signUp` Function:**
        *   Check if email already exists in `AsyncStorage` (e.g., key pattern `USER_${email}`).
        *   If exists, throw an error ("Email ya registrado").
        *   If not, store user data: `AsyncStorage.setItem(USER_${email}, JSON.stringify({ password: plainTextPassword }))`.
        *   Store current user email: `AsyncStorage.setItem(AUTH_USER_EMAIL, email)`.
        *   Update `user` state.
    *   **`login` Function:**
        *   Retrieve user data from `AsyncStorage` using `USER_${email}` key.
        *   If not found or password doesn't match, throw an error ("Email o contraseña incorrectos").
        *   If valid, store current user email: `AsyncStorage.setItem(AUTH_USER_EMAIL, email)`.
        *   Update `user` state.
    *   **`logout` Function:**
        *   Remove `AUTH_USER_EMAIL` from `AsyncStorage`.
        *   Set `user` state to `null`.
    *   **Provide Context Value:** Pass `user`, `isLoading`, `signUp`, `login`, `logout` through the context provider.
4.  **Export `useAuth` Hook:**
    *   Create and export `useAuth` hook for easy context consumption.
5.  **Define Storage Keys:**
    *   Add `AUTH_USER_EMAIL` and a pattern/prefix like `USER_` to `types/constants.ts` -> `STORAGE_KEYS`.

## Phase 2: Integration and Core UI

1.  **Integrate `AuthProvider`:**
    *   In `app/_layout.tsx`, import `AuthProvider`.
    *   Wrap the existing `Stack` or root component with `<AuthProvider>`.
2.  **Implement Signup Screen (`app/auth/signup.tsx`):**
    *   Import `useAuth`.
    *   Add state for inline error messages (`error: string | null`).
    *   Modify `handleSignUp`:
        *   Call `auth.signUp(email, password)`.
        *   Use `try/catch` to handle errors, setting the `error` state.
        *   Clear error on input change.
        *   On success, navigation will be handled by the root layout's protection logic.
    *   Display the `error` message conditionally within the UI (e.g., below the button or relevant input).
    *   Update text to Spanish.
3.  **Implement Login Screen (`app/auth/login.tsx`):**
    *   Import `useAuth`.
    *   Add state for inline error messages (`error: string | null`).
    *   Modify `handleLogin`:
        *   Call `auth.login(email, password)`.
        *   Use `try/catch` to handle errors, setting the `error` state.
        *   Clear error on input change.
        *   On success, navigation will be handled by the root layout's protection logic.
    *   Display the `error` message conditionally.
    *   Update text to Spanish.
    *   Consider removing the "Continuar como invitado" button or ensuring it aligns with the auth flow.
4.  **Create Profile Auth Prompt Screen (`app/(tabs)/(profile)/auth-prompt.tsx`):**
    *   Create the new file.
    *   Design a simple UI:
        *   Icon (e.g., `person-circle-outline`).
        *   Title: "Accede a tu Perfil"
        *   Subtitle: "Inicia sesión o regístrate para ver tus compras, favoritos y más."
        *   Button: "Iniciar Sesión" (navigates to `/auth/login`).
        *   Button: "Registrarse" (navigates to `/auth/signup`).
    *   Use constants for styling.

## Phase 3: Protected Routing

1.  **Root Layout Protection (`app/_layout.tsx`):**
    *   Create a new component (e.g., `RootLayoutNav`) that contains the current `Stack` and is wrapped by `AuthProvider`.
    *   Inside `RootLayoutNav`:
        *   Import `useAuth`, `useRouter`, `useSegments`, `SplashScreen`.
        *   Use `useEffect` hook dependent on `auth.user` and `auth.isLoading`.
        *   **Inside `useEffect`:**
            *   If `auth.isLoading` is true, do nothing (or potentially `SplashScreen.preventAutoHideAsync()` if using splash screen).
            *   Get current route segments using `useSegments()`. Check if the user is currently *in* the auth group (`segments[0] === '(auth)'`).
            *   If `!auth.isLoading` and `!auth.user` and not already in auth group:
                *   Redirect to `/landing` using `router.replace('/landing')`.
            *   If `!auth.isLoading` and `auth.user` and currently in auth group:
                *   Redirect to the main app (`/(tabs)`) using `router.replace('/(tabs)')`.
            *   (Optional: `SplashScreen.hideAsync()` when loading is done).
        *   Render the main `Stack` navigator.
2.  **Cart Screen Protection (`app/(tabs)/(cart)/index.tsx`):**
    *   Import `useAuth`.
    *   Get `auth.user` from the hook.
    *   Modify the `onPress` handler for the "Continuar al pago" button:
        *   If `auth.user`, `router.push('/checkout')`.
        *   If `!auth.user`, `router.push('/auth/signup')`. (Or `/auth/login`? Signup seems more appropriate as per the request).
3.  **Profile Tab Protection (`app/(tabs)/(profile)/_layout.tsx`):**
    *   Import `useAuth`, `useRouter`, `useSegments`.
    *   Inside the `ProfileLayout` component:
        *   Get `auth.user`, `auth.isLoading`.
        *   Get `segments = useSegments()`. Determine the current screen within the profile tab (e.g., `segments[segments.length - 1]`).
        *   Use `useEffect` dependent on `auth.user`, `auth.isLoading`, `segments`.
        *   **Inside `useEffect`:**
            *   If `auth.isLoading`, return.
            *   `const inProfileTab = segments[1] === '(profile)';`
            *   `const currentScreen = segments[segments.length - 1];`
            *   If `inProfileTab` and `!auth.user` and `currentScreen !== 'auth-prompt'`:
                *   `router.replace('/(tabs)/(profile)/auth-prompt')`.
            *   If `inProfileTab` and `auth.user` and `currentScreen === 'auth-prompt'`:
                *   `router.replace('/(tabs)/(profile)/')`. // Navigate to the main profile index
        *   Render the `Stack` navigator as before.

## Phase 4: Logout and Final Touches

1.  **Implement Logout Button (`app/(tabs)/(profile)/index.tsx`):**
    *   Import `useAuth`.
    *   Add a new `MenuItem` to the `menuItems` array:
        ```javascript
        {
          id: 'logout',
          title: 'Cerrar Sesión',
          icon: 'log-out-outline',
          onPress: async () => {
            await auth.logout();
            // Navigation handled by layout protection
          },
        },
        ```
    *   Ensure styling is consistent.
2.  **Review Landing Screen (`app/landing/index.tsx`):**
    *   The "Saltar intro" button (`handleSkipPress`) currently goes to `/auth/signup`. This might be okay, as the root layout protection will redirect logged-in users away from the auth screens anyway. Confirm this flow is acceptable. Alternatively, change the last page's primary button (`Realizar test inicial`) to first check auth status or always go to signup/login if not authenticated. For simplicity, let's keep the current "Saltar intro" target as `/auth/signup`.
3.  **Styling and Text Review:**
    *   Double-check all new components (`AuthContext`, `auth-prompt.tsx`) and modified screens (`login.tsx`, `signup.tsx`, `index.tsx` in profile) for adherence to Airbnb style and use of `constants.ts`.
    *   Verify all user-facing text is in Spanish.

## Phase 5: Memory Bank Update

1.  **Create Plan File:**
    *   Use `write_to_file` to create `memory-bank/local-auth-plan.md` with the content of this plan.
2.  **Update Logs:**
    *   Use `insert_content` to append entries to:
        *   `decisionLog.md`: Decision to implement local auth, plain text passwords (temp), email as user state, dedicated profile prompt, inline errors.
        *   `progress.md`: Add "Implement Local Authentication" to Upcoming Tasks.
        *   `activeContext.md`: Update Current Focus to "Implementing Local Authentication".

---

## Mermaid Diagram: Authentication Flow

```mermaid
graph TD
    subgraph User Interaction
        U[User Opens App] --> A{App Loads};
        L[User Clicks Login/Signup Link] --> AS[Auth Screens];
        CP[User Clicks Profile Tab] --> PT{Profile Tab Loads};
        CC[User Clicks 'Continuar al pago'] --> CT{Cart Tries Checkout};
        LO[User Clicks Logout] --> LG[Logout Action];
    end

    subgraph App Logic
        A --> RLP{Root Layout Protection};
        RLP -- Loading --> LS(Show Loading/Splash);
        RLP -- Not Logged In --> LAND[Redirect to /landing];
        RLP -- Logged In --> TABS[Render /(tabs)];

        LAND --> AS;

        AS -- Login/Signup Attempt --> AC[AuthContext];
        AC -- Success --> RLP;
        AC -- Failure --> AS(Show Inline Error);

        PT --> PTL{Profile Tab Layout Protection};
        PTL -- Loading --> LS;
        PTL -- Logged In & On Auth Prompt --> PI[Redirect to Profile Index];
        PTL -- Not Logged In & Not on Auth Prompt --> PAP[Redirect to Auth Prompt Screen];
        PTL -- Logged In & Not on Auth Prompt --> PIX[Render Profile Index];
        PTL -- Not Logged In & On Auth Prompt --> PAPX[Render Auth Prompt Screen];

        CT -- Checks Auth --> AC;
        AC -- User Exists --> CO[Navigate to /checkout];
        AC -- No User --> AS;

        LG --> AC;
        AC -- Logout --> RLP;

    end

    subgraph State & Storage
        AC -- Reads/Writes --> ASYNC[(AsyncStorage: AUTH_USER_EMAIL, USER_email)];
        AC -- Updates --> AppState[Global State (User Email)];
    end

    style RLP fill:#f9f,stroke:#333,stroke-width:2px
    style PTL fill:#f9f,stroke:#333,stroke-width:2px
    style AC fill:#ccf,stroke:#333,stroke-width:2px
    style ASYNC fill:#ffc,stroke:#333,stroke-width:1px