# Plan: Add Box Configuration Visualizer

**Goal:** Add an image component to the AI Box and Manual Box selection screens that dynamically displays a visual representation of the selected decant count and size combination.

**1. Create `BoxVisualizer` Component (`components/product/BoxVisualizer.tsx`):**

*   **Purpose:** A reusable component to display the correct box image based on configuration.
*   **Props:**
    *   `decantCount: 4 | 8`
    *   `decantSize: 3 | 5 | 10`
*   **Logic:**
    *   Import the necessary `Image` component from `react-native`.
    *   Define a mapping or use conditional logic (e.g., switch/if statements) to determine the image source based on `decantCount` and `decantSize`.
        *   Example mapping:
            ```javascript
            const imageMap = {
              '4-3': require('../../assets/images/3mlx4.png'),
              '8-3': require('../../assets/images/3mlx8.png'),
              '4-5': require('../../assets/images/5mlx4.png'),
              '8-5': require('../../assets/images/5mlx8.png'),
              '4-10': require('../../assets/images/10mlx4.png'),
              '8-10': require('../../assets/images/10mlx8.png'),
            };
            const imageSource = imageMap[`${decantCount}-${decantSize}`];
            ```
    *   Render the `<Image>` component with the selected `imageSource`.
*   **Styling:**
    *   Apply styles to control the image size (e.g., `width: 150`, `height: 100`, `resizeMode: 'contain'`).
    *   Center the image within its container (e.g., `alignSelf: 'center'`).
    *   Add vertical margin (e.g., `marginVertical: SPACING.MEDIUM`).
*   **Optimization:** Wrap the component export with `React.memo`.

**2. Integrate into `app/aibox-selection.tsx`:**

*   **Import:** `import BoxVisualizer from '../components/product/BoxVisualizer';`
*   **Placement:** Inside the `ScrollView` component, render `<BoxVisualizer />` *before* the `<DecantSelector />` component.
*   **Props:** Pass the existing `decantCount` and `decantSize` state variables to the component:
    ```jsx
    <ScrollView ...>
      <BoxVisualizer decantCount={decantCount} decantSize={decantSize} />
      <DecantSelector ... />
      {/* ... rest of the screen */}
    </ScrollView>
    ```
*   **Styling:** Adjust surrounding component styles if needed to accommodate the new image.

**3. Integrate into `app/manual-box.tsx`:**

*   **Import:** `import BoxVisualizer from '../components/product/BoxVisualizer';`
*   **Placement:** Inside the `ScrollView` component, render `<BoxVisualizer />` *before* the `<DecantSelector />` component.
*   **Props:** Pass the `decantCount` and `decantSize` state variables from the `useManualBox` context:
    ```jsx
    <ScrollView ...>
      <BoxVisualizer decantCount={decantCount} decantSize={decantSize} />
      <DecantSelector ... />
      {/* ... rest of the screen */}
    </ScrollView>
    ```
*   **Styling:** Ensure consistent styling with the AI Box screen.

**Mermaid Diagram:**

```mermaid
graph TD
    subgraph Screens
        A[aibox-selection.tsx] --> C{BoxVisualizer};
        B[manual-box.tsx] --> C;
    end

    subgraph Components
        C -- Props --> D[decantCount, decantSize];
        C -- Renders --> E[Image];
        F[DecantSelector] -- Sets State --> A;
        F -- Sets State --> B;
    end

    subgraph Assets
        G[assets/images/] --> E;
    end

    A -- Uses --> F;
    B -- Uses --> F;

    style C fill:#ccf,stroke:#333,stroke-width:2px
    style F fill:#ccf,stroke:#333,stroke-width:2px
    style E fill:#cfc,stroke:#333,stroke-width:1px