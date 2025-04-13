import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SPACING, FONT_SIZES, COLORS } from '../../types/constants';

interface DecantSelectorProps {
  decantCount: 4 | 8;
  onSelectDecant: (count: 4 | 8) => void;
  genderColors?: typeof COLORS.GIFTBOX.MALE | typeof COLORS.GIFTBOX.FEMALE;
}

const DecantSelector: React.FC<DecantSelectorProps> = ({
  decantCount,
  onSelectDecant,
  genderColors = COLORS.GIFTBOX.MALE
}) => (
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
    paddingVertical: SPACING.XSMALL,
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
    fontSize: FONT_SIZES.XSMALL,
    color: COLORS.GIFTBOX.TEXT_PRIMARY,
    fontWeight: '600',
  },
  decantCountTextActive: {
    color: COLORS.GIFTBOX.BACKGROUND_ALT,
    fontWeight: '700',
  },
});

export default DecantSelector;