import React, { useState, useMemo, useEffect } from 'react'; // Import useEffect
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator, // Add ActivityIndicator for loading state
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../types/constants'; // Assuming these constants provide a good base
// Remove mock data imports
// import { PREDEFINED_BOXES, PredefinedBox } from '../../data/predefinedBoxes';
// import { MOCK_PERFUMES } from '../../data/mockPerfumes';
import PredefinedBoxModal from '@/components/product/PredefinedBoxModal';
import { getPredefinedBoxes, ApiPredefinedBox } from '../../src/services/api'; // Import API function and type

type Genero = 'masculino' | 'femenino';

interface PriceRangeButtonsProps {
  currentRange: string;
  setCurrentRange: (range: string) => void;
}

// Removed TarjetaCajaRegalo interface

// Corrected < and > symbols
// Temporarily removing periods from labels for debugging the text node error
const priceRanges = [
  { label: '<20k', value: '<20.000' },
  { label: '20k-30k', value: '20.000-30.000' },
  { label: '30k-40k', value: '30.000-40.000' },
  { label: '40k-50k', value: '40.000-50.000' },
  { label: '>50k', value: '>50.000' },
];

// Removed old cajasRegalo array

// Extracted PriceRangeButtons component for better structure
const PriceRangeButtons: React.FC<PriceRangeButtonsProps> = ({
  currentRange,
  setCurrentRange,
}) => (
  // Removed wrapping View and Title - Rendered directly in parent now
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.buttonsContainer}
    >
      {priceRanges.map((range, index, arr) => (
        <TouchableOpacity
          key={range.value}
          style={[
            styles.rangeButton, // Base style with marginRight
            currentRange === range.value && styles.rangeButtonActive,
            index === arr.length - 1 && styles.rangeButtonLast // Remove margin for last item
          ]}
          onPress={() => setCurrentRange(range.value)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.rangeButtonText,
            currentRange === range.value && styles.rangeButtonTextActive,
          ]}>
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
);

export default function PantallaCajaRegalo() {
  useWindowDimensions();
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero>('masculino');
  const [rangoPrecio, setRangoPrecio] = useState('20.000-30.000'); // Update initial range to a valid new one
  const [decantCount, setDecantCount] = useState<4 | 8>(4);
  // State for fetched data
  const [allBoxes, setAllBoxes] = useState<ApiPredefinedBox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBox, setSelectedBox] = useState<ApiPredefinedBox | null>(null); // Use ApiPredefinedBox type

  // Define background colors based on selection and constants
  const colorMasculinoBg = COLORS.BACKGROUND_ALT; // Use a subtle background
  const colorFemeninoBg = COLORS.BACKGROUND_ALT; // Example: Light Pink, consider adding to constants if used elsewhere
  const colorMasculinoActiveBg = '#d3dde3'; // Use accent for active male selection
  const colorFemeninoActiveBg = '#e3c8d9'; // Example: Lighter Pink for active female, consider adding to constants
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
}, [generoSeleccionado]); // Re-fetch when gender changes

const getGeneroBgColor = (genero: Genero) => {
  if (genero === 'masculino') {
    return generoSeleccionado === 'masculino' ? colorMasculinoActiveBg : colorMasculinoBg;
  }
  return generoSeleccionado === 'femenino' ? colorFemeninoActiveBg : colorFemeninoBg;
};

const getCardBgColor = (boxGender: 'masculino' | 'femenino' | null) => {
    // Fallback to a default or selected gender color if box gender is null
    const selectedBg = generoSeleccionado === 'masculino' ? colorMasculinoActiveBg : colorFemeninoActiveBg;
    if (!boxGender) return selectedBg; // Or return COLORS.BACKGROUND_ALT for neutral?
    return boxGender === 'masculino' ? colorMasculinoActiveBg : colorFemeninoActiveBg;
};
  // Removed duplicate function: const getCardBgColor = () => (generoSeleccionado === 'masculino' ? colorMasculinoActiveBg : colorFemeninoActiveBg);

  // Handler for pressing a predefined box card
  const handleBoxPress = (box: ApiPredefinedBox) => { // Use ApiPredefinedBox type
    setSelectedBox(box);
    setIsModalVisible(true);
  };

  // Removed formatearPrecio as it's not used in this component

  // Helper function to calculate the price of a predefined box based on decant count
  const calculateBoxPrice = (box: ApiPredefinedBox, count: 4 | 8): number => { // Use ApiPredefinedBox type
    // Use the fetched perfumes array directly
    const perfumesToConsider = box.perfumes.slice(0, count);
    let totalPrice = 0;
    perfumesToConsider.forEach(perfume => {
      // Use pricePerML from the fetched perfume data
      totalPrice += (perfume.pricePerML ?? 0) * 5; // Fixed 5mL size
    });
    return totalPrice;
  };

  // Helper function to parse the price range string (e.g., "<30.000", "30.000-50.000", ">90.000")
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

    // Filter the fetched boxes based on price range
    // Gender filtering is now done by the API
    // Add safety check for allBoxes being an array
    if (!Array.isArray(allBoxes)) {
        console.warn('allBoxes is not an array in useMemo filter:', allBoxes);
        return []; // Return empty array if not an array to prevent crash
    }
    return allBoxes.filter(box => {
      // Calculate box price based on current decant count using fetched data
      const boxPrice = calculateBoxPrice(box, decantCount);
      // Filter by price range
      return boxPrice >= minPrice && boxPrice <= maxPrice;
    });
  }, [allBoxes, rangoPrecio, decantCount]); // Dependencies include fetched boxes

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.content}>
        {/* Top Selection Row - Temporarily commented out for vertical layout debugging */}
        {/* <View style={styles.topSelectionContainer}> */}
          {/* Selección de Género - Now stacks vertically */}
          <View style={styles.generoContainer}>
            {/* Apply marginRight conditionally or use specific styles */}
            <TouchableOpacity
              style={[
                styles.generoOpcion,
                { backgroundColor: getGeneroBgColor('masculino') },
              ]}
              onPress={() => setGeneroSeleccionado('masculino')}
              activeOpacity={0.7}
            >
              <Feather name="user" size={32} color={COLORS.TEXT_PRIMARY} />
              <Text style={[styles.generoLabel, { color: COLORS.TEXT_PRIMARY }]}>Hombre</Text>
            </TouchableOpacity>

          {/* Apply last item style to remove margin */}
          <TouchableOpacity
            style={[
              styles.generoOpcion,
              styles.generoOpcionLast, // Override marginRight
              { backgroundColor: getGeneroBgColor('femenino') },
            ]}
            onPress={() => setGeneroSeleccionado('femenino')}
            activeOpacity={0.7}
          >
            <Feather name="user" size={32} color={COLORS.TEXT_PRIMARY} />
            <Text style={[styles.generoLabel, { color: COLORS.TEXT_PRIMARY }]}>Mujer</Text>
          </TouchableOpacity>
        </View>

        {/* Decant Selection */}
        <View style={styles.decantCountContainer}>
          {/* Reverted mapping logic as gap handles spacing */}
          {[4, 8].map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.decantCountButton,
                decantCount === count && styles.decantCountButtonActive,
              ]}
              onPress={() => setDecantCount(count as 4 | 8)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.decantCountText,
                decantCount === count && styles.decantCountTextActive,
              ]}>
                {`${count} Decants`}
              </Text>
            </TouchableOpacity>
          ))}
        </View> {/* Close decantCountContainer */}
        {/* </View> */} {/* Close temporary comment out of topSelectionContainer */}
       {/* Price Range Selection - Render directly */}
       <Text style={[styles.sectionTitle, styles.filterTitle]}>Rango de Precio</Text> {/* Moved title out */}
       <PriceRangeButtons currentRange={rangoPrecio} setCurrentRange={setRangoPrecio} /> {/* Pass props, but component now only renders ScrollView */}
        {/* Tarjetas de Caja Regalo - Updated */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.ACCENT} style={{ marginTop: SPACING.XLARGE }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.cardsContainer}>
            {filteredBoxes.length === 0 && !isLoading && (
                 <Text style={styles.noResultsText}>No se encontraron cajas con estos filtros.</Text>
            )}
            {filteredBoxes.map((box) => ( // Map over the memoized filteredBoxes
                <TouchableOpacity
                  key={box.id} // Use box.id
                  style={[styles.card, { backgroundColor: getCardBgColor(box.gender) }]} // Pass box gender
                  activeOpacity={0.8}
                  onPress={() => handleBoxPress(box)} // Add onPress handler
                >
                  <View style={styles.cardIconContainer}>
                    {/* Use box.icon, provide default */}
                    {/* Cast icon name to expected type */}
                    <Feather name={(box.icon || 'gift') as keyof typeof Feather.glyphMap} size={32} color={COLORS.TEXT_PRIMARY} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{box.title}</Text> {/* Use box.title */}
                    <Text style={styles.cardDescription}>{box.description}</Text> {/* Use box.description */}
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>


      {/* Predefined Box Modal */}
      {selectedBox && (
        <PredefinedBoxModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          boxData={selectedBox} // Type is now ApiPredefinedBox | null
          decantCount={decantCount}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.LARGE, // Ensure space at the bottom
  },
  content: {
    paddingHorizontal: SPACING.LARGE,
    paddingTop: SPACING.LARGE,
    maxWidth: 1200, // Keep max width for larger screens
    marginHorizontal: 'auto',
    width: '100%', // Ensure content takes full width within constraints
  },
  // topSelectionContainer: { // Temporarily commented out for vertical layout debugging
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'flex-start',
  //   marginBottom: SPACING.XLARGE,
  //   width: '100%',
  // },
  generoContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center options now that it's full width
    marginBottom: SPACING.XLARGE, // Add margin below since top container is gone
    // gap: SPACING.MEDIUM, // Replaced with margin on child
    // flex: 1, // No longer needed in vertical stack
    width: '100%', // Take full width now
    // marginRight: SPACING.LARGE // No longer needed
  },
  generoOpcion: {
    flex: 1, // Allow options to take equal space within generoContainer
    // maxWidth: '48%', // Let flex handle width distribution - Removing duplicate flex below
    alignItems: 'center',
    paddingVertical: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    // Add margin to the first item to replace gap in generoContainer
    // This needs to be applied conditionally or target the first child,
    // applying marginRight to all might be simpler for now.
    marginRight: SPACING.XLARGE,
  },
  generoOpcionLast: { // Style for the last item to remove extra margin
    marginRight: 0,
  },
  generoLabel: {
    marginTop: SPACING.SMALL,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: 'bold', // Use standard string value
  },
  decantCountContainer: {
    flexDirection: 'row', // Keep buttons horizontal
    justifyContent: 'center', // Center the buttons
    alignItems: 'center',
    gap: SPACING.MEDIUM, // Use gap for simplicity
    marginBottom: SPACING.XLARGE, // Add margin below
    width: '100%',
  },
  decantCountButton: {
    paddingVertical: SPACING.SMALL, // Adjusted padding
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND_ALT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    // marginBottom: SPACING.SMALL, // Removed, using gap
  },
  // decantCountButtonLast: { // Removed, using gap
  //   marginBottom: 0,
  // },
  decantCountButtonActive: {
    backgroundColor: COLORS.ACCENT,
    borderColor: COLORS.ACCENT,
  },
  decantCountText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500', // Use string for fontWeight
  },
  decantCountTextActive: {
    color: COLORS.BACKGROUND, // White text on active button
    fontWeight: 'bold', // Use standard string value
  },
  filterSection: {
    marginBottom: SPACING.XLARGE, // Consistent margin
    width: '100%', // Ensure section takes full width
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LARGE, // Use constant
    fontWeight: 'bold', // Use standard string value
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM, // Consistent margin
    textAlign: 'center', // Center section titles
  },
  filterTitle: {
    fontSize: FONT_SIZES.REGULAR, // Smaller title for filters
    marginBottom: SPACING.SMALL,
    textAlign: 'left', // Align filter title left
  },
  buttonsContainer: {
    // gap: SPACING.SMALL, // Replaced with margin on child
    paddingVertical: SPACING.XSMALL, // Add some vertical padding
    // Removed paddingLeft, let ScrollView handle alignment
  },
  rangeButton: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20, // Rounded buttons
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND_ALT,
    marginRight: SPACING.SMALL, // Added margin to replace gap
    marginBottom: SPACING.LARGE,
  },
  rangeButtonLast: { // Style for the last item to remove extra margin
     marginRight: 0,
  },
  rangeButtonActive: {
    backgroundColor: COLORS.ACCENT,
    borderColor: COLORS.ACCENT,
    // elevation: 2, // Subtle elevation if needed
  },
  rangeButtonText: {
    fontSize: FONT_SIZES.SMALL, // Use constant
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500', // Use string for fontWeight
  },
  rangeButtonTextActive: {
    color: COLORS.BACKGROUND, // White text
    fontWeight: 'bold', // Use standard string value
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MEDIUM,
    marginTop: SPACING.SMALL, // Reduced margin after title
    justifyContent: 'center', // Center cards horizontally
    width: '100%',
    marginBottom: 40, // Align to the left
  },
  card: {
    flexBasis: '100%', // Adjust basis for better wrapping on different screens
    flexGrow: 1, // Allow cards to grow
    maxWidth: 300, // Max width per card
    padding: SPACING.LARGE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    // Removed shadow for consistency, add back if preferred
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 2,
    alignItems: 'center', // Center content within the card
    textAlign: 'center', // Center text within the card
  },
  cardIconContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  cardContent: {
    gap: SPACING.XSMALL, // Reduced gap in card content
    alignItems: 'center', // Ensure content inside is centered
  },
  cardTitle: {
    fontSize: FONT_SIZES.REGULAR, // Adjusted size
    fontWeight: 'bold', // Use standard string value
    color: COLORS.TEXT_PRIMARY,
  },
  cardDescription: {
    fontSize: FONT_SIZES.SMALL, // Adjusted size
    color: COLORS.TEXT_SECONDARY,
    lineHeight: FONT_SIZES.SMALL * 1.4, // Improve readability
  },
  errorText: {
      marginTop: SPACING.LARGE,
      color: COLORS.ERROR,
      textAlign: 'center',
      fontSize: FONT_SIZES.REGULAR,
  },
  noResultsText: {
      marginTop: SPACING.LARGE,
      color: COLORS.TEXT_SECONDARY,
      textAlign: 'center',
      fontSize: FONT_SIZES.REGULAR,
      width: '100%', // Ensure it takes full width for centering
  },
});