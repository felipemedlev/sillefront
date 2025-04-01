import { Feather } from '@expo/vector-icons';

// Define the type for the gender of the box
export type BoxGender = 'masculino' | 'femenino'; // Strict gender type

// Define the interface for a predefined box
export interface PredefinedBox {
  id: string; // Unique identifier for the box
  title: string; // Thematic name, e.g., "Summer Scents Box"
  description: string; // Brief description of the box theme
  icon: keyof typeof Feather.glyphMap; // Icon name from Feather icons
  gender: BoxGender; // Target gender for the box ('masculino' or 'femenino')
  perfumeIds: string[]; // Array of perfume IDs included in the box (ensure at least 8)
}

// Array of predefined gift boxes
export const PREDEFINED_BOXES: PredefinedBox[] = [
  // Masculine Boxes
  {
    id: 'box-fresh-citrus-m',
    title: 'Fresh Citrus Kick (Him)',
    description: 'Energizing citrus scents for a vibrant start.',
    icon: 'zap',
    gender: 'masculino',
    perfumeIds: ['9099', '410', '485', '50757', '72158', '31861', '13016', '61856'] // Example IDs
  },
  {
    id: 'box-woody-elegance-m',
    title: 'Woody Elegance (Him)',
    description: 'Sophisticated woody notes for formal occasions.',
    icon: 'briefcase',
    gender: 'masculino',
    perfumeIds: ['13016', '61856', '62615', '31623', '75805', '81642', '52802', '9099'] // Example IDs
  },
  {
    id: 'box-night-out-m',
    title: 'Night Out Intensity (Him)',
    description: 'Bold and captivating fragrances for evenings.',
    icon: 'moon',
    gender: 'masculino',
    perfumeIds: ['81642', '52802', '75805', '62615', '61856', '13016', '31861', '25324'] // Example IDs, mix?
  },
  // Feminine Boxes
  {
    id: 'box-floral-bloom-f',
    title: 'Floral Bloom (Her)',
    description: 'A bouquet of delicate and romantic floral notes.',
    icon: 'gift', // Replaced 'flower' with 'gift'
    gender: 'femenino',
    perfumeIds: ['210', '14982', '39681', '83483', '485', '9099', '50757', '61856'] // Example IDs
  },
  {
    id: 'box-sweet-gourmand-f',
    title: 'Sweet Gourmand Delight (Her)',
    description: 'Indulgent and sweet scents for a cozy feel.',
    icon: 'coffee',
    gender: 'femenino',
    perfumeIds: ['14982', '25324', '39681', '83483', '75805', '62615', '52802', '81642'] // Example IDs
  },
  {
    id: 'box-elegant-evening-f',
    title: 'Elegant Evening (Her)',
    description: 'Sophisticated and alluring fragrances for special nights.',
    icon: 'star',
    gender: 'femenino',
    perfumeIds: ['39681', '25324', '14982', '210', '62615', '13016', '83483', '75805'] // Example IDs
  },
];