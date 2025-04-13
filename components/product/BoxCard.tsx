import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, COLORS } from '../../types/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiPredefinedBox } from '../../src/services/api';

interface BoxCardProps {
  box: ApiPredefinedBox;
  genderColors: typeof COLORS.GIFTBOX.MALE | typeof COLORS.GIFTBOX.FEMALE;
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
    style={styles.card}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <LinearGradient
      colors={[genderColors.BG, COLORS.GIFTBOX.BACKGROUND_ALT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
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
      <Text style={styles.cardDescription}>{box.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.cardPrice, { color: genderColors.PRIMARY }]}>
          {`$${Math.round(calculatePrice(box, decantCount)).toLocaleString()}`}
        </Text>
        <View style={styles.cardAction}>
          <Text style={[styles.cardActionText, { color: genderColors.PRIMARY }]}>Ver detalles</Text>
          <Feather name="chevron-right" size={14} color={genderColors.PRIMARY} />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexBasis: '100%',
    flexGrow: 1,
    maxWidth: 300,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.GIFTBOX.CARD_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: SPACING.SMALL,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XSMALL / 2,
  },
  cardIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.XSMALL,
  },
  cardTitle: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '700',
    color: COLORS.GIFTBOX.TEXT_PRIMARY,
    flex: 1,
  },
  cardDescription: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.GIFTBOX.TEXT_SECONDARY,
    lineHeight: FONT_SIZES.SMALL * 1.3,
    marginBottom: SPACING.XSMALL / 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.XSMALL / 2,
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