import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../types/constants'; // Assuming constants are here

interface BottomBarProps {
  totalPrice: number;
  onAddToCart: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ totalPrice, onAddToCart }) => {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.leftContainer}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Total:</Text>
          <Text style={styles.totalPriceValue}>${totalPrice.toLocaleString('de-DE')}</Text>
        </View>
      </View>
      <Pressable
        style={styles.addToCartButton}
        onPress={onAddToCart}
      >
        <Text style={styles.addToCartButtonText}>Añadir al carro</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    padding: SPACING.MEDIUM, // Use constants
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER, // Use constants
    backgroundColor: COLORS.BACKGROUND, // Use constants
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flex: 1, // Allow left side to take available space
    marginRight: SPACING.MEDIUM,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.XSMALL, // Use constants
  },
  totalPriceLabel: {
    fontSize: FONT_SIZES.REGULAR, // Use constants
    fontWeight: '500',
    color: COLORS.TEXT_SECONDARY, // Use constants
  },
  totalPriceValue: {
    fontSize: FONT_SIZES.LARGE, // Use constants
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY, // Use constants
  },
  addToCartButton: {
    backgroundColor: COLORS.PRIMARY, // Use constants
    paddingVertical: SPACING.MEDIUM, // Use constants
    paddingHorizontal: SPACING.LARGE, // Use constants
    borderRadius: 8,
    shadowColor: '#809CAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartButtonText: {
    color: COLORS.BACKGROUND, // Use constants
    fontSize: FONT_SIZES.REGULAR, // Use constants
    fontWeight: '600',
  },
});

export default BottomBar;