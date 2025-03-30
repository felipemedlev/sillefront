import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../types/constants';

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
const priceRanges = [
  { label: '<30.000', value: '<30.000' },
  { label: '30.000-50.000', value: '30.000-50.000' },
  { label: '50.000-70.000', value: '50.000-70.000' },
  { label: '70.000-90.000', value: '70.000-90.000' },
  { label: '>90.000', value: '>90.000' },
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
  <View style={styles.filterSection}>
    <Text style={[styles.sectionTitle, styles.filterTitle]}>Rango de Precio</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.buttonsContainer}
    >
      {priceRanges.map((range) => (
        <Pressable
          key={range.value}
          style={[
            styles.rangeButton,
            // Corrected &amp;&amp; to &&
            currentRange === range.value && styles.rangeButtonActive,
          ]}
          onPress={() => setCurrentRange(range.value)}
        >
          <Text style={[
            styles.rangeButtonText,
            // Corrected &amp;&amp; to &&
            currentRange === range.value && styles.rangeButtonTextActive,
          ]}>
            {range.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
);

export default function PantallaCajaRegalo() {
  useWindowDimensions();
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero>('masculino');
  const [rangoPrecio, setRangoPrecio] = useState('50.000-70.000'); // Initial range
  const [decantCount, setDecantCount] = useState<4 | 8>(4);
  // const [decantSize, setDecantSize] = useState<3 | 5 | 10>(5); // Removed as it's not used

  // Define background colors based on selection and constants
  const colorMasculinoBg = COLORS.BACKGROUND_ALT; // Use a subtle background
  const colorFemeninoBg = '#FFF0F5'; // Example: Light Pink, consider adding to constants if used elsewhere
  const colorMasculinoActiveBg = COLORS.ACCENT; // Use accent for active male selection
  const colorFemeninoActiveBg = '#FFB6C1'; // Example: Lighter Pink for active female, consider adding to constants

  const getGeneroBgColor = (genero: Genero) => {
    if (genero === 'masculino') {
      return generoSeleccionado === 'masculino' ? colorMasculinoActiveBg : colorMasculinoBg;
    }
    return generoSeleccionado === 'femenino' ? colorFemeninoActiveBg : colorFemeninoBg;
  };

  const getGeneroTextColor = (genero: Genero) => {
    if (genero === 'masculino') {
      return generoSeleccionado === 'masculino' ? COLORS.BACKGROUND : COLORS.TEXT_PRIMARY;
    }
    return generoSeleccionado === 'femenino' ? COLORS.BACKGROUND : COLORS.TEXT_PRIMARY;
  };

  const getCardBgColor = () => (generoSeleccionado === 'masculino' ? colorMasculinoBg : colorFemeninoBg);

  // Removed formatearPrecio as it's not used in this component

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.content}>
        {/* Top Selection Row */}
        <View style={styles.topSelectionContainer}>
          {/* Selección de Género */}
          <View style={styles.generoContainer}>
            <TouchableOpacity
              style={[
              styles.generoOpcion,
              { backgroundColor: getGeneroBgColor('masculino') },
            ]}
            onPress={() => setGeneroSeleccionado('masculino')}
            activeOpacity={0.7}
          >
            <Feather name="user" size={32} color={getGeneroTextColor('masculino')} />
            <Text style={[styles.generoLabel, { color: getGeneroTextColor('masculino') }]}>Hombre</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.generoOpcion,
              { backgroundColor: getGeneroBgColor('femenino') },
            ]}
            onPress={() => setGeneroSeleccionado('femenino')}
            activeOpacity={0.7}
          >
            {/* Consider a different icon for female? */}
            <Feather name="user" size={32} color={getGeneroTextColor('femenino')} />
            <Text style={[styles.generoLabel, { color: getGeneroTextColor('femenino') }]}>Mujer</Text>
          </TouchableOpacity>
        </View>

        {/* Decant Selection */}
        <View style={styles.decantCountContainer}>
          {[4, 8].map((count) => (
            <Pressable
              key={count}
              style={[
                styles.decantCountButton,
                // Corrected &amp;&amp; to &&
                decantCount === count && styles.decantCountButtonActive,
              ]}
              onPress={() => setDecantCount(count as 4 | 8)}
            >
              <Text style={[
                styles.decantCountText,
                // Corrected &amp;&amp; to &&
                decantCount === count && styles.decantCountTextActive,
              ]}>
                {`${count} Decants`}
              </Text>
            </Pressable>
          ))}
        </View>
       </View> {/* Close topSelectionContainer */}
       {/* Price Range Selection */}
       <PriceRangeButtons
         currentRange={rangoPrecio}
         setCurrentRange={setRangoPrecio}
       />
       {/* Tarjetas de Caja Regalo */}
       <Text style={styles.sectionTitle}>Elige tu Ocasión</Text>
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
  topSelectionContainer: { // New container for side-by-side layout
    flexDirection: 'row',
    justifyContent: 'space-between', // Adjust as needed (e.g., 'flex-start')
    alignItems: 'flex-start', // Align items to the top
    marginBottom: SPACING.XLARGE, // Margin below the row
    width: '100%',
    gap: SPACING.LARGE, // Gap between gender and decant sections
  },
  generoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align gender options to the start
    // Removed marginBottom, handled by topSelectionContainer
    gap: SPACING.MEDIUM, // Reduced gap between gender options
    flex: 1, // Allow generoContainer to take available space
    width: '50%'
  },
  generoOpcion: {
    flex: 1, // Allow options to take equal space within generoContainer
    maxWidth: '100%', // Max width for each option
    alignItems: 'center',
    paddingVertical: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    transitionProperty: 'background-color', // Smooth transition
    transitionDuration: '0.3s',
  },
  generoLabel: {
    marginTop: SPACING.SMALL,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600', // Use string for fontWeight
  },
  decantCountContainer: {
    flexDirection: 'column', // Stack buttons vertically
    // justifyContent: 'flex-start', // Align buttons to the top of the column
    alignItems: 'stretch', // Stretch buttons to fill container width if needed, or 'flex-start'
    gap: SPACING.SMALL, // Vertical gap between buttons
    // Removed marginBottom, handled by topSelectionContainer
    // Removed width: '100%', let it size based on content or flex properties
    // Removed alignSelf, alignment handled by topSelectionContainer
  },
  decantCountButton: {
    paddingVertical: SPACING.SMALL, // Adjusted padding
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: 20, // More rounded buttons
    backgroundColor: COLORS.BACKGROUND_ALT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
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
    fontWeight: '600', // Use string for fontWeight
  },
  filterSection: {
    marginBottom: SPACING.XLARGE, // Consistent margin
    width: '100%', // Ensure section takes full width
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LARGE, // Use constant
    fontWeight: '600', // Use string for fontWeight
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
    gap: SPACING.SMALL, // Consistent gap
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
    fontWeight: '600', // Use string for fontWeight
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
    flexBasis: '45%', // Adjust basis for better wrapping on different screens
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
    fontWeight: '600', // Use string for fontWeight
    color: COLORS.TEXT_PRIMARY,
  },
  cardDescription: {
    fontSize: FONT_SIZES.SMALL, // Adjusted size
    color: COLORS.TEXT_SECONDARY,
    lineHeight: FONT_SIZES.SMALL * 1.4, // Improve readability
  },
});