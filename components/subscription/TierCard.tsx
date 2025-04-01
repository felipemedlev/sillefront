import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SubscriptionTierDetails, SubscriptionTier } from '../../types/subscription';
import { COLORS, FONT_SIZES, SPACING } from '../../types/constants';

interface TierCardProps {
  tierDetails: SubscriptionTierDetails;
  onSelect: (tier: SubscriptionTier) => void;
  isSelected?: boolean; // Optional: To highlight the selected card if needed later
  isDisabled?: boolean; // Optional: To disable the button (e.g., during loading)
}

const TierCard: React.FC<TierCardProps> = ({
  tierDetails,
  onSelect,
  isSelected = false, // Default to false
  isDisabled = false, // Default to false
}) => {
  const { id, name, priceCLP, description } = tierDetails;

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <Text style={styles.tierName}>{name}</Text>
      <Text style={styles.tierPrice}>{`$${priceCLP.toLocaleString('es-CL')} / mes`}</Text>
      <Text style={styles.tierDescription}>{description}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.subscribeButton,
          isDisabled && styles.buttonDisabled, // Apply disabled style
          pressed && !isDisabled && styles.buttonPressed, // Apply pressed style only if not disabled
        ]}
        onPress={() => !isDisabled && onSelect(id)} // Only call onSelect if not disabled
        disabled={isDisabled} // Disable the Pressable itself
      >
        <Text style={styles.subscribeButtonText}>
          {isDisabled ? 'Procesando...' : 'Suscribirse'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: SPACING.LARGE,
    borderWidth: 1.5, // Slightly thicker border for Apple feel
    borderColor: COLORS.BORDER,
    // Subtle shadow for depth, common in iOS design
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Elevation for Android shadow
    gap: SPACING.SMALL, // Add gap between elements
  },
  cardSelected: {
    borderColor: COLORS.PRIMARY, // Highlight selected card
    borderWidth: 2,
  },
  tierName: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600', // Semi-bold is common in iOS titles
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center', // Center align title
    marginBottom: SPACING.XSMALL,
  },
  tierPrice: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.ACCENT, // Use accent for price
    fontWeight: '700', // Bold price
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  tierDescription: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center', // Center description text
    lineHeight: FONT_SIZES.SMALL * 1.5, // Improve readability
    marginBottom: SPACING.LARGE,
    minHeight: 50, // Ensure consistent height for description area
  },
  subscribeButton: {
    backgroundColor: COLORS.PRIMARY, // Use primary color for button
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center text vertically
    minHeight: 44, // Minimum touch target size (Apple HIG)
  },
  subscribeButtonText: {
    color: COLORS.BACKGROUND, // White text on dark button
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600', // Semi-bold button text
  },
  buttonPressed: {
    opacity: 0.7, // Dim button slightly when pressed
  },
  buttonDisabled: {
    backgroundColor: COLORS.BORDER, // Grey out button when disabled
    opacity: 0.7,
  },
});

export default TierCard;