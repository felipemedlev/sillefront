// data/mockPerfumes.ts
import { Perfume } from '../types/perfume'; // Import the necessary type

// Definition of MOCK_PERFUMES extracted from app/aibox-selection.tsx
export const MOCK_PERFUMES: Perfume[] = [
  {
    id: '9099',
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    matchPercentage: 95,
    pricePerML: 1000,
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.9099.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.9099.jpg',
    description: 'An aromatic-woody fragrance with a captivating trail. A meeting of strength and elegance.',
    accords: ['Citrus', 'Woody', 'Aromatic', 'Amber', 'Fresh Spicy'],
    topNotes: ['Grapefruit', 'Lemon', 'Mint', 'Pink Pepper'],
    middleNotes: ['Ginger', 'Nutmeg', 'Jasmine'],
    baseNotes: ['Incense', 'Vetiver', 'Cedar', 'Sandalwood', 'Patchouli', 'Labdanum', 'White Musk'],
    overallRating: 4.5,
    dayNightRating: 0.5,
    seasonRating: 0.6,
    priceValueRating: 3.5,
    sillageRating: 1,
    longevityRating: 2,
    similarPerfumes: ['31861', '410'],
    occasions: ['Formal', 'Oficina', 'Casual', 'Noche'], // Added
  },
  {
    id: '410',
    name: 'Acqua di Gio',
    brand: 'Giorgio Armani',
    matchPercentage: 92,
    pricePerML: 1200,
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.410.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.410.jpg',
    description: 'A fresh aquatic fragrance inspired by the Mediterranean sea.',
    accords: ['Aquatic', 'Citrus', 'Aromatic', 'Marine', 'Woody'],
    topNotes: ['Lime', 'Lemon', 'Bergamot', 'Jasmine', 'Orange'],
    middleNotes: ['Sea Notes', 'Jasmine', 'Calone', 'Peach', 'Freesia'],
    baseNotes: ['White Musk', 'Cedar', 'Oakmoss', 'Patchouli', 'Amber'],
    overallRating: 4.2,
    dayNightRating: 1,
    seasonRating: 0.8,
    priceValueRating: 4.0,
    sillageRating: 1,
    longevityRating: 1,
    similarPerfumes: ['485', '9099'],
    occasions: ['Casual', 'Deportiva', 'Viaje', 'Relax'], // Added
  },
  {
    id: '31861',
    name: 'Sauvage',
    brand: 'Dior',
    matchPercentage: 88,
    pricePerML: 2000,
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.31861.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.31861.jpg',
    description: 'A radically fresh composition with powerful woody notes.',
    accords: ['Fresh Spicy', 'Amber', 'Citrus', 'Aromatic', 'Musky'],
    topNotes: ['Calabrian bergamot', 'Pepper'],
    middleNotes: ['Sichuan Pepper', 'Lavender', 'Pink Pepper', 'Vetiver'],
    baseNotes: ['Ambroxan', 'Cedar', 'Labdanum'],
    overallRating: 4.0,
    dayNightRating: 0.5,
    seasonRating: 0.5,
    priceValueRating: 3.0,
    sillageRating: 2,
    longevityRating: 2,
    similarPerfumes: ['9099'],
    occasions: ['Casual', 'Noche', 'Fiesta'], // Added
  },
  {
    id: '485',
    name: 'Light Blue',
    brand: 'Dolce & Gabbana',
    matchPercentage: 85,
    pricePerML: 980,
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.485.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.485.jpg',
    description: 'A refreshing summer fragrance that evokes the spirit of Sicily.',
    accords: ['Citrus', 'Woody', 'Fresh', 'Fruity', 'Aromatic'],
    topNotes: ['Sicilian Lemon', 'Apple', 'Cedar', 'Bellflower'],
    middleNotes: ['Bamboo', 'Jasmine', 'White Rose'],
    baseNotes: ['Cedar', 'Musk', 'Amber'],
    overallRating: 4.1,
    dayNightRating: 1,
    seasonRating: 0.9,
    priceValueRating: 4.5,
    sillageRating: 1,
    longevityRating: 1,
    similarPerfumes: ['410'],
    occasions: ['Casual', 'Deportiva', 'Viaje', 'Relax'], // Added
  },
  {
    id: '14982',
    name: 'La Vie Est Belle',
    brand: 'Lancôme',
    matchPercentage: 82,
    pricePerML: 876,
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.14982.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.14982.jpg',
    description: 'A feminine fragrance with an iris gourmand accord.',
    accords: ['Sweet', 'Vanilla', 'Fruity', 'Powdery', 'Patchouli'],
    topNotes: ['Black Currant', 'Pear'],
    middleNotes: ['Iris', 'Jasmine', 'Orange Blossom'],
    baseNotes: ['Praline', 'Vanilla', 'Patchouli', 'Tonka Bean'],
    overallRating: 4.6,
    dayNightRating: 0.5,
    seasonRating: 0.2,
    priceValueRating: 4.0,
    sillageRating: 2,
    longevityRating: 2,
    similarPerfumes: ['25324', '39681'],
    occasions: ['Romántica', 'Especial', 'Noche', 'Formal'], // Added
  },
  {
    id: '25324',
    name: 'Black Opium',
    brand: 'Yves Saint Laurent',
    matchPercentage: 80,
    pricePerML: 930,
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.25324.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.25324.jpg',
    description: 'An addictive gourmand fragrance with notes of black coffee and vanilla.',
    accords: ['Vanilla', 'Coffee', 'Sweet', 'Warm Spicy', 'White Floral'],
    topNotes: ['Pear', 'Pink Pepper', 'Orange Blossom'],
    middleNotes: ['Coffee', 'Jasmine', 'Bitter Almond', 'Licorice'],
    baseNotes: ['Vanilla', 'Patchouli', 'Cedar', 'Cashmere Wood'],
    overallRating: 4.3,
    dayNightRating: 0,
    seasonRating: 0.1,
    priceValueRating: 3.8,
    sillageRating: 2,
    longevityRating: 2,
    similarPerfumes: ['14982', '39681'],
    occasions: ['Noche', 'Fiesta', 'Especial'], // Added
  },
  {
    id: '210',
    name: 'J\'adore',
    brand: 'Dior',
    matchPercentage: 78,
    pricePerML: 1700,
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.210.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.210.jpg',
    description: 'A floral bouquet that celebrates femininity.',
    accords: ['White Floral', 'Floral', 'Fruity', 'Sweet', 'Aquatic'],
    topNotes: ['Pear', 'Melon', 'Magnolia', 'Peach', 'Mandarin Orange'],
    middleNotes: ['Jasmine', 'Lily-of-the-Valley', 'Tuberose', 'Freesia'],
    baseNotes: ['Musk', 'Vanilla', 'Blackberry', 'Cedar'],
    overallRating: 4.4,
    dayNightRating: 1,
    seasonRating: 0.7,
    priceValueRating: 3.2,
    sillageRating: 1,
    longevityRating: 2,
    similarPerfumes: [],
    occasions: ['Romántica', 'Formal', 'Especial', 'Casual'], // Added
  },
  {
    id: '39681',
    name: 'Good Girl',
    brand: 'Carolina Herrera',
    matchPercentage: 75,
    pricePerML: 1300,
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.39681.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.39681.jpg',
    description: 'A sensual fragrance with a duality of good girl and bad girl notes.',
    accords: ['White Floral', 'Sweet', 'Warm Spicy', 'Vanilla', 'Cacao'],
    topNotes: ['Almond', 'Coffee', 'Bergamot', 'Lemon'],
    middleNotes: ['Tuberose', 'Jasmine Sambac', 'Orange Blossom', 'Orris'],
    baseNotes: ['Tonka Bean', 'Cacao', 'Vanilla', 'Praline', 'Sandalwood'],
    overallRating: 4.2,
    dayNightRating: 0,
    seasonRating: 0.2,
    priceValueRating: 3.9,
    sillageRating: 2,
    longevityRating: 2,
    similarPerfumes: ['14982', '25324'],
    occasions: ['Noche', 'Fiesta', 'Romántica', 'Especial'], // Added
  },
  {
    id: '75805',
    name: 'Khamrah',
    brand: 'Lattafa Perfumes',
    matchPercentage: 80, // Placeholder
    pricePerML: 500, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.75805.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.75805.jpg',
    description: 'A warm spicy and sweet fragrance.',
    accords: ['Warm Spicy', 'Sweet', 'Vanilla', 'Woody', 'Cinnamon', 'Amber'],
    topNotes: ['Cinnamon', 'Nutmeg', 'Bergamot'],
    middleNotes: ['Dates', 'Praline', 'Tuberose', 'Mahonial'],
    baseNotes: ['Vanilla', 'Tonka Bean', 'Amberwood', 'Myrrh', 'Benzoin', 'Akigalawood'],
    overallRating: 4.4, // Placeholder
    dayNightRating: 0.1, // Night leaning
    seasonRating: 0.1, // Winter/Fall
    priceValueRating: 4.8, // Placeholder
    sillageRating: 2, // Strong
    longevityRating: 2, // Long lasting
    similarPerfumes: ['62615'], // Placeholder
    occasions: ['Noche', 'Especial', 'Fiesta', 'Romántica'], // Added
  },
  {
    id: '81642',
    name: 'Le Male Elixir',
    brand: 'Jean Paul Gaultier',
    matchPercentage: 85, // Placeholder
    pricePerML: 1500, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.81642.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.81642.jpg',
    description: 'An intense amber fougere fragrance.',
    accords: ['Amber', 'Vanilla', 'Honey', 'Tobacco', 'Sweet', 'Aromatic'],
    topNotes: ['Lavender', 'Mint'],
    middleNotes: ['Vanilla', 'Benzoin'],
    baseNotes: ['Honey', 'Tonka Bean', 'Tobacco'],
    overallRating: 4.5, // Placeholder
    dayNightRating: 0, // Night
    seasonRating: 0.1, // Winter/Fall
    priceValueRating: 4.0, // Placeholder
    sillageRating: 2, // Strong
    longevityRating: 2, // Very long lasting
    similarPerfumes: ['61856', '52802'], // Placeholder
    occasions: ['Noche', 'Fiesta', 'Especial'], // Added
  },
  {
    id: '62615',
    name: 'Angels\' Share',
    brand: 'Kilian',
    matchPercentage: 88, // Placeholder
    pricePerML: 3500, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.62615.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.62615.jpg',
    description: 'A gourmand fragrance inspired by cognac.',
    accords: ['Woody', 'Warm Spicy', 'Sweet', 'Vanilla', 'Cinnamon', 'Amber'],
    topNotes: ['Cognac'],
    middleNotes: ['Cinnamon', 'Tonka Bean', 'Oak'],
    baseNotes: ['Praline', 'Vanilla', 'Sandalwood'],
    overallRating: 4.6, // Placeholder
    dayNightRating: 0, // Night
    seasonRating: 0.1, // Winter/Fall
    priceValueRating: 3.0, // Placeholder
    sillageRating: 2, // Strong
    longevityRating: 2, // Very long lasting
    similarPerfumes: ['75805', '31623'], // Placeholder
    occasions: ['Noche', 'Especial', 'Formal', 'Romántica'], // Added
  },
  {
    id: '61856',
    name: 'Le Male Le Parfum',
    brand: 'Jean Paul Gaultier',
    matchPercentage: 90, // Placeholder
    pricePerML: 1400, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.61856.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.61856.jpg',
    description: 'An intense and elegant amber fragrance.',
    accords: ['Vanilla', 'Aromatic', 'Warm Spicy', 'Lavender', 'Powdery', 'Iris'],
    topNotes: ['Cardamom'],
    middleNotes: ['Lavender', 'Iris'],
    baseNotes: ['Vanilla', 'Oriental notes', 'Woodsy Notes'],
    overallRating: 4.5, // Placeholder
    dayNightRating: 0.3, // Night/Day
    seasonRating: 0.1, // Winter/Fall
    priceValueRating: 4.2, // Placeholder
    sillageRating: 2, // Strong
    longevityRating: 2, // Long lasting
    similarPerfumes: ['81642', '13016'], // Placeholder
    occasions: ['Noche', 'Formal', 'Especial', 'Romántica'], // Added
  },
  {
    id: '52802',
    name: 'Emporio Armani Stronger With You Intensely',
    brand: 'Giorgio Armani',
    matchPercentage: 87, // Placeholder
    pricePerML: 1300, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.52802.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.52802.jpg',
    description: 'A vibrant and intense amber fougere fragrance.',
    accords: ['Vanilla', 'Sweet', 'Amber', 'Warm Spicy', 'Cinnamon', 'Aromatic'],
    topNotes: ['Pink Pepper', 'Juniper', 'Violet'],
    middleNotes: ['Toffee', 'Cinnamon', 'Lavender', 'Sage'],
    baseNotes: ['Vanilla', 'Tonka Bean', 'Amber', 'Suede'],
    overallRating: 4.4, // Placeholder
    dayNightRating: 0, // Night
    seasonRating: 0.1, // Winter/Fall
    priceValueRating: 4.1, // Placeholder
    sillageRating: 2, // Strong
    longevityRating: 2, // Very long lasting
    similarPerfumes: ['81642'], // Placeholder
    occasions: ['Noche', 'Fiesta', 'Especial', 'Romántica'], // Added
  },
  {
    id: '72158',
    name: 'Le Beau Le Parfum',
    brand: 'Jean Paul Gaultier',
    matchPercentage: 83, // Placeholder
    pricePerML: 1450, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.72158.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.72158.jpg',
    description: 'An intense amber woody fragrance.',
    accords: ['Coconut', 'Sweet', 'Woody', 'Vanilla', 'Tropical', 'Amber'],
    topNotes: ['Pineapple', 'Iris', 'Cypress', 'Ginger'],
    middleNotes: ['Coconut', 'Woodsy Notes'],
    baseNotes: ['Tonka Bean', 'Sandalwood', 'Amber', 'Ambergris'],
    overallRating: 4.3, // Placeholder
    dayNightRating: 0.8, // Day leaning
    seasonRating: 0.8, // Summer/Spring
    priceValueRating: 4.0, // Placeholder
    sillageRating: 1, // Moderate
    longevityRating: 2, // Long lasting
    similarPerfumes: [], // Placeholder
    occasions: ['Casual', 'Viaje', 'Relax', 'Deportiva'], // Added
  },
  {
    id: '31623',
    name: 'By the Fireplace',
    brand: 'Maison Martin Margiela',
    matchPercentage: 86, // Placeholder
    pricePerML: 1800, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.31623.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.31623.jpg',
    description: 'A warm and cozy woody fragrance.',
    accords: ['Woody', 'Vanilla', 'Warm Spicy', 'Balsamic', 'Powdery'],
    topNotes: ['Cloves', 'Pink Pepper', 'Orange Blossom'],
    middleNotes: ['Chestnut', 'Guaiac Wood', 'Juniper'],
    baseNotes: ['Vanilla', 'Peru Balsam', 'Cashmeran'],
    overallRating: 4.4, // Placeholder
    dayNightRating: 0.2, // Night leaning
    seasonRating: 0.1, // Winter/Fall
    priceValueRating: 3.5, // Placeholder
    sillageRating: 1, // Moderate
    longevityRating: 1, // Moderate
    similarPerfumes: ['62615'], // Placeholder
    occasions: ['Noche', 'Relax', 'Especial', 'Romántica'], // Added
  },
  {
    id: '50757',
    name: 'Y Eau de Parfum',
    brand: 'Yves Saint Laurent',
    matchPercentage: 91, // Placeholder
    pricePerML: 1350, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.50757.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.50757.jpg',
    description: 'A fresh and intense aromatic fougere fragrance.',
    accords: ['Aromatic', 'Woody', 'Fresh Spicy', 'Warm Spicy', 'Fruity', 'Green'],
    topNotes: ['Apple', 'Ginger', 'Bergamot'],
    middleNotes: ['Sage', 'Juniper Berries', 'Geranium'],
    baseNotes: ['Amberwood', 'Tonka Bean', 'Cedar', 'Vetiver', 'Olibanum'],
    overallRating: 4.3, // Placeholder
    dayNightRating: 0.7, // Day leaning
    seasonRating: 0.6, // Spring/Summer/Fall
    priceValueRating: 4.0, // Placeholder
    sillageRating: 2, // Strong
    longevityRating: 2, // Long lasting
    similarPerfumes: ['31861', '9099'], // Placeholder
    occasions: ['Casual', 'Oficina', 'Deportiva', 'Viaje'], // Added
  },
  {
    id: '13016',
    name: 'Dior Homme Intense 2011',
    brand: 'Dior',
    matchPercentage: 89, // Placeholder
    pricePerML: 1600, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.13016.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.13016.jpg',
    description: 'A sophisticated woody floral musk fragrance.',
    accords: ['Iris', 'Woody', 'Powdery', 'Aromatic', 'Violet', 'Musky'],
    topNotes: ['Lavender'],
    middleNotes: ['Iris', 'Ambrette (Musk Mallow)', 'Pear'],
    baseNotes: ['Virginia Cedar', 'Vetiver'],
    overallRating: 4.6, // Placeholder
    dayNightRating: 0.1, // Night leaning
    seasonRating: 0.1, // Winter/Fall
    priceValueRating: 3.8, // Placeholder
    sillageRating: 2, // Strong
    longevityRating: 2, // Very long lasting
    similarPerfumes: ['61856'], // Placeholder
    occasions: ['Formal', 'Noche', 'Especial', 'Romántica', 'Oficina'], // Added
  },
  {
    id: '83483',
    name: 'Goddess',
    brand: 'Burberry',
    matchPercentage: 79, // Placeholder
    pricePerML: 1550, // Placeholder
    thumbnailUrl: 'https://fimgs.net/mdimg/perfume/s.83483.jpg',
    fullSizeUrl: 'https://fimgs.net/mdimg/perfume/375x500.83483.jpg',
    description: 'A unique aromatic gourmand fragrance.',
    accords: ['Vanilla', 'Aromatic', 'Lavender', 'Sweet', 'Warm Spicy'],
    topNotes: ['Vanilla', 'Lavender', 'Cacao', 'Ginger'],
    middleNotes: ['Vanilla Caviar'],
    baseNotes: ['Vanilla Absolute'],
    overallRating: 4.2, // Placeholder
    dayNightRating: 0.5, // Versatile
    seasonRating: 0.5, // All seasons
    priceValueRating: 3.9, // Placeholder
    sillageRating: 1, // Moderate
    longevityRating: 2, // Long lasting
    similarPerfumes: [], // Placeholder
    occasions: ['Casual', 'Romántica', 'Especial', 'Relax'], // Added
  },
];