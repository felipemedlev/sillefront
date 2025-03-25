# SilleFront Project

This is the frontend for the Sille application. It's built using Expo and React Native, with Expo Router for navigation.

## File Structure

The project is organized as follows:

```
/
├── app/              # Main application code
│   ├── (tabs)/       # Tab navigation structure
│   ├── auth/         # Authentication related screens (login, signup)
│   ├── components/   # Reusable UI components specific to the app
│   ├── landing/      # Landing page
│   ├── survey/       # Survey related screens
│   ├── _layout.tsx   # Root layout component
│   ├── aibox-selection.tsx # AI Box selection screen
│   ├── home.tsx      # Home screen (redirects to tabs)
│   └── index.tsx     # Initial splash screen
├── assets/           # Static assets (images, fonts)
├── components/       # Reusable UI components (shared across the app)
├── context/          # React context providers
├── types/            # TypeScript type definitions
├── app.json          # Expo application configuration
├── package.json      # Project dependencies and scripts
└── README.md         # This file
```

-   `app/`: Contains the main application logic, including screens, navigation, and app-specific components.
-   `assets/`: Stores static assets like images and fonts.
-   `components/`: Houses reusable UI components used throughout the application.
-   `context/`: Manages global application state using React Context.
-   `types/`: Defines TypeScript types for better code maintainability.

## Getting Started

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Run the Development Server:**

    ```bash
    npx expo start
    ```
    This will start the Expo development server. You can then run the app on an emulator/simulator or a physical device using the Expo Go app. For web, you can use:
    ```bash
    npm run web
    ```

## Known Issues/TODOs

-   **Resolved Hook Error:** There was a previous issue in `app/auth/index.tsx` where the `usePathname` hook was called conditionally, violating the rules of hooks. This has been resolved by removing the conditional and always redirecting to `/auth/login`.
- Add more detailed documentation for each component.
- Implement proper error handling and loading states.
