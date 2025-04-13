import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SPACING, FONT_SIZES, COLORS } from '../../types/constants';
import PredefinedBoxModal from '@/components/product/PredefinedBoxModal';
import { getPredefinedBoxes, ApiPredefinedBox } from '../../src/services/api';
import GenderSelector, { type Genero } from '@/components/product/GenderSelector';
import DecantSelector from '@/components/product/DecantSelector';
import PriceRangeButtons from '@/components/product/PriceRangeButtons';
import BoxCard from '@/components/product/BoxCard';

// Price range options
const priceRanges = [
  { label: '<20k', value: '<20.000' },
  { label: '20k-30k', value: '20.000-30.000' },
  { label: '30k-40k', value: '30.000-40.000' },
  { label: '40k-50k', value: '40.000-50.000' },
  { label: '>50k', value: '>50.000' },
];

export default function PantallaCajaRegalo() {
  useWindowDimensions();
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero>('masculino');
  const [rangoPrecio, setRangoPrecio] = useState('20.000-30.000');
  const [decantCount, setDecantCount] = useState<4 | 8>(4);
  // State for fetched data
  const [allBoxes, setAllBoxes] = useState<ApiPredefinedBox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBox, setSelectedBox] = useState<ApiPredefinedBox | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const loadBoxes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedBoxes = await getPredefinedBoxes(generoSeleccionado);
        setAllBoxes(fetchedBoxes);
      } catch (err: any) {
        console.error("Error fetching predefined boxes:", err);
        setError(err.message || 'Failed to load boxes.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBoxes();
  }, [generoSeleccionado]);

  const getGenderColors = (gender: 'masculino' | 'femenino') => {
    return gender === 'masculino' ? COLORS.GIFTBOX.MALE : COLORS.GIFTBOX.FEMALE;
  };

  const handleBoxPress = (box: ApiPredefinedBox) => {
    setSelectedBox(box);
    setIsModalVisible(true);
  };

  // Helper function to calculate the price of a predefined box based on decant count
  const calculateBoxPrice = (box: ApiPredefinedBox, count: 4 | 8): number => {
    const perfumesToConsider = box.perfumes.slice(0, count);
    let totalPrice = 0;
    perfumesToConsider.forEach(perfume => {
      totalPrice += (perfume.pricePerML ?? 0) * 5; // Fixed 5mL size
    });
    return totalPrice;
  };

  // Helper function to parse the price range string
  const parsePriceRange = (rangeString: string): { min: number; max: number } => {
    const cleanedString = rangeString.replace(/\./g, ''); // Remove dots for parsing
    if (cleanedString.startsWith('<')) {
      return { min: 0, max: parseInt(cleanedString.substring(1), 10) };
    }
    if (cleanedString.startsWith('>')) {
      return { min: parseInt(cleanedString.substring(1), 10), max: Infinity };
    }
    const parts = cleanedString.split('-');
    if (parts.length === 2) {
      return { min: parseInt(parts[0], 10), max: parseInt(parts[1], 10) };
    }
    return { min: 0, max: Infinity }; // Default fallback
  };

  // Memoize the filtered boxes based on gender, price range, and decant count
  const filteredBoxes = useMemo(() => {
    const { min: minPrice, max: maxPrice } = parsePriceRange(rangoPrecio);

    if (!Array.isArray(allBoxes)) {
      console.warn('allBoxes is not an array in useMemo filter:', allBoxes);
      return [];
    }
    return allBoxes.filter(box => {
      const boxPrice = calculateBoxPrice(box, decantCount);
      return boxPrice >= minPrice && boxPrice <= maxPrice;
    });
  }, [allBoxes, rangoPrecio, decantCount]);

  const currentGenderColors = getGenderColors(generoSeleccionado);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Cajas de Regalo</Text>
        <Text style={styles.pageSubtitle}>Selecciona tu caja ideal según tus preferencias</Text>

        {/* Gender Selection */}
        <GenderSelector
          selectedGender={generoSeleccionado}
          onSelectGender={setGeneroSeleccionado}
        />

        {/* Decant Selection */}
        <Text style={styles.sectionTitle}>Tamaño de Muestra</Text>
        <DecantSelector
          decantCount={decantCount}
          onSelectDecant={setDecantCount}
          genderColors={currentGenderColors}
        />

        <View style={styles.filtersContainer}>
          {/* Price Range Selection */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Rango de Precio</Text>
            <PriceRangeButtons
              currentRange={rangoPrecio}
              setCurrentRange={setRangoPrecio}
              genderColors={currentGenderColors}
            />
          </View>
        </View>

        {/* Results Display */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.ACCENT} style={{ marginTop: SPACING.MEDIUM }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.cardsContainer}>
            {filteredBoxes.length === 0 && !isLoading && (
              <Text style={styles.noResultsText}>No se encontraron cajas con estos filtros.</Text>
            )}
            {filteredBoxes.map((box) => {
              const genderColors = getGenderColors(box.gender || generoSeleccionado);
              return (
                <BoxCard
                  key={box.id}
                  box={box}
                  genderColors={genderColors}
                  decantCount={decantCount}
                  onPress={() => handleBoxPress(box)}
                  calculatePrice={calculateBoxPrice}
                />
              );
            })}
          </View>
        )}
      </View>

      {/* Predefined Box Modal */}
      {selectedBox && (
        <PredefinedBoxModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          boxData={selectedBox}
          decantCount={decantCount}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GIFTBOX.BACKGROUND_ALT,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.LARGE,
  },
  content: {
    paddingHorizontal: SPACING.LARGE,
    paddingTop: SPACING.LARGE,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  pageTitle: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: '800',
    color: COLORS.GIFTBOX.TEXT_PRIMARY,
    marginBottom: SPACING.XSMALL,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.GIFTBOX.TEXT_SECONDARY,
    marginBottom: SPACING.LARGE,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.SMALL,
    width: '100%',
  },
  filterSection: {
    width: '48%',
    minWidth: 140,
    marginBottom: SPACING.SMALL,
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
    color: COLORS.GIFTBOX.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
    textAlign: 'center',
    marginTop: SPACING.SMALL,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MEDIUM,
    marginTop: SPACING.MEDIUM,
    justifyContent: 'center',
    width: '100%',
  },
  errorText: {
    marginTop: SPACING.MEDIUM,
    color: COLORS.GIFTBOX.ERROR,
    textAlign: 'center',
    fontSize: FONT_SIZES.REGULAR,
  },
  noResultsText: {
    marginTop: SPACING.MEDIUM,
    color: COLORS.GIFTBOX.TEXT_SECONDARY,
    textAlign: 'center',
    fontSize: FONT_SIZES.REGULAR,
    width: '100%',
  },
});