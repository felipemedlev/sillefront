import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../types/constants'; // Assuming constants are here

interface BottomBarProps {
  totalPrice: number;
  onAddToCart: () => void;
  feedbackMessage?: string | null; // Optional feedback message
}

const BottomBar: React.FC<BottomBarProps> = ({ totalPrice, onAddToCart, feedbackMessage }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (feedbackMessage) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500), // Keep message visible for 1.5 seconds
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation if message is cleared
      fadeAnim.setValue(0);
    }
  }, [feedbackMessage, fadeAnim]);

  return (
    <View style={styles.bottomBar}>
      <View style={styles.leftContainer}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Total:</Text>
          <Text style={styles.totalPriceValue}>${totalPrice.toLocaleString('de-DE')}</Text>
        </View>
        {feedbackMessage && (
          <Animated.View style={[styles.feedbackContainer, { opacity: fadeAnim }]}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </Animated.View>
        )}
      </View>
      <Pressable
        style={styles.addToCartButton}
        onPress={onAddToCart}
        disabled={!!feedbackMessage} // Optionally disable button during feedback
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
  feedbackContainer: {
    marginTop: SPACING.XSMALL,
    padding: SPACING.XSMALL,
    backgroundColor: COLORS.SUCCESS + '20', // Light success background
    borderRadius: 4,
  },
  feedbackText: {
    fontSize: FONT_SIZES.XSMALL,
    color: COLORS.SUCCESS, // Use constants
    fontWeight: '500',
    textAlign: 'left',
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