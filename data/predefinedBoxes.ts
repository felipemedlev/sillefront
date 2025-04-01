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
  // Cajas Masculinas
  {
    id: 'box-fresh-citrus-m',
    title: 'Cítrico Fresco (Para Él)',
    description: 'Fragancias cítricas energizantes para comenzar con vitalidad.',
    icon: 'zap',
    gender: 'masculino',
    perfumeIds: ['9099', '410', '485', '50757', '72158', '31861', '13016', '61856']
  },
  {
    id: 'box-woody-elegance-m',
    title: 'Elegancia Amaderada (Para Él)',
    description: 'Notas amaderadas sofisticadas para ocasiones formales.',
    icon: 'briefcase',
    gender: 'masculino',
    perfumeIds: ['13016', '61856', '62615', '31623', '75805', '81642', '52802', '9099']
  },
  {
    id: 'box-night-out-m',
    title: 'Noche de Seducción (Para Él)',
    description: 'Fragancias atrevidas y cautivadoras para salidas nocturnas.',
    icon: 'moon',
    gender: 'masculino',
    perfumeIds: ['81642', '52802', '75805', '62615', '61856', '13016', '31861', '25324']
  },
  // Cajas Femeninas
  {
    id: 'box-floral-bloom-f',
    title: 'Explosión Floral (Para Ella)',
    description: 'Un bouquet romántico con delicadas notas florales.',
    icon: 'gift',
    gender: 'femenino',
    perfumeIds: ['210', '14982', '39681', '83483', '485', '9099', '50757', '61856']
  },
  {
    id: 'box-sweet-gourmand-f',
    title: 'Dulce Tentación (Para Ella)',
    description: 'Fragancias dulces y exquisitas para una sensación acogedora.',
    icon: 'coffee',
    gender: 'femenino',
    perfumeIds: ['14982', '25324', '39681', '83483', '75805', '62615', '52802', '81642']
  },
  {
    id: 'box-elegant-evening-f',
    title: 'Noche de Elegancia (Para Ella)',
    description: 'Aromas sofisticados y seductores para noches especiales.',
    icon: 'star',
    gender: 'femenino',
    perfumeIds: ['39681', '25324', '14982', '210', '62615', '13016', '83483', '75805']
  },
];