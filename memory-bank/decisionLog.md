# Decision Log

## Significant Decisions
- [YYYY-MM-DD HH:MM:SS] - [Decision summary]
  - Rationale: [Explanation]
  - Implications: [Impact analysis]

[2025-03-31 19:06:30] - Fixed TypeScript import in manual-box.tsx
- Changed React import from `import React, { useCallback }` to separate imports
- Reason: TS1259 error due to esModuleInterop compatibility
- Impact: Ensures consistent React imports across the project
[2025-03-31 19:08:45] - Resolved tsconfig.json configuration: Confirmed correct path for Expo base config is 'expo/tsconfig.base' (resolves to node_modules/expo/tsconfig.base.json). Observed transient TypeScript server caching issues during resolution process.

[2025-03-31 19:53:05] - Decided to implement 'Filter by Occasion' feature.
  - Rationale: Enhance user experience by allowing browsing perfumes based on specific use cases.
  - Implications: Requires data model changes (Perfume type, mock data), a new screen (`app/occasion-selection.tsx`), and navigation updates (`app/(tabs)/aibox.tsx`). New route: `/occasion-selection`.

[2025-03-29 12:10:12] - Initialized decision log file