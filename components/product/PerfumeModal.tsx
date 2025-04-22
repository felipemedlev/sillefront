import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react'; // Import useEffect
import { View, Text, StyleSheet, Dimensions, Pressable, Image, Modal, ScrollView, FlatList, ViewStyle, ActivityIndicator } from 'react-native'; // Import ViewStyle, ActivityIndicator
import { Feather } from '@expo/vector-icons';
import { Perfume, BasicPerfumeInfo } from '../../types/perfume';
import {
  PERFUME_NOTE_TRANSLATIONS,
  BEST_FOR_TRANSLATIONS,
  SEASON_TRANSLATIONS,
  GENDER_TRANSLATIONS
} from '../../types/constants';
import { fetchPerfumesByExternalIds } from '../../src/services/api';
import StarRating from '../ui/StarRating';
import TagItem from '../ui/TagItem';
import RatingBar from '../ui/RatingBar';
import PerfumeCard from './PerfumeCard';

// --- Interfaces ---
interface PerfumeModalProps {
  perfume?: Perfume | null;
  onClose?: () => void;
  isSwapping?: boolean;
  onSimilarPerfumeSelect?: (perfumeId: string) => void;
  perfumeList?: Perfume[];
}

export interface PerfumeModalRef {
  show: (perfumeData: Perfume) => void;
  hide: () => void;
}

// --- Component ---
const PerfumeModal = forwardRef<PerfumeModalRef, PerfumeModalProps>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPerfume, setCurrentPerfume] = useState<Perfume | null>(props.perfume ?? null);
  const [fetchedSimilarPerfumes, setFetchedSimilarPerfumes] = useState<Perfume[]>([]); // State for fetched similar perfumes
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false); // Loading state for similar perfumes
  const [renderKey, setRenderKey] = useState(0); // Add state to force re-render
  const { width } = Dimensions.get('window');
  const { isSwapping, onSimilarPerfumeSelect } = props;
  const scrollViewRef = useRef<ScrollView>(null);
  useImperativeHandle(ref, () => ({

    show: (perfumeData: Perfume) => {
      // console.log('PerfumeModal show called with:', perfumeData); // Log input data
      setCurrentPerfume(perfumeData);
      setIsVisible(true);
    },
    hide: () => {
      setIsVisible(false);
      // Optional: Delay clearing perfume data until animation finishes
      setTimeout(() => {
        setCurrentPerfume(null);
        setFetchedSimilarPerfumes([]); // Clear fetched data on hide
        setIsLoadingSimilar(false);
      }, 300);
      props.onClose?.();
    }
  }));

  useEffect(() => {
    // console.log(`useEffect triggered: isVisible=${isVisible}, currentPerfume exists=${!!currentPerfume}`); // Log effect trigger
    if (isVisible && currentPerfume?.similar_perfume_ids && currentPerfume.similar_perfume_ids.length > 0) {
      // console.log('Condition met: Fetching similar perfumes...'); // Log condition met
      const fetchSimilar = async () => {
        setIsLoadingSimilar(true);
        setFetchedSimilarPerfumes([]); // Clear previous results
        try {
          // Ensure similar_perfume_ids is definitely an array before calling the API
          if (!currentPerfume?.similar_perfume_ids) { // Use correct field name
            console.error("Similar perfume IDs array is undefined, cannot fetch.");
            return; // Exit if undefined
          }

          console.log('Fetching similar perfumes for IDs:', currentPerfume.similar_perfume_ids);
          const similarData = await fetchPerfumesByExternalIds(currentPerfume.similar_perfume_ids);

          // Check if we got data and log a sample
          if (similarData && similarData.length > 0) {
            console.log(`Fetched ${similarData.length} similar perfumes`);
            const sample = similarData[0];
            console.log('Sample perfume data:', JSON.stringify({
              id: sample.id,
              external_id: sample.external_id,
              name: sample.name,
              thumbnail_url: sample.thumbnail_url || sample.thumbnailUrl,
              full_size_url: sample.full_size_url || sample.fullSizeUrl,
              ratings: {
                overall: sample.overall_rating,
                price_value: sample.price_value_rating,
                longevity: sample.longevity_rating,
                sillage: sample.sillage_rating
              },
              similar_ids: sample.similar_perfume_ids?.length || 0
            }));

            // Normalize the data to ensure consistent property names
            const normalizedSimilarData = similarData.map(p => ({
              ...p,
              thumbnail_url: p.thumbnail_url || p.thumbnailUrl || '',
              full_size_url: p.full_size_url || p.fullSizeUrl || '',
              price_per_ml: p.price_per_ml || p.pricePerML,
              // Handle match percentage for similar perfumes - normalize value if exists
              match_percentage: p.match_percentage !== undefined ?
                (p.match_percentage > 1 ? p.match_percentage : p.match_percentage * 100) :
                null,
              // Ensure brand is properly formatted
              brand: typeof p.brand === 'string' ? p.brand : (p.brand?.name || p.brand || '')
            }));

            setFetchedSimilarPerfumes(normalizedSimilarData);
          } else {
            console.log('No similar perfumes data returned');
            setFetchedSimilarPerfumes([]);
          }
        } catch (error) {
          console.error('Error fetching similar perfumes:', error);
          setFetchedSimilarPerfumes([]); // Clear on error
        } finally {
          setIsLoadingSimilar(false);
        }
      };
      fetchSimilar();
    } else {
      // console.log('Condition NOT met: Skipping fetch.', { isVisible, hasSimilar: !!currentPerfume?.similar_perfume_ids, length: currentPerfume?.similar_perfume_ids?.length }); // Use correct field name
    }
  }, [isVisible, currentPerfume]); // Rerun when modal visibility or perfume changes
  const handleClose = () => {
    setIsVisible(false);
    props.onClose?.();
  };

  const handleSimilarPerfumePress = (perfumeId: string) => {
    console.log(`handleSimilarPerfumePress called with perfumeId: ${perfumeId}`);
    if (isSwapping && onSimilarPerfumeSelect) {
      onSimilarPerfumeSelect(perfumeId);
    } else {
      // Find the full perfume data from the fetchedSimilarPerfumes array using external_id
      console.log(`Looking for perfume with external_id ${perfumeId} in ${fetchedSimilarPerfumes.length} similar perfumes`);
      const similarPerfume = fetchedSimilarPerfumes.find((p: Perfume) => String(p.external_id) === String(perfumeId));
      if (similarPerfume) {
        console.log("Found similar perfume data:", JSON.stringify({
          id: similarPerfume.id,
          name: similarPerfume.name,
          external_id: similarPerfume.external_id,
          thumbnail_url: similarPerfume.thumbnail_url || similarPerfume.thumbnailUrl,
          full_size_url: similarPerfume.full_size_url || similarPerfume.fullSizeUrl,
          ratings: {
            overall: similarPerfume.overall_rating,
            price_value: similarPerfume.price_value_rating,
            longevity: similarPerfume.longevity_rating,
            sillage: similarPerfume.sillage_rating
          }
        }));
        setCurrentPerfume(similarPerfume);
        setRenderKey(prevKey => prevKey + 1); // Increment key to force re-render
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        console.warn(`Perfume with external_id ${perfumeId} not found in fetchedSimilarPerfumes.`); // Added warning
      }
    }
  };

  // Helper function to get similar perfume data from the fetched list
  const getSimilarPerfumeData = (perfumeId: string): BasicPerfumeInfo | undefined => {
    // Use the fetchedSimilarPerfumes state here!
    const perfume = fetchedSimilarPerfumes.find((p: Perfume) => String(p.external_id) === String(perfumeId));
    if (!perfume) return undefined;

    return {
      id: perfume.id,
      name: perfume.name,
      brand: perfume.brand,
      thumbnail_url: perfume.thumbnail_url || perfume.thumbnailUrl || '',
      full_size_url: perfume.full_size_url || perfume.fullSizeUrl || '',
    };
  };

  // Translation mapping for perfume notes
  const translateNote = (note: string): string => {
    const noteLower = note.toLowerCase();

    // Try to find an exact match first
    if (PERFUME_NOTE_TRANSLATIONS[noteLower as keyof typeof PERFUME_NOTE_TRANSLATIONS]) {
      return PERFUME_NOTE_TRANSLATIONS[noteLower as keyof typeof PERFUME_NOTE_TRANSLATIONS];
    }

    // Try to find a partial match
    for (const [key, value] of Object.entries(PERFUME_NOTE_TRANSLATIONS)) {
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
  const priceValueLabels = ['Bajo', 'Regular', 'Bueno', 'Excelente'];

  if (!isVisible || !currentPerfume) {
    return null;
  }

  const {
    name, brand, description,
    accords,
    top_notes, middle_notes, base_notes,
    overall_rating,
    price_value_rating,
    sillage_rating,
    longevity_rating,
    match_percentage,
    similar_perfume_ids, // Array of similar perfume IDs
    season,
    best_for,
    gender,
    price_per_ml = currentPerfume.price_per_ml,
  } = currentPerfume;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View key={renderKey} style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={32} color="#333" />
          </Pressable>

          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            {/* Match Percentage at Top */}
            {(match_percentage !== undefined && match_percentage !== null) && (
              <View style={styles.matchContainer}>
                <Text style={styles.matchPercentage}>
                  {match_percentage > 1 ? Math.round(match_percentage) : Math.round(match_percentage * 100)}%
                </Text>
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
              <Image source={{ uri: currentPerfume.full_size_url }} style={[styles.perfumeImage, { width: width * 0.6, height: width * 0.6 }]} />
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.perfumeName}>{name}</Text>
              {/* Ensure brand is an object with name before rendering */}
              <Text style={styles.perfumeBrand}>{typeof brand === 'string' ? brand : (brand as { name?: string })?.name ?? ''}</Text>
              <Text style={styles.perfumePrice}>
                {price_per_ml !== undefined && price_per_ml !== null
                  ? `$${typeof price_per_ml === 'number' ? price_per_ml.toFixed(2) : price_per_ml}/mL`
                  : 'Precio no disponible'
                }
              </Text>
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

              {/* General Rating with Stars */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>General:</Text>
                {overall_rating !== undefined && overall_rating !== null ? (
                  <StarRating rating={overall_rating} />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>

              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Valor/Precio:</Text>
                {price_value_rating !== undefined && price_value_rating !== null ? (
                  <RatingBar
                    rating={price_value_rating}
                    labels={priceValueLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>

              {/* Longevity Rating Bar */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Duración:</Text>
                {longevity_rating !== undefined && longevity_rating !== null ? (
                  <RatingBar
                    rating={longevity_rating}
                    labels={longevityLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>

              {/* Sillage Rating Bar */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Sillage:</Text>
                {sillage_rating !== undefined && sillage_rating !== null ? (
                  <RatingBar
                    rating={sillage_rating}
                    labels={sillageLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>
            </View>

            {/* Additional Attributes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Características</Text>
              <View style={styles.tagsContainer}>
                {/* Day/Night - Best For */}
                <TagItem
                  icon="weather-night"
                  label="Mejor para"
                  value={best_for ? BEST_FOR_TRANSLATIONS[best_for.toLowerCase() as keyof typeof BEST_FOR_TRANSLATIONS] || best_for : undefined}
                />

                {/* Season */}
                <TagItem
                  icon="calendar"
                  label="Temporada"
                  value={season ? SEASON_TRANSLATIONS[season.toLowerCase() as keyof typeof SEASON_TRANSLATIONS] || season : undefined}
                  iconFamily="Feather"
                />

                {/* Gender */}
                <TagItem
                  icon="human-male-female"
                  label="Género"
                  value={gender ? GENDER_TRANSLATIONS[gender.toLowerCase() as keyof typeof GENDER_TRANSLATIONS] || gender : undefined}
                />
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
                {renderNoteTags(top_notes)}
              </View>
              <View style={styles.notesSection}>
                <Text style={styles.notesCategoryTitle}>Notas Medias</Text>
                {renderNoteTags(middle_notes)}
              </View>
              <View style={styles.notesSection}>
                <Text style={styles.notesCategoryTitle}>Notas de Fondo</Text>
                {renderNoteTags(base_notes)}
              </View>
            </View>

             {/* Similar Perfumes */}
             {similar_perfume_ids && similar_perfume_ids.length > 0 && ( // Use correct field name
                 <View style={styles.section}>
                     <Text style={styles.sectionTitle}>
                         {isSwapping ? 'Perfumes Similares para Cambiar' : 'Perfumes Similares'}
                     </Text>
                     {/* Conditionally render FlatList or loading indicator */}
                     {isLoadingSimilar ? (
                         <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#809CAC" />
                     ) : (
                         <FlatList
                             data={similar_perfume_ids} // Iterate over the IDs from the current perfume // Use correct field name
                             renderItem={({ item }) => {
                                 // 'item' here is the external_id
                                 const similarPerfumeData = getSimilarPerfumeData(item); // Get full data from fetched state
                                 if (!similarPerfumeData) {
                                     // If loading is finished and data wasn't found for this ID, render nothing.
                                     if (!isLoadingSimilar) {
                                         return null;
                                     }
                                     // Otherwise (still loading), show the placeholder.
                                     return (
                                         <View style={{ width: 120, marginRight: 15, alignItems: 'center' }}>
                                             <View style={{ width: 100, height: 100, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8 }} />
                                             <Text style={{ fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' }} numberOfLines={1}>Cargando...</Text>
                                         </View>
                                     );
                                 }
                                 return (
                                     <PerfumeCard
                                         perfume={similarPerfumeData}
                                         onPress={() => handleSimilarPerfumePress(item)} // Pass the external_id
                                     />
                                 );
                             }}
                             keyExtractor={(item) => item}
                             horizontal // Keep horizontal layout
                             showsHorizontalScrollIndicator={false}
                             contentContainerStyle={styles.similarPerfumesList}
                             // Show empty text only if not loading and fetched list is empty *after* trying to fetch
                             ListEmptyComponent={!isLoadingSimilar && fetchedSimilarPerfumes.length === 0 ? <Text style={styles.detailText}>No se encontraron perfumes similares.</Text> : null}
                         />
                     )}
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
  // Styles for Similar Perfumes
  similarPerfumesList: {
    paddingVertical: 10,
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
  tagsContainer: {
    marginTop: 8,
    gap: 16,
  },
});

export default PerfumeModal;