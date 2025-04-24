import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable, // Import Pressable
} from 'react-native';
import { SPACING, FONT_SIZES, COLORS } from '../../types/constants';

interface DecantSelectorProps {
  decantCount: 4 | 8;
  onSelectDecant: (count: 4 | 8) => void;
  decantSize?: 3 | 5 | 10;
  onDecantSize?: (size: 3 | 5 | 10) => void;
  genderColors?: typeof COLORS.GIFTBOX.MALE | typeof COLORS.GIFTBOX.FEMALE;
}

const DecantSelector: React.FC<DecantSelectorProps> = ({
  decantCount,
  onSelectDecant,
  decantSize,
  onDecantSize,
  genderColors = COLORS.GIFTBOX.MALE
}) => (
  // Wrap both selectors in a Fragment or View
  <>
    <View style={styles.decantCountContainer}>
      {[4, 8].map((count) => (
        <TouchableOpacity
          key={count}
          style={[
            styles.decantCountButton,
            decantCount === count && [
              styles.decantCountButtonActive,
              { backgroundColor: genderColors?.PRIMARY || COLORS.GIFTBOX.MALE.PRIMARY }
            ],
          ]}
          onPress={() => onSelectDecant(count as 4 | 8)}
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
    </View>
  {/* Decant Size Selector - Only show if onDecantSize is provided */}
  {onDecantSize && (
    <View style={[styles.section, styles.filterSection]}>
      <View style={styles.sizeContainer}>
        {[3, 5, 10].map((size) => (
          <Pressable
            key={size}
            style={[
              styles.sizeButton,
              decantSize === size && styles.sizeButtonActive,
              // Apply gender-specific active color if needed, similar to count button
              decantSize === size && { backgroundColor: genderColors?.PRIMARY || COLORS.GIFTBOX.MALE.PRIMARY }
            ]}
            onPress={() => onDecantSize(size as 3 | 5 | 10)} // Use the prop function
            disabled={!onDecantSize} // Disable if no handler provided
          >
            <Text style={[
              styles.sizeText,
              decantSize === size && styles.sizeTextActive,
            ]}>{size}ml</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )}
  </> // Close the wrapper Fragment/View
);

const styles = StyleSheet.create({
  decantCountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.XSMALL,
    width: '100%',
  },
  decantCountButton: {
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: 16,
    backgroundColor: COLORS.GIFTBOX.BACKGROUND_ALT,
    borderWidth: 1,
    borderColor: COLORS.GIFTBOX.BORDER,
    alignItems: 'center',
    elevation: 1,
    shadowColor: COLORS.GIFTBOX.CARD_SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  decantCountButtonActive: {
    borderColor: 'transparent',
    elevation: 2,
    shadowOpacity: 0.2,
  },
  decantCountText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.GIFTBOX.TEXT_PRIMARY,
    fontWeight: '600',
  },
  decantCountTextActive: {
    color: COLORS.GIFTBOX.BACKGROUND_ALT,
    fontWeight: '700',
  }, // Keep this closing brace for decantCountTextActive

  // Styles for Decant Size Selector (Moved inside StyleSheet.create)
  section: {
    marginTop: SPACING.MEDIUM,
    width: '100%',
    alignItems: 'center', // Center section content
  },
  filterSection: {
    // Specific styles for filter sections if needed, can be combined with section
  },
  sectionTitle: {
    fontSize: FONT_SIZES.REGULAR, // Corrected font size
    fontWeight: '600',
    color: COLORS.GIFTBOX.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  filterTitle: {
    // Specific styles for filter titles if needed, can be combined with sectionTitle
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center buttons
    gap: SPACING.XSMALL,
    flexWrap: 'wrap', // Allow wrapping if needed
  },
  sizeButton: {
    paddingVertical: SPACING.XSMALL, // Smaller padding than count buttons
    paddingHorizontal: SPACING.MEDIUM,
    borderRadius: 12, // Slightly smaller radius
    backgroundColor: COLORS.GIFTBOX.BACKGROUND_ALT,
    borderWidth: 1,
    borderColor: COLORS.GIFTBOX.BORDER,
    alignItems: 'center',
    minWidth: 60, // Ensure minimum width for consistency
    elevation: 1,
    shadowColor: COLORS.GIFTBOX.CARD_SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sizeButtonActive: {
    borderColor: 'transparent', // Same active style as count button
    elevation: 2,
    shadowOpacity: 0.2,
    // Active background color is applied dynamically using inline style
  },
  sizeText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.GIFTBOX.TEXT_PRIMARY,
    fontWeight: '600',
  },
  sizeTextActive: {
    color: COLORS.GIFTBOX.BACKGROUND_ALT, // Same active text color as count button
    fontWeight: '700',
  },
}); // This is the correct closing brace for StyleSheet.create

export default DecantSelector;