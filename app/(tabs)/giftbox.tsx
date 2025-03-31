import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  Platform, // Import Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../types/constants'; // Assuming these constants provide a good base

type Genero = 'masculino' | 'femenino';

interface PriceRangeButtonsProps {
  currentRange: string;
  setCurrentRange: (range: string) => void;
}

interface TarjetaCajaRegalo {
  id: string;
  titulo: string;
  descripcion: string;
  icono: keyof typeof Feather.glyphMap;
}

// Corrected < and > symbols
// Temporarily removing periods from labels for debugging the text node error
const priceRanges = [
  { label: '<30k', value: '<30.000' }, // Keep value same, change label
  { label: '30k-50k', value: '30.000-50.000' },
  { label: '50k-70k', value: '50.000-70.000' },
  { label: '70k-90k', value: '70.000-90.000' },
  { label: '>90k', value: '>90.000' },
];

const cajasRegalo: TarjetaCajaRegalo[] = [
  {
    id: '1',
    titulo: 'Uso Casual',
    descripcion: 'Perfecto para ocasiones cotidianas',
    icono: 'sun',
  },
  {
    id: '2',
    titulo: 'Uso Formal',
    descripcion: 'Fragancias elegantes para momentos especiales',
    icono: 'briefcase',
  },
  {
    id: '3',
    titulo: 'Uso Nocturno',
    descripcion: 'Fragancias sofisticadas para eventos nocturnos',
    icono: 'moon',
  },
  {
    id: '4',
    titulo: 'Ocasión Especial',
    descripcion: 'Fragancias de lujo para momentos memorables',
    icono: 'star',
  },
];

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
  const [rangoPrecio, setRangoPrecio] = useState('30.000-50.000'); // Initial range
  const [decantCount, setDecantCount] = useState<4 | 8>(4);
  // const [decantSize, setDecantSize] = useState<3 | 5 | 10>(5); // Removed as it's not used

  // Define background colors based on selection and constants
  const colorMasculinoBg = COLORS.BACKGROUND_ALT; // Use a subtle background
  const colorFemeninoBg = COLORS.BACKGROUND_ALT; // Example: Light Pink, consider adding to constants if used elsewhere
  const colorMasculinoActiveBg = '#d3dde3'; // Use accent for active male selection
  const colorFemeninoActiveBg = '#e3c8d9'; // Example: Lighter Pink for active female, consider adding to constants

  const getGeneroBgColor = (genero: Genero) => {
    if (genero === 'masculino') {
      return generoSeleccionado === 'masculino' ? colorMasculinoActiveBg : colorMasculinoBg;
    }
    return generoSeleccionado === 'femenino' ? colorFemeninoActiveBg : colorFemeninoBg;
  };

  const getCardBgColor = () => (generoSeleccionado === 'masculino' ? colorMasculinoActiveBg : colorFemeninoActiveBg);

  // Removed formatearPrecio as it's not used in this component

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
                styles.generoOpcion, // Base style with marginRight
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
       {/* Tarjetas de Caja Regalo */}
<View style={styles.cardsContainer}>
          {cajasRegalo.map((caja) => (
            <TouchableOpacity
              key={caja.id}
              style={[styles.card, { backgroundColor: getCardBgColor() }]}
              activeOpacity={0.8}
              // Add onPress handler if these cards are interactive
            >
              <View style={styles.cardIconContainer}>
                <Feather name={caja.icono} size={32} color={COLORS.TEXT_PRIMARY} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{caja.titulo}</Text>
                <Text style={styles.cardDescription}>{caja.descripcion}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
});