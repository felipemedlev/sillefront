export const STORAGE_KEYS = {
  RATINGS: 'perfume_ratings',
  FAVORITES: 'perfume_favorites',
  MANUAL_BOX: 'manual_box_data',
} as const;

export const FONTS = {
  INSTRUMENT_SANS: 'InstrumentSans',
  INSTRUMENT_SERIF: 'InstrumentSerif',
  INSTRUMENT_SERIF_ITALIC: 'InstrumentSerifItalic',
} as const;

export const COLORS = {
  PRIMARY: '#000', // Main text, buttons, icons (Black)
  SECONDARY: '#22222', // Secondary elements (Dark Grey) - Added
  ACCENT: '#809CAC', // Accent color (Blue) - Added
  BACKGROUND: '#FFFFFF', // Main background (White)
  BACKGROUND_ALT: '#F5F5F7', // Alternative background (Light Grey) - Added
  TEXT_PRIMARY: '#1C1C1E', // Primary text (Near Black) - Added
  TEXT_SECONDARY: '#666', // Secondary text (Grey)
  BORDER: '#E0E0E0', // Border color (Light Grey) - Added
  ERROR: '#a31818', // Error messages (Red)
  SUCCESS: '#34C759', // Success indicators (Green) - Added
} as const;

export const FONT_SIZES = {
  XLARGE: 24, // Added
  LARGE: 18, // Added
  REGULAR: 16,
  SMALL: 14,
  XSMALL: 12, // Added
} as const;

export const SPACING = {
  XLARGE: 32, // Added
  LARGE: 20,
  MEDIUM: 12,
  SMALL: 8,
  XSMALL: 4, // Added
} as const;