import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SPACING, FONT_SIZES, COLORS } from '../../types/constants';

// Price range options
const priceRanges = [
  { label: '<20k', value: '<20.000' },
  { label: '20k-30k', value: '20.000-30.000' },
  { label: '30k-40k', value: '30.000-40.000' },
  { label: '40k-50k', value: '40.000-50.000' },
  { label: '>50k', value: '>50.000' },
];

interface PriceRangeButtonsProps {
  currentRange: string;
  setCurrentRange: (range: string) => void;
  genderColors: typeof COLORS.GIFTBOX.MALE | typeof COLORS.GIFTBOX.FEMALE;
}

const PriceRangeButtons: React.FC<PriceRangeButtonsProps> = ({
  currentRange,
  setCurrentRange,
  genderColors,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.buttonsContainer}
  >
    {priceRanges.map((range, index, arr) => (
      <TouchableOpacity
        key={range.value}
        style={[
          styles.rangeButton,
          currentRange === range.value && [
            styles.rangeButtonActive,
            { backgroundColor: genderColors.PRIMARY, borderColor: genderColors.PRIMARY }
          ],
          index === arr.length - 1 && styles.rangeButtonLast
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

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.XSMALL,
  },
  rangeButton: {
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: SPACING.XSMALL,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.GIFTBOX.BORDER,
    backgroundColor: COLORS.GIFTBOX.BACKGROUND_ALT,
    marginRight: SPACING.XSMALL,
    elevation: 1,
    shadowColor: COLORS.GIFTBOX.CARD_SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rangeButtonLast: {
    marginRight: 0,
  },
  rangeButtonActive: {
    elevation: 2,
    shadowOpacity: 0.2,
  },
  rangeButtonText: {
    fontSize: FONT_SIZES.XSMALL,
    color: COLORS.GIFTBOX.TEXT_PRIMARY,
    fontWeight: '600',
  },
  rangeButtonTextActive: {
    color: COLORS.GIFTBOX.BACKGROUND_ALT,
    fontWeight: '700',
  },
});

export default PriceRangeButtons;