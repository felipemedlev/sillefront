import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface BottomBarProps {
  totalPrice: number;
  onAddToCart: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ totalPrice, onAddToCart }) => {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPriceLabel}>Total:</Text>
        <Text style={styles.totalPriceValue}>${totalPrice.toLocaleString()}</Text>
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#222222',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#809CAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BottomBar;