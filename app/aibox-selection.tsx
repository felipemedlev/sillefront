import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import PerfumeModal, { PerfumeModalRef } from '../components/product/PerfumeModal';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ImageSourcePropType, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Perfume } from '../types/perfume';

type DecantCount = 4 | 8;
type DecantSize = 3 | 5 | 10;

// Simplified info for similar perfumes list (matching PerfumeModal)
interface BasicPerfumeInfo {
  id: string;
  name: string;
  brand: string;
  thumbnailUrl: string;
  fullSizeUrl: string;
}

// Mock data - updated with numerical ratings
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
    similarPerfumes: [
      '31861', // Sauvage
      '410', // Acqua di Gio
    ],
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
    similarPerfumes: [
      '485', // Light Blue
      '9099', // Bleu de Chanel
    ],
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
    similarPerfumes: [
      '9099', // Bleu de Chanel
    ],
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
    similarPerfumes: [
      '410', // Acqua di Gio
    ],
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
    similarPerfumes: [
      '25324', // Black Opium
      '39681', // Good Girl
    ],
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
    similarPerfumes: [
      '14982', // La Vie Est Belle
      '39681', // Good Girl
    ],
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
    similarPerfumes: [], // No similar ones in this mock list
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
    similarPerfumes: [
      '14982', // La Vie Est Belle
      '25324', // Black Opium
    ],
  },
];

export default function AIBoxSelectionScreen() {
  const [decantCount, setDecantCount] = useState<DecantCount>(4);
  const [decantSize, setDecantSize] = useState<DecantSize>(5);
  const [rangoPrecio, setRangoPrecio] = useState([0, 10000]);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string | null>(null);
  const [swappingPerfumeId, setSwappingPerfumeId] = useState<string | null>(null);
  const [selectedPerfumes, setSelectedPerfumes] = useState<string[]>([]);
  const modalRef = useRef<PerfumeModalRef>(null);
  const sliderContainerRef = useRef<View>(null);
  const [isSliderReady, setIsSliderReady] = useState(false);

  // Initialize selected perfumes when component mounts
  useEffect(() => {
    const filteredPerfumes = MOCK_PERFUMES.filter(perfume =>
      (perfume.pricePerML ?? 0) >= rangoPrecio[0] &&
      (perfume.pricePerML ?? 0) <= rangoPrecio[1]
    );
    setSelectedPerfumes(filteredPerfumes.slice(0, decantCount).map(p => p.id));
  }, [decantCount, rangoPrecio]);

  // Add effect to handle slider container mounting
  useEffect(() => {
    if (sliderContainerRef.current) {
      setIsSliderReady(true);
    }
  }, []);

  const handleMaxPriceChange = useCallback((values: number[]) => {
    setRangoPrecio(values);
  }, []);

  const handlePerfumePress = (perfumeId: string) => {
    setSelectedPerfumeId(perfumeId);
  };

  const handleSwapPress = (perfumeId: string) => {
    setSwappingPerfumeId(perfumeId);
    setSelectedPerfumeId(perfumeId);
  };

  const handleSimilarPerfumeSelect = (newPerfumeId: string) => {
    if (swappingPerfumeId) {
      // Replace the old perfume with the new one in the selected perfumes array
      setSelectedPerfumes(prev =>
        prev.map(id => id === swappingPerfumeId ? newPerfumeId : id)
      );
      // Close the modal
      modalRef.current?.hide();
    }
  };

  // Callback when the modal is dismissed (by background tap, swipe, etc.)
  const handleModalDismiss = useCallback(() => {
    // Add a small delay before clearing the selected perfume ID
    // This ensures the modal is fully closed before state changes
    setTimeout(() => {
      setSelectedPerfumeId(null);
      setSwappingPerfumeId(null);
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
    return selectedPerfumes.reduce((total, perfumeId) => {
      const perfume = MOCK_PERFUMES.find(p => p.id === perfumeId);
      return total + (perfume?.pricePerML || 0) * decantSize;
    }, 0);
  }, [decantCount, decantSize, selectedPerfumes]);

  // Filter perfumes by price range
  const filteredPerfumes = useMemo(() => {
    return MOCK_PERFUMES.filter(perfume =>
      (perfume.pricePerML ?? 0) >= rangoPrecio[0] &&
      (perfume.pricePerML ?? 0) <= rangoPrecio[1]
    );
  }, [rangoPrecio]);

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
    <View style={[styles.container, {backgroundColor: '#F5F5F7'}]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Selecciona tu Box</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
              <Text style={styles.priceText}>${rangoPrecio[0].toLocaleString()}</Text>
              <Text style={styles.priceText}>${rangoPrecio[1].toLocaleString()}</Text>
            </View>
            <View ref={sliderContainerRef} style={styles.sliderContainer}>
              {isSliderReady && (
                <MultiSlider
                  values={rangoPrecio}
                  min={0}
                  max={20000}
                  step={100}
                  onValuesChange={handleMaxPriceChange}
                  sliderLength={Dimensions.get('window').width - 80}
                  selectedStyle={{
                    backgroundColor: '#809CAC',
                    height: 4,
                  }}
                  unselectedStyle={{
                    backgroundColor: '#E6E6E6',
                    height: 4,
                  }}
                  containerStyle={styles.slider}
                />
              )}
            </View>
          </View>
        </View>

        {/* Perfumes List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfumes Seleccionados</Text>
          {selectedPerfumes.map((perfumeId) => {
            const perfume = MOCK_PERFUMES.find(p => p.id === perfumeId);
            if (!perfume) return null;

            return (
              <Pressable
                key={perfume.id}
                style={styles.perfumeCard}
                onPress={() => handlePerfumePress(perfume.id)}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: perfume.thumbnailUrl }}
                    style={styles.perfumeImage}
                  />
                  <Image
                    source={require('../assets/images/decant-general.png')}
                    style={styles.decantIcon}
                  />
                </View>
                <View style={styles.perfumeInfo}>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{perfume.matchPercentage}% AI Match</Text>
                  </View>
                  <Text style={styles.perfumeName}>{perfume.name}</Text>
                  <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
                  <Text style={styles.perfumePrice}>${(perfume.pricePerML ?? 0).toLocaleString()}/mL</Text>
                  <Text style={styles.perfumeTotalPrice}>Total: ${((perfume.pricePerML ?? 0) * decantSize).toLocaleString()}</Text>
                  <Pressable
                    style={styles.swapButton}
                    onPress={() => handleSwapPress(perfume.id)}
                  >
                    <Text style={styles.swapButtonText}>Cambiar</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
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
          isSwapping={!!swappingPerfumeId}
          onSimilarPerfumeSelect={handleSimilarPerfumeSelect}
        />
      )}
    </View>
  );
}

const { height } = Dimensions.get('window');
const cardHeight = height * 0.3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
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
  contentContainer: {
    paddingBottom: 20,
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
    padding: 20,
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
  imageContainer: {
    position: 'relative',
    marginRight: 30,
  },
  decantIcon: {
    position: 'absolute',
    right: -10,
    bottom: '0%',
    width: 30,
    height: 70,
    resizeMode: 'contain',
  },
  matchBadge: {
    backgroundColor: '#809CAC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  perfumeImage: {
    width: cardHeight * 0.55,
    height: cardHeight * 0.55,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  perfumeInfo: {
    flex: 1,
  },
  perfumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  perfumeBrand: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  perfumePrice: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    marginBottom: 6,
  },
  perfumeTotalPrice: {
    fontSize: 17,
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
    backgroundColor: '#222222',
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
  swapButton: {
    backgroundColor: '#F5F5F7',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  swapButtonText: {
    color: '#809CAC',
    fontSize: 14,
    fontWeight: '600',
  },
});