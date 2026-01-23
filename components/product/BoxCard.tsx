import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, COLORS, GiftboxTheme } from '../../types/constants';
import { ApiPredefinedBox } from '../../src/services/api';

interface BoxCardProps {
  box: ApiPredefinedBox;
  genderColors: GiftboxTheme;
  decantCount: 4 | 8;
  onPress: () => void;
  calculatePrice: (box: ApiPredefinedBox, count: 4 | 8) => number;
}

const BoxCard: React.FC<BoxCardProps> = ({
  box,
  genderColors,
  decantCount,
  onPress,
  calculatePrice
}) => (
  <TouchableOpacity
    style={[styles.card, { borderColor: genderColors.PRIMARY + '40' }]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconContainer, { backgroundColor: genderColors.LIGHT }]}>
          <Feather
            name={(box.icon || 'gift') as keyof typeof Feather.glyphMap}
            size={18}
            color="#fff"
          />
        </View>
        <Text style={styles.cardTitle}>{box.title}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.cardPrice, { color: genderColors.PRIMARY }]}>
          {`$${Math.round(calculatePrice(box, decantCount)).toLocaleString()}`}
        </Text>
        <View style={styles.cardAction}>
          <Text style={[styles.cardActionText, { color: genderColors.PRIMARY }]}>Ver detalles</Text>
          <Feather name="chevron-right" size={14} color={genderColors.PRIMARY} />
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexBasis: '100%',
    flexGrow: 1,
    maxWidth: 300,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: SPACING.SMALL,
  },
  cardContent: {
    padding: SPACING.MEDIUM,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.SMALL,
  },
  cardTitle: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.XSMALL,
  },
  cardPrice: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '700',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActionText: {
    fontSize: FONT_SIZES.XSMALL,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default BoxCard;