import { SubscriptionTierDetails } from './subscription';

export const STORAGE_KEYS = {
  RATINGS: 'perfume_ratings',
  FAVORITES: 'perfume_favorites',
  MANUAL_BOX: 'manual_box_data',
  AUTH_USER_EMAIL: 'auth_user_email',
  USER_DATA_PREFIX: 'user_',
  CART: 'cart_data',
  SUBSCRIPTION_STATUS: 'subscription_status',
  ORDERED_PERFUMES_FOR_RATING: 'ordered_perfumes_for_rating',
} as const;

export const FONTS = {
  INSTRUMENT_SANS: 'InstrumentSans',
  INSTRUMENT_SERIF: 'InstrumentSerif',
  INSTRUMENT_SERIF_ITALIC: 'InstrumentSerifItalic',
} as const;

export const COLORS = {
  PRIMARY: '#000',
  SECONDARY: '#22222',
  ACCENT: '#809CAC',
  BACKGROUND: '#FFFFFF',
  BACKGROUND_ALT: '#F5F5F7',
  TEXT_PRIMARY: '#1C1C1E',
  TEXT_SECONDARY: '#666',
  BORDER: '#E0E0E0',
  ERROR: '#a31818',
  SUCCESS: '#34C759',

  GIFTBOX: {
    BACKGROUND: '#f8f9fa',
    BACKGROUND_ALT: '#ffffff',
    TEXT_PRIMARY: '#2d3436',
    TEXT_SECONDARY: '#636e72',
    ACCENT: '#6c5ce7',
    ACCENT_LIGHT: '#a29bfe',
    BORDER: '#dfe6e9',
    ERROR: '#d63031',
    CARD_SHADOW: 'rgba(0,0,0,0.08)',
    MALE: {
      PRIMARY: '#607D8B',
      LIGHT: '#90A4AE',
      BG: '#ECF0F1',
    },
    FEMALE: {
      PRIMARY: '#edafb8',
      LIGHT: '#edafb8',
      BG: '#f5f0f0',
    },
    SUCCESS: '#00b894',
  },
} as const;

export const FONT_SIZES = {
  XLARGE: 24,
  LARGE: 18,
  REGULAR: 16,
  SMALL: 14,
  XSMALL: 12,
} as const;

export const SPACING = {
  XLARGE: 32,
  LARGE: 20,
  MEDIUM: 12,
  SMALL: 8,
  XSMALL: 4,
} as const;

export const SUBSCRIPTION_TIERS: SubscriptionTierDetails[] = [
  {
    id: 'basic',
    name: 'Básico',
    priceCLP: 20000,
    decantSizeML: 3,
    decantCount: 4,
    maxprice_per_ml: 2000,
    description: '4 decants de 3mL de perfumes bajo $2.000/mL.',
  },
  {
    id: 'medium',
    name: 'Medio',
    priceCLP: 30000,
    decantSizeML: 5,
    decantCount: 4,
    maxprice_per_ml: 2000,
    description: '4 decants de 5mL de perfumes bajo $2.000/mL.',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceCLP: 50000,
    decantSizeML: 5,
    decantCount: 4,
    minprice_per_ml: 2000,
    description: '4 decants de 5mL de perfumes sobre $2.000/mL.',
  },
];

// Translations for perfume time of day
export const BEST_FOR_TRANSLATIONS = {
  'day': 'Día',
  'night': 'Noche',
  'both': 'Día y Noche',
} as const;

// Translations for seasons
export const SEASON_TRANSLATIONS = {
  'winter': 'Invierno',
  'spring': 'Primavera',
  'summer': 'Verano',
  'fall': 'Otoño',
  'autumn': 'Otoño',
} as const;

// Translations for gender
export const GENDER_TRANSLATIONS = {
  'male': 'Hombre',
  'female': 'Mujer',
  'unisex': 'Unisex',
} as const;

// Common perfume notes translations
export const PERFUME_NOTE_TRANSLATIONS = {
  // Top notes
  'grapefruit': 'Pomelo',
  'lemon': 'Limón',
  'lime': 'Lima',
  'orange': 'Naranja',
  'bergamot': 'Bergamota',
  'mandarin': 'Mandarina',
  'mint': 'Menta',
  'pink pepper': 'Pimienta Rosa',
  'pepper': 'Pimienta',
  'apple': 'Manzana',
  'pear': 'Pera',
  'melon': 'Melón',
  'peach': 'Durazno',
  'black currant': 'Grosella Negra',
  'almond': 'Almendra',
  'coffee': 'Café',

  // Middle notes
  'ginger': 'Jengibre',
  'nutmeg': 'Nuez Moscada',
  'jasmine': 'Jazmín',
  'sea notes': 'Notas Marinas',
  'calone': 'Calona',
  'freesia': 'Fresia',
  'bamboo': 'Bambú',
  'white rose': 'Rosa Blanca',
  'iris': 'Iris',
  'orange blossom': 'Azahar',
  'lily-of-the-valley': 'Lirio del Valle',
  'tuberose': 'Tuberosa',
  'lavender': 'Lavanda',
  'vetiver': 'Vetiver',
  'sichuan pepper': 'Pimienta de Sichuán',

  // Base notes
  'incense': 'Incienso',
  'cedar': 'Cedro',
  'sandalwood': 'Sándalo',
  'patchouli': 'Pachulí',
  'labdanum': 'Ládano',
  'white musk': 'Almizcle Blanco',
  'oakmoss': 'Musgo de Roble',
  'amber': 'Ámbar',
  'vanilla': 'Vainilla',
  'blackberry': 'Mora',
  'praline': 'Praliné',
  'tonka bean': 'Haba Tonka',
  'cacao': 'Cacao',
  'cashmere wood': 'Madera de Cachemira',

  // Accords
  'citrus': 'Cítrico',
  'woody': 'Amaderado',
  'aromatic': 'Aromático',
  'fresh spicy': 'Especiado Fresco',
  'aquatic': 'Acuático',
  'marine': 'Marino',
  'fresh': 'Fresco',
  'fruity': 'Frutal',
  'sweet': 'Dulce',
  'warm spicy': 'Especiado Cálido',
  'white floral': 'Floral Blanco',
  'floral': 'Floral',
  'powdery': 'Polvoso',
  'gourmand': 'Gourmand',
  'musky': 'Musk',
  'leather': 'Cuero',
  'smoke': 'Humo',
  'tobacco': 'Tabaco',
} as const;