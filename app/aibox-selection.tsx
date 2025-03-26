import React, { useState, useCallback, useRef, useEffect } from 'react';
import PerfumeModal, { PerfumeModalRef } from '../components/product/PerfumeModal';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ImageSourcePropType, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';

type DecantCount = 4 | 8;
type DecantSize = 3 | 5 | 10;

// Mirror the interface from PerfumeModal.tsx
interface Perfume {
  id: string;
  name: string;
  brand: string;
  matchPercentage: number; // Kept for now
  pricePerML: number;
  image: ImageSourcePropType;
  description?: string;

  // New fields matching PerfumeModal
  accords?: string[];
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
  overallRating?: number; // e.g., 0-5
  dayNightRating?: number; // 0 (Night) to 1 (Day), 0.5 (Both)
  seasonRating?: number; // Numerical value 0 (Winter) to 1 (Summer) for the bar logic
  priceValueRating?: number; // e.g., 0-5
  sillageRating?: number; // 0 (Intimate) to 1 (Enormous) - mapped from 0, 1, 2, 3
  longevityRating?: number; // 0 (Weak) to 1 (Eternal) - mapped from 0, 1, 2, 3
  similarPerfumes?: BasicPerfumeInfo[]; // Requires BasicPerfumeInfo definition
}

// Simplified info for similar perfumes list (matching PerfumeModal)
interface BasicPerfumeInfo {
  id: string;
  name: string;
  brand: string;
  image: ImageSourcePropType;
}


// Mock data - updated with numerical ratings
const MOCK_PERFUMES: Perfume[] = [
  {
    id: '1',
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    matchPercentage: 95,
    pricePerML: 1000,
    image: require('../assets/images/decant-general.png'),
    description: 'An aromatic-woody fragrance with a captivating trail. A meeting of strength and elegance.',
    accords: ['Citrus', 'Woody', 'Aromatic', 'Amber', 'Fresh Spicy'],
    topNotes: ['Grapefruit', 'Lemon', 'Mint', 'Pink Pepper'],
    middleNotes: ['Ginger', 'Nutmeg', 'Jasmine'],
    baseNotes: ['Incense', 'Vetiver', 'Cedar', 'Sandalwood', 'Patchouli', 'Labdanum', 'White Musk'],
    overallRating: 4.5,
    dayNightRating: 0.5, // 'both' -> 0.5
    seasonRating: 0.6, // Leans towards Spring/Summer/Autumn
    priceValueRating: 3.5,
    sillageRating: 1, // 'moderate' -> 1
    longevityRating: 2, // 'long' -> 2
    similarPerfumes: [
      { id: '3', name: 'Sauvage', brand: 'Dior', image: require('../assets/images/decant-general.png') },
      { id: '2', name: 'Acqua di Gio', brand: 'Giorgio Armani', image: require('../assets/images/decant-general.png') },
    ],
  },
  {
    id: '2',
    name: 'Acqua di Gio',
    brand: 'Giorgio Armani',
    matchPercentage: 92,
    pricePerML: 1200,
    image: require('../assets/images/decant-general.png'),
    description: 'A fresh aquatic fragrance inspired by the Mediterranean sea.',
    accords: ['Aquatic', 'Citrus', 'Aromatic', 'Marine', 'Woody'],
    topNotes: ['Lime', 'Lemon', 'Bergamot', 'Jasmine', 'Orange'],
    middleNotes: ['Sea Notes', 'Jasmine', 'Calone', 'Peach', 'Freesia'],
    baseNotes: ['White Musk', 'Cedar', 'Oakmoss', 'Patchouli', 'Amber'],
    overallRating: 4.2,
    dayNightRating: 1, // 'day' -> 1
    seasonRating: 0.8, // Strong Summer
    priceValueRating: 4.0,
    sillageRating: 1, // 'moderate' -> 1
    longevityRating: 1, // 'moderate' -> 1
    similarPerfumes: [
      { id: '4', name: 'Light Blue', brand: 'Dolce & Gabbana', image: require('../assets/images/decant-general.png') },
      { id: '1', name: 'Bleu de Chanel', brand: 'Chanel', image: require('../assets/images/decant-general.png') },
    ],
  },
  {
    id: '3',
    name: 'Sauvage',
    brand: 'Dior',
    matchPercentage: 88,
    pricePerML: 2000,
    image: require('../assets/images/decant-general.png'),
    description: 'A radically fresh composition with powerful woody notes.',
    accords: ['Fresh Spicy', 'Amber', 'Citrus', 'Aromatic', 'Musky'],
    topNotes: ['Calabrian bergamot', 'Pepper'],
    middleNotes: ['Sichuan Pepper', 'Lavender', 'Pink Pepper', 'Vetiver'],
    baseNotes: ['Ambroxan', 'Cedar', 'Labdanum'],
    overallRating: 4.0,
    dayNightRating: 0.5, // 'both' -> 0.5
    seasonRating: 0.5, // All seasons
    priceValueRating: 3.0,
    sillageRating: 2, // 'strong' -> 2
    longevityRating: 2, // 'long' -> 2
    similarPerfumes: [
      { id: '1', name: 'Bleu de Chanel', brand: 'Chanel', image: require('../assets/images/decant-general.png') },
    ],
  },
  {
    id: '4',
    name: 'Light Blue',
    brand: 'Dolce & Gabbana',
    matchPercentage: 85,
    pricePerML: 980,
    image: require('../assets/images/decant-general.png'),
    description: 'A refreshing summer fragrance that evokes the spirit of Sicily.',
    accords: ['Citrus', 'Woody', 'Fresh', 'Fruity', 'Aromatic'],
    topNotes: ['Sicilian Lemon', 'Apple', 'Cedar', 'Bellflower'],
    middleNotes: ['Bamboo', 'Jasmine', 'White Rose'],
    baseNotes: ['Cedar', 'Musk', 'Amber'],
    overallRating: 4.1,
    dayNightRating: 1, // 'day' -> 1
    seasonRating: 0.9, // Strong Summer
    priceValueRating: 4.5,
    sillageRating: 1, // 'moderate' -> 1
    longevityRating: 1, // 'moderate' -> 1
    similarPerfumes: [
      { id: '2', name: 'Acqua di Gio', brand: 'Giorgio Armani', image: require('../assets/images/decant-general.png') },
    ],
  },
  {
    id: '5',
    name: 'La Vie Est Belle',
    brand: 'Lancôme',
    matchPercentage: 82,
    pricePerML: 876,
    image: require('../assets/images/decant-general.png'),
    description: 'A feminine fragrance with an iris gourmand accord.',
    accords: ['Sweet', 'Vanilla', 'Fruity', 'Powdery', 'Patchouli'],
    topNotes: ['Black Currant', 'Pear'],
    middleNotes: ['Iris', 'Jasmine', 'Orange Blossom'],
    baseNotes: ['Praline', 'Vanilla', 'Patchouli', 'Tonka Bean'],
    overallRating: 4.6,
    dayNightRating: 0.5, // 'both' -> 0.5
    seasonRating: 0.2, // Leans Winter/Autumn
    priceValueRating: 4.0,
    sillageRating: 2, // 'strong' -> 2
    longevityRating: 2, // 'long' -> 2
    similarPerfumes: [
      { id: '6', name: 'Black Opium', brand: 'Yves Saint Laurent', image: require('../assets/images/decant-general.png') },
      { id: '8', name: 'Good Girl', brand: 'Carolina Herrera', image: require('../assets/images/decant-general.png') },
    ],
  },
  {
    id: '6',
    name: 'Black Opium',
    brand: 'Yves Saint Laurent',
    matchPercentage: 80,
    pricePerML: 930,
    image: require('../assets/images/decant-general.png'),
    description: 'An addictive gourmand fragrance with notes of black coffee and vanilla.',
    accords: ['Vanilla', 'Coffee', 'Sweet', 'Warm Spicy', 'White Floral'],
    topNotes: ['Pear', 'Pink Pepper', 'Orange Blossom'],
    middleNotes: ['Coffee', 'Jasmine', 'Bitter Almond', 'Licorice'],
    baseNotes: ['Vanilla', 'Patchouli', 'Cedar', 'Cashmere Wood'],
    overallRating: 4.3,
    dayNightRating: 0, // 'night' -> 0
    seasonRating: 0.1, // Strong Winter/Autumn
    priceValueRating: 3.8,
    sillageRating: 2, // 'strong' -> 2
    longevityRating: 2, // 'long' -> 2
    similarPerfumes: [
      { id: '5', name: 'La Vie Est Belle', brand: 'Lancôme', image: require('../assets/images/decant-general.png') },
      { id: '8', name: 'Good Girl', brand: 'Carolina Herrera', image: require('../assets/images/decant-general.png') },
    ],
  },
  {
    id: '7',
    name: 'J\'adore',
    brand: 'Dior',
    matchPercentage: 78,
    pricePerML: 1700,
    image: require('../assets/images/decant-general.png'),
    description: 'A floral bouquet that celebrates femininity.',
    accords: ['White Floral', 'Floral', 'Fruity', 'Sweet', 'Aquatic'],
    topNotes: ['Pear', 'Melon', 'Magnolia', 'Peach', 'Mandarin Orange'],
    middleNotes: ['Jasmine', 'Lily-of-the-Valley', 'Tuberose', 'Freesia'],
    baseNotes: ['Musk', 'Vanilla', 'Blackberry', 'Cedar'],
    overallRating: 4.4,
    dayNightRating: 1, // 'day' -> 1
    seasonRating: 0.7, // Spring/Summer
    priceValueRating: 3.2,
    sillageRating: 1, // 'moderate' -> 1
    longevityRating: 2, // 'long' -> 2
    similarPerfumes: [], // No similar ones in this mock list
  },
  {
    id: '8',
    name: 'Good Girl',
    brand: 'Carolina Herrera',
    matchPercentage: 75,
    pricePerML: 1300,
    image: require('../assets/images/decant-general.png'),
    description: 'A sensual fragrance with a duality of good girl and bad girl notes.',
    accords: ['White Floral', 'Sweet', 'Warm Spicy', 'Vanilla', 'Cacao'],
    topNotes: ['Almond', 'Coffee', 'Bergamot', 'Lemon'],
    middleNotes: ['Tuberose', 'Jasmine Sambac', 'Orange Blossom', 'Orris'],
    baseNotes: ['Tonka Bean', 'Cacao', 'Vanilla', 'Praline', 'Sandalwood'],
    overallRating: 4.2,
    dayNightRating: 0, // 'night' -> 0
    seasonRating: 0.2, // Winter/Autumn
    priceValueRating: 3.9,
    sillageRating: 2, // 'strong' -> 2
    longevityRating: 2, // 'long' -> 2
    similarPerfumes: [
      { id: '5', name: 'La Vie Est Belle', brand: 'Lancôme', image: require('../assets/images/decant-general.png') },
      { id: '6', name: 'Black Opium', brand: 'Yves Saint Laurent', image: require('../assets/images/decant-general.png') },
    ],
  },
];

export default function AIBoxSelectionScreen() {
  const [decantCount, setDecantCount] = useState<DecantCount>(4);
  const [decantSize, setDecantSize] = useState<DecantSize>(5);
  const [maxPricePerML, setMaxPricePerML] = useState(20000);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string | null>(null);
  // Create a ref for the modal
  const modalRef = useRef<PerfumeModalRef>(null);

  const handleMaxPriceChange = useCallback((value: number) => {
      setMaxPricePerML(Math.floor(value));
  }, []);

  const handlePerfumePress = (perfumeId: string) => {
    setSelectedPerfumeId(perfumeId);
  };

  // Callback when the modal is dismissed (by background tap, swipe, etc.)
  const handleModalDismiss = useCallback(() => {
    // Add a small delay before clearing the selected perfume ID
    // This ensures the modal is fully closed before state changes
    setTimeout(() => {
      setSelectedPerfumeId(null); // Clear the selected perfume ID
    }, 100);
  }, []);

  const handleAddToCart = () => {
    // Add to cart functionality to be implemented
    console.log('Adding to cart:', {
      decantCount,
      decantSize,
      totalPrice: calculateTotalPrice()
    });
  };

  const calculateTotalPrice = useCallback(() => {
    // Calculate total price based on selected perfumes
    const selectedPerfumes = MOCK_PERFUMES.slice(0, decantCount);
    return selectedPerfumes.reduce((total, perfume) => {
      return total + (perfume.pricePerML * decantSize);
    }, 0);
  }, [decantCount, decantSize]);

  const selectedPerfume = selectedPerfumeId
    ? MOCK_PERFUMES.find(p => p.id === selectedPerfumeId)
    : null;

  // Effect to show the modal when a perfume is selected
  useEffect(() => {
    if (selectedPerfume && modalRef.current) {
      modalRef.current.show(selectedPerfume);
    }
  }, [selectedPerfume]); // Dependency array ensures this runs when selectedPerfume changes

  return (
    <View style={[styles.container, {backgroundColor: '#e9e3db'}]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Selecciona tu Box</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Decant Selection */}
        <View style={[styles.section, styles.filterSection]}>
          <Text style={[styles.sectionTitle, styles.filterTitle]}>Cantidad de Decants</Text>
          <View style={styles.decantCountContainer}>
            <Pressable
              style={[
                styles.decantCountButton,
                decantCount === 4 && styles.decantCountButtonActive,
              ]}
              onPress={() => setDecantCount(4)}
            >
              <Text style={[
                styles.decantCountText,
                decantCount === 4 && styles.decantCountTextActive,
              ]}>4 Decants</Text>
            </Pressable>
            <Pressable
              style={[
                styles.decantCountButton,
                decantCount === 8 && styles.decantCountButtonActive,
              ]}
              onPress={() => setDecantCount(8)}
            >
              <Text style={[
                styles.decantCountText,
                decantCount === 8 && styles.decantCountTextActive,
              ]}>8 Decants</Text>
            </Pressable>
          </View>
        </View>

        {/* Size Selection */}
        <View style={[styles.section, styles.filterSection]}>
          <Text style={[styles.sectionTitle, styles.filterTitle]}>Tamaño de Decants</Text>
          <View style={styles.sizeContainer}>
            {[3, 5, 10].map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.sizeButton,
                  decantSize === size && styles.sizeButtonActive,
                ]}
                onPress={() => setDecantSize(size as DecantSize)}
              >
                <Text style={[
                  styles.sizeText,
                  decantSize === size && styles.sizeTextActive,
                ]}>{size}ml</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View style={[styles.section, styles.filterSection]}>
          <Text style={[styles.sectionTitle, styles.filterTitle]}>Rango de Precio por mL</Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceLabelsCompact}>
              <Text style={styles.priceText}>0</Text>
              <Text style={styles.priceText}>${maxPricePerML.toLocaleString()}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20000}
                step={100}
                value={maxPricePerML}
                onValueChange={handleMaxPriceChange}
                minimumTrackTintColor="#E6E6E6"
                maximumTrackTintColor="#E6E6E6"
                thumbTintColor="#809CAC"
              />
              <View
                style={[
                  styles.rangeHighlight,
                  {
                    left: `${(0 / 20000) * 100}%`,
                    right: `${100 - (maxPricePerML / 20000) * 100}%`,
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Perfumes List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfumes Seleccionados</Text>
          {MOCK_PERFUMES.slice(0, decantCount).map((perfume) => (
            <Pressable
              key={perfume.id}
              style={styles.perfumeCard}
              onPress={() => handlePerfumePress(perfume.id)}
            >
              <Image
                source={perfume.image}
                style={styles.perfumeImage}
              />
              <View style={styles.perfumeInfo}>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{perfume.matchPercentage}% AI Match</Text>
                </View>
                <Text style={styles.perfumeName}>{perfume.name}</Text>
                <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
                <Text style={styles.perfumePrice}>${perfume.pricePerML.toLocaleString()}/mL</Text>
                <Text style={styles.perfumeTotalPrice}>Total: ${(perfume.pricePerML * decantSize).toLocaleString()}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Total:</Text>
          <Text style={styles.totalPriceValue}>${calculateTotalPrice().toLocaleString()}</Text>
        </View>
        <Pressable
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartButtonText}>Añadir al carro</Text>
        </Pressable>
      </View>

      {/* Render PerfumeModal Component conditionally based on selectedPerfume */}
      {selectedPerfume && (
        <PerfumeModal
          ref={modalRef}
          perfume={selectedPerfume}
          onClose={handleModalDismiss}
        />
      )}
    </View>
  );
}

const { height } = Dimensions.get('window');
const cardHeight = height * 0.25;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  filterSection: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  decantCountContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  decantCountButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  decantCountButtonActive: {
    backgroundColor: '#809CAC',
    borderColor: '#809CAC',
    elevation: 3,
  },
  decantCountText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  decantCountTextActive: {
    color: '#FFFFFF',
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  sizeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  sizeButtonActive: {
    backgroundColor: '#809CAC',
    borderColor: '#809CAC',
    elevation: 3,
  },
  sizeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sizeTextActive: {
    color: '#FFFFFF',
  },
  priceContainer: {
    paddingHorizontal: 4,
  },
  priceLabelsCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  sliderContainer: {
    position: 'relative',
    height: 30,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 30,
    position: 'absolute',
  },
  rangeHighlight: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#809CAC',
    top: '50%',
    transform: [{ translateY: -2 }],
    borderRadius: 2,
  },
  perfumeCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    height: cardHeight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  matchBadge: {
    backgroundColor: 'rgba(128, 156, 172, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  matchText: {
    color: '#809CAC',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  perfumeImage: {
    width: cardHeight * 0.65,
    height: cardHeight * 0.65,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'contain',
  },
  perfumeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  perfumeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  perfumeBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  perfumePrice: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  perfumeTotalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#809CAC',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#809CAC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#809CAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});