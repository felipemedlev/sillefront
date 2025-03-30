import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import PerfumeModal, { PerfumeModalRef } from '../components/product/PerfumeModal';
import { Perfume } from '../types/perfume';
import DecantSelector from '../components/product/DecantSelector';
import PriceRangeSlider from '../components/product/PriceRangeSlider';
import PerfumeList from '../components/product/PerfumeList';
import BottomBar from '../components/product/BottomBar';

// Move MOCK_PERFUMES to this file since it was causing circular dependency
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
  },
];

type DecantCount = 4 | 8;
type DecantSize = 3 | 5 | 10;

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
});

export default function AIBoxSelectionScreen() {
  const [decantCount, setDecantCount] = useState<DecantCount>(4);
  const [decantSize, setDecantSize] = useState<DecantSize>(5);
  const [rangoPrecio, setRangoPrecio] = useState<[number, number]>([500, 10000]);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string | null>(null);
  const [swappingPerfumeId, setSwappingPerfumeId] = useState<string | null>(null);
  const [selectedPerfumes, setSelectedPerfumes] = useState<string[]>([]);
  const modalRef = useRef<PerfumeModalRef>(null);
  const sliderContainerRef = useRef<View>(null);

  // Initialize selected perfumes when component mounts or when decantCount/rangoPrecio changes
  useEffect(() => {
    const filteredPerfumes = MOCK_PERFUMES.filter((perfume: Perfume) =>
      (perfume.pricePerML ?? 0) >= rangoPrecio[0] &&
      (perfume.pricePerML ?? 0) <= rangoPrecio[1]
    );

    // Always set the selected perfumes to the first N perfumes that match the price range
    setSelectedPerfumes(filteredPerfumes.slice(0, decantCount).map(p => p.id));
  }, [decantCount, rangoPrecio]);

  const handleMaxPriceChange = useCallback((values: number[]) => {
    setRangoPrecio(values as [number, number]);
  }, []);

  const handlePerfumePress = useCallback((perfumeId: string) => {
    setSelectedPerfumeId(perfumeId);
  }, []);

  const handleSwapPress = useCallback((perfumeId: string) => {
    setSwappingPerfumeId(perfumeId);
    setSelectedPerfumeId(perfumeId);
  }, []);

  const handleSimilarPerfumeSelect = useCallback((newPerfumeId: string) => {
    if (swappingPerfumeId) {
      setSelectedPerfumes(prev =>
        prev.map(id => id === swappingPerfumeId ? newPerfumeId : id)
      );
      modalRef.current?.hide();
    }
  }, [swappingPerfumeId]);

  const handleModalDismiss = useCallback(() => {
    setTimeout(() => {
      setSelectedPerfumeId(null);
      setSwappingPerfumeId(null);
    }, 100);
  }, []);

  const calculateTotalPrice = useCallback(() => {
    return selectedPerfumes.reduce((total, perfumeId) => {
      const perfume = MOCK_PERFUMES.find(p => p.id === perfumeId);
      return total + (perfume?.pricePerML || 0) * decantSize;
    }, 0);
  }, [decantSize, selectedPerfumes]);

  const handleAddToCart = useCallback(() => {
    console.log('Adding to cart:', {
      decantCount,
      decantSize,
      totalPrice: calculateTotalPrice()
    });
  }, [decantCount, decantSize, calculateTotalPrice]);


  const selectedPerfume = useMemo(() => {
    return selectedPerfumeId
      ? MOCK_PERFUMES.find((p: Perfume) => p.id === selectedPerfumeId)
      : null;
  }, [selectedPerfumeId]);

  useEffect(() => {
    if (selectedPerfume && modalRef.current) {
      modalRef.current.show(selectedPerfume);
    }
  }, [selectedPerfume]);

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
        <DecantSelector
          decantCount={decantCount}
          setDecantCount={setDecantCount}
          decantSize={decantSize}
          setDecantSize={setDecantSize}
        />

        <PriceRangeSlider
          range={rangoPrecio}
          onRangeChange={handleMaxPriceChange}
          sliderContainerRef={sliderContainerRef}
        />

        <PerfumeList
          selectedPerfumes={selectedPerfumes}
          onPerfumePress={handlePerfumePress}
          onSwapPress={handleSwapPress}
          decantSize={decantSize}
          perfumes={MOCK_PERFUMES}
        />
      </ScrollView>

      <BottomBar
        totalPrice={calculateTotalPrice()}
        onAddToCart={handleAddToCart}
      />

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