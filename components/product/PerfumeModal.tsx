import { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Image, Modal, ScrollView, FlatList, ViewStyle } from 'react-native'; // Import ViewStyle
import { Feather } from '@expo/vector-icons';
import { MOCK_PERFUMES } from '@/data/mockPerfumes';
import { Perfume, BasicPerfumeInfo } from '../../types/perfume';

// --- Placeholder Components (Ideally, these would be separate files) ---

// Placeholder for a simple Perfume Card used in the "Similar Perfumes" section
const PerfumeCardPlaceholder = ({ perfume, onPress }: { perfume: BasicPerfumeInfo; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.similarPerfumeCard}>
    <Image source={{ uri: perfume.thumbnailUrl }} style={styles.similarPerfumeImage} />
    <Text style={styles.similarPerfumeName} numberOfLines={1}>{perfume.name}</Text>
    <Text style={styles.similarPerfumeBrand} numberOfLines={1}>{perfume.brand}</Text>
  </Pressable>
);

// Generic Rating Bar
interface RatingBarProps {
  rating: number; // Expecting a value between 0 and 1
  labels: string[];
  style?: ViewStyle;
}

const RatingBar = ({ rating, labels, style }: RatingBarProps) => {
  const indicatorPosition = `${Math.max(0, Math.min(1, rating)) * 100}%`;
  // const labelCount = labels.length;
  // const labelWidth = 100 / labelCount; // Percentage width for each label section

  return (
    <View style={[styles.ratingBarContainer, style]}>
      <View style={styles.ratingBarBackground} />
      {/* Add 'as ViewStyle' for the left property */}
      <View style={[styles.ratingBarIndicator, { left: indicatorPosition } as ViewStyle]} />
      <View style={styles.ratingLabels}>
        {labels.map((label) => (
          <Text
            key={label}
            style={[
              styles.ratingLabelText,
              // Adjust label positioning if needed, e.g., center within its section
              // { width: `${labelWidth}%`, textAlign: 'center' }
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};


// --- Interfaces ---

interface PerfumeModalProps {
  perfume: Perfume | null;
  onClose?: () => void;
  isSwapping?: boolean;
  onSimilarPerfumeSelect?: (perfumeId: string) => void;
}

export interface PerfumeModalRef {
  show: (perfumeData: Perfume) => void;
  hide: () => void;
}

// --- Component ---

const PerfumeModal = forwardRef<PerfumeModalRef, PerfumeModalProps>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPerfume, setCurrentPerfume] = useState<Perfume | null>(props.perfume);
  const { width } = Dimensions.get('window');
  const { isSwapping, onSimilarPerfumeSelect } = props;
  const scrollViewRef = useRef<ScrollView>(null);
  useImperativeHandle(ref, () => ({
    show: (perfumeData: Perfume) => {
      setCurrentPerfume(perfumeData);
      setIsVisible(true);
    },
    hide: () => {
      setIsVisible(false);
      // Optional: Delay clearing perfume data until animation finishes
      setTimeout(() => setCurrentPerfume(null), 300);
      props.onClose?.();
    }
  }));

  const handleClose = () => {
    setIsVisible(false);
    props.onClose?.();
  };

  const handleSimilarPerfumePress = (perfumeId: string) => {
    if (isSwapping && onSimilarPerfumeSelect) {
      onSimilarPerfumeSelect(perfumeId);
    } else {
      // Find the full perfume data from the MOCK_PERFUMES array
      const similarPerfume = MOCK_PERFUMES.find((p: Perfume) => p.id === perfumeId);
      if (similarPerfume) {
        setCurrentPerfume(similarPerfume);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    }
  };

  // Helper function to get similar perfume data
  const getSimilarPerfumeData = (perfumeId: string): BasicPerfumeInfo | undefined => {
    const perfume = MOCK_PERFUMES.find((p: Perfume) => p.id === perfumeId);
    if (!perfume) return undefined;

    return {
      id: perfume.id,
      name: perfume.name,
      brand: perfume.brand,
      thumbnailUrl: perfume.thumbnailUrl,
      fullSizeUrl: perfume.fullSizeUrl,
    };
  };

  // Translation mapping for perfume notes
  const translateNote = (note: string): string => {
    const noteLower = note.toLowerCase();

    // Common perfume notes translations
    const translations: { [key: string]: string } = {
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
    };

    // Try to find an exact match first
    if (translations[noteLower]) {
      return translations[noteLower];
    }

    // Try to find a partial match
    for (const [key, value] of Object.entries(translations)) {
      if (noteLower.includes(key)) {
        return value;
      }
    }

    // If no translation found, return the original note
    return note;
  };

  // Helper to render note tags
  const renderNoteTags = (notes?: string[]) => {
    if (!notes || notes.length === 0) {
      return <Text style={styles.detailText}>N/A</Text>;
    }
    return (
      <View style={styles.notesGroupContainer}>
        {notes.map((note, index) => (
          <View key={index} style={styles.noteTag}>
            <Text style={styles.noteText}>{translateNote(note)}</Text>
          </View>
        ))}
      </View>
    );
  };

  // --- Rating Mappings ---
  const longevityLabels = ['Baja', 'Moderada', 'Duradera', 'Eterna'];
  const sillageLabels = ['Bajo', 'Moderado', 'Fuerte', 'Intenso'];
  const dayNightLabels = ['Noche', 'Ambos', 'Día']; // Use 3 labels for 0, 0.5, 1
  const seasonLabels = ['Invierno', 'Otoño', 'Primavera', 'Verano'];

  // Helper to map discrete ratings (0, 1, 2, 3) to a 0-1 scale for the bar
  const mapDiscreteRatingToScale = (rating: number | undefined, maxRating: number): number => {
    if (rating === undefined || maxRating <= 0) return 0.5; // Default to middle if undefined
    return rating / maxRating;
  };


  if (!isVisible || !currentPerfume) {
    return null;
  }

  const {
    name, brand, matchPercentage, pricePerML, description,
    accords, topNotes, middleNotes, baseNotes, overallRating,
    dayNightRating, seasonRating, priceValueRating, sillageRating,
    longevityRating, similarPerfumes
  } = currentPerfume;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={32} color="#333" />
          </Pressable>

          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            {/* Match Percentage at Top */}
            {matchPercentage !== undefined && (
              <View style={styles.matchContainer}>
                <Text style={styles.matchPercentage}>{matchPercentage}%</Text>
                <Text style={styles.matchLabel}>Match</Text>
              </View>
            )}

            {/* Swap Mode Indicator */}
            {isSwapping && (
              <View style={styles.swapModeContainer}>
                <Text style={styles.swapModeText}>Modo Cambio</Text>
                <Text style={styles.swapModeSubtext}>Selecciona un perfume similar para reemplazar</Text>
              </View>
            )}

            {/* Image Header */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: currentPerfume.fullSizeUrl }} style={[styles.perfumeImage, { width: width * 0.6, height: width * 0.6 }]} />
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.perfumeName}>{name}</Text>
              <Text style={styles.perfumeBrand}>{brand}</Text>
              <Text style={styles.perfumePrice}>${pricePerML?.toLocaleString()}/mL</Text>
            </View>

            {/* Accords - Redesigned */}
            {accords && accords.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Acordes Principales</Text>
                <View style={styles.accordsContainer}>
                  {accords.map((accord, index) => (
                    <View
                      key={index}
                      style={[
                        styles.accordBar,
                        {
                          width: `${90 - (index * 7)}%`,
                          backgroundColor: getAccordColor(accord)
                        }
                      ]}
                    >
                      <Text style={styles.accordText}>{translateNote(accord)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Ratings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ratings</Text>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>General:</Text>
                <Text style={styles.ratingLabel}>{overallRating}/5</Text>
              </View>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Valor/Precio:</Text>
                <Text style={styles.ratingLabel}>{priceValueRating}/5</Text>
              </View>
              {/* Longevity Rating Bar */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Duración:</Text>
                {longevityRating !== undefined ? (
                  <RatingBar
                    rating={mapDiscreteRatingToScale(longevityRating, longevityLabels.length - 1)}
                    labels={longevityLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>
              {/* Sillage Rating Bar */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Sillage:</Text>
                {sillageRating !== undefined ? (
                  <RatingBar
                    rating={mapDiscreteRatingToScale(sillageRating, sillageLabels.length - 1)}
                    labels={sillageLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>
              {/* Day/Night Rating Bar */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Mejor para:</Text>
                {dayNightRating !== undefined ? (
                  <RatingBar
                    rating={dayNightRating} // Already 0-1 scale
                    labels={dayNightLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>
              {/* Season Rating Bar */}
              <View style={styles.ratingItem}>
                 <Text style={styles.ratingLabel}>Temporada:</Text>
                 {seasonRating !== undefined ? <RatingBar rating={seasonRating} labels={seasonLabels} /> : <Text style={styles.ratingValue}>N/A</Text>}
              </View>
            </View>

            {/* Description */}
            {description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text style={styles.descriptionText}>{description}</Text>
              </View>
            )}

            {/* Notes Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Piramide Olfativa</Text>
              <View style={styles.notesSection}>
                <Text style={styles.notesCategoryTitle}>Notas de Salida</Text>
                {renderNoteTags(topNotes)}
              </View>
              <View style={styles.notesSection}>
                <Text style={styles.notesCategoryTitle}>Notas Medias</Text>
                {renderNoteTags(middleNotes)}
              </View>
              <View style={styles.notesSection}>
                <Text style={styles.notesCategoryTitle}>Notas de Fondo</Text>
                {renderNoteTags(baseNotes)}
              </View>
            </View>

             {/* Similar Perfumes */}
             {similarPerfumes && similarPerfumes.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {isSwapping ? 'Perfumes Similares para Cambiar' : 'Perfumes Similares'}
                    </Text>
                    <FlatList
                        data={similarPerfumes}
                        renderItem={({ item }) => {
                            const similarPerfumeData = getSimilarPerfumeData(item);
                            if (!similarPerfumeData) return null;
                            return (
                                <PerfumeCardPlaceholder
                                    perfume={similarPerfumeData}
                                    onPress={() => handleSimilarPerfumePress(item)}
                                />
                            );
                        }}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.similarPerfumesList}
                    />
                </View>
             )}

            {/* Spacer at the bottom */}
            <View style={{ height: 80 }} />

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

PerfumeModal.displayName = 'PerfumeModal';

// --- Styles ---

const getAccordColor = (accord: string): string => {
  // Convert to lowercase for case-insensitive matching
  const accordLower = accord.toLowerCase();

  // Map common accord types to specific colors
  if (accordLower.includes('citrus') || accordLower.includes('lemon') || accordLower.includes('orange') || accordLower.includes('bergamot')) {
    return '#FFD166'; // Bright yellow for citrus
  } else if (accordLower.includes('floral') || accordLower.includes('flower')) {
    return '#F7C8A3'; // Soft peach for general florals
  } else if (accordLower.includes('rose')) {
    return '#f7d0cb'; // Pink for rose
  } else if (accordLower.includes('vanilla')) {
    return '#fdf7e4'; // Cream color for vanilla
  } else if (accordLower.includes('amber') || accordLower.includes('ambergris')) {
    return '#D4A373'; // Amber color
  } else if (accordLower.includes('wood') || accordLower.includes('cedar') || accordLower.includes('sandalwood')) {
    return '#a97a57'; // Brown for woody notes
  } else if (accordLower.includes('green') || accordLower.includes('grass') || accordLower.includes('leaf')) {
    return '#CCD5AE'; // Light green for green notes
  } else if (accordLower.includes('musk')) {
    return '#B5838D'; // Mauve for musk
  } else if (accordLower.includes('spicy') || accordLower.includes('pepper') || accordLower.includes('cinnamon')) {
    return '#D5BDAF'; // Spicy brown
  } else if (accordLower.includes('marine') || accordLower.includes('aquatic') || accordLower.includes('water')) {
    return '#6FAEDC'; // Light blue for marine/aquatic
  } else if (accordLower.includes('fruity') || accordLower.includes('fruit')) {
    return '#EE964B'; // Orange for fruity
  } else if (accordLower.includes('sweet')) {
    return '#F4ACBD'; // Light pink for sweet
  } else if (accordLower.includes('leather')) {
    return '#795C34'; // Dark brown for leather
  } else if (accordLower.includes('powder') || accordLower.includes('powdery')) {
    return '#E8E6E1'; // Off-white for powdery
  } else if (accordLower.includes('smoke') || accordLower.includes('tobacco')) {
    return '#6B5B4C'; // Dark taupe for smoke/tobacco
  } else if (accordLower.includes('gourmand') || accordLower.includes('caramel') || accordLower.includes('chocolate')) {
    return '#C68E61'; // Caramel color for gourmand
  } else {
    // Default color for unmatched accords
    return '#BDBDBD'; // Neutral gray
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Aligns modal to bottom
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%', // Adjust height as needed
    paddingTop: 15, // Space for close button handle area
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative', // For badge positioning
  },
  perfumeImage: {
    resizeMode: 'contain',
  },
  matchContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  matchPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#809CAC', // Using existing color scheme
  },
  matchLabel: {
    fontSize: 16,
    color: '#555',
    marginTop: -5,
  },
  matchBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#809CAC', // Existing color
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA', // Lighter divider
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  perfumeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  perfumeBrand: {
    fontSize: 18,
    color: '#555',
    marginBottom: 12,
  },
  perfumePrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#809CAC', // Existing color
  },
  // New accord styles
  accordsContainer: {
    marginTop: 10,
  },
  accordBar: {
    height: 30,
    marginBottom: 8,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  accordText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 30, // Ensure consistent height for items with/without bars
  },
  ratingLabel: {
    fontSize: 15,
    color: '#444',
    width: 100, // Align labels
    fontWeight: '500',
  },
  ratingValue: { // Keep for N/A text
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  ratingStarsContainer: {
    flexDirection: 'row',
  },
  descriptionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  notesGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteTag: {
    backgroundColor: '#F0F4F6', // Light background for tags
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  noteText: {
    color: '#555', // Darker text for better readability
    fontSize: 13,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 12,
  },
  notesCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30, // Add safe area padding if needed
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  addToCartButton: {
    backgroundColor: '#809CAC', // Existing color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#809CAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles for Similar Perfumes (Placeholder)
  similarPerfumesList: {
    paddingVertical: 10,
  },
  similarPerfumeCard: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
  },
  similarPerfumeImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
    borderRadius: 8, // Optional: round corners
    backgroundColor: '#F8F8F8', // Placeholder background
  },
  similarPerfumeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  similarPerfumeBrand: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  // Generic Rating Bar Styles
  ratingBarContainer: {
    flex: 1, // Take remaining space
    height: 20, // Bar height + label space
    marginLeft: 10,
    justifyContent: 'center',
  },
  ratingBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  ratingBarIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#555',
    borderWidth: 2,
    borderColor: 'white',
    top: -8, // Center vertically
    transform: [{ translateX: -8 }], // Center the indicator
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1, // Ensure indicator is above background
  } as ViewStyle,
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2, // Align roughly with bar ends
  },
  ratingLabelText: {
    fontSize: 10,
    color: '#888',
  },
  detailText: { // Used for N/A values in notes
      fontSize: 14,
      color: '#999',
      fontStyle: 'italic',
  },
  swapModeContainer: {
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  swapModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#809CAC',
    marginBottom: 4,
  },
  swapModeSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default PerfumeModal;