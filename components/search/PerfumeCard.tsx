import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { BasicPerfumeInfo, Perfume } from '../../types/perfume';
import { useRatings } from '../../context/RatingsContext';
import { useManualBox } from '../../context/ManualBoxContext'; // <-- Add this
import { COLORS, FONT_SIZES, SPACING } from '../../types/constants';

interface PerfumeCardProps {
  perfume: Perfume | BasicPerfumeInfo;
  matchPercentage?: number;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
// Adjust card width calculation slightly if needed for better spacing
const CARD_MARGIN_HORIZONTAL = SPACING.MEDIUM;
const NUM_COLUMNS = 2;
const TOTAL_HORIZONTAL_PADDING = SPACING.LARGE * 2; // Assuming SearchResults has LARGE padding
const TOTAL_MARGINS = CARD_MARGIN_HORIZONTAL * (NUM_COLUMNS - 1);
const AVAILABLE_WIDTH = width - TOTAL_HORIZONTAL_PADDING - TOTAL_MARGINS;
const CARD_WIDTH = AVAILABLE_WIDTH / NUM_COLUMNS;


export default function PerfumeCard({ perfume, matchPercentage, onPress }: PerfumeCardProps) {
  const { addFavorite, removeFavorite, isFavorite } = useRatings();
  const { addPerfume, removePerfume, isPerfumeSelected, canAddMorePerfumes, decantCount } = useManualBox(); // Add decantCount
  const favorite = isFavorite(perfume.id);
  const isSelected = isPerfumeSelected(perfume.id);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (showToast) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowToast(false));
    }
  }, [showToast, fadeAnim]);

  const handleFavoriteToggle = useCallback(() => {
    if (favorite) {
      removeFavorite(perfume.id);
    } else {
      addFavorite(perfume.id);
    }
  }, [addFavorite, removeFavorite, perfume.id, favorite]);

  const handleManualBoxToggle = useCallback(() => {
    if (isSelected) {
      removePerfume(perfume.id);
      setToastMessage('Perfume removido del Box Manual');
      setShowToast(true);
    } else if (canAddMorePerfumes()) {
      if ('brand' in perfume && 'name' in perfume && 'thumbnailUrl' in perfume) {
        addPerfume(perfume as Perfume);
        setToastMessage('Perfume añadido al Box Manual');
        setShowToast(true);
      } else {
        console.warn("Cannot add basic perfume info to manual box yet.");
      }
    } else {
      setToastMessage(`No puedes añadir más perfumes. El box manual tiene un límite de ${decantCount} perfumes.`);
      setShowToast(true);
    }
  }, [isSelected, removePerfume, addPerfume, perfume, canAddMorePerfumes, decantCount]);

  const displayMatch = matchPercentage ?? (perfume as Perfume).matchPercentage;

  return (
    <View style={styles.cardOuterContainer}>
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
      {displayMatch !== undefined && (
        <View style={styles.matchContainer}>
          <Text style={styles.matchPercentage}>{displayMatch}%</Text>
          <Text style={styles.matchLabel}>AI Match</Text>
        </View>
      )}

      <TouchableOpacity style={styles.cardTouchableArea} onPress={onPress}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: perfume.thumbnailUrl }} style={styles.image} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.brand} numberOfLines={1}>{perfume.brand}</Text>
          <Text style={styles.name} numberOfLines={2}>{perfume.name}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleFavoriteToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons // Use Ionicons
            name={favorite ? "heart" : "heart-outline"} // Switch between filled and outline
            size={28} // Slightly adjust size for Ionicons consistency
            color={favorite ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY} // Black when filled, grey when outline
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            styles.addButtonBase,
            isSelected ? styles.addButtonSelected : styles.addButtonNotSelected
          ]}
          onPress={handleManualBoxToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name={isSelected ? "check" : "plus"}
            size={17}
            color={isSelected ? COLORS.BACKGROUND : COLORS.PRIMARY}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuterContainer: {
    width: CARD_WIDTH,
    marginBottom: SPACING.LARGE, // Increased bottom margin for more space
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 14, // Slightly larger radius
    shadowColor: '#000000', // Use black for shadow
    shadowOffset: { width: 0, height: 4 }, // Slightly larger offset
    shadowOpacity: 0.06, // Reduced opacity for softer shadow
    shadowRadius: 12, // Increased radius for more blur
    elevation: 4, // Keep elevation for Android
    overflow: 'hidden',
    borderWidth: 1, // Add a subtle border
    borderColor: '#F0F0F0', // Light border color
  },
  matchContainer: {
    backgroundColor: COLORS.BACKGROUND_ALT,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  matchPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.ACCENT,
  },
  matchLabel: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 2,
  },
  cardTouchableArea: {
    // No specific styles needed here now
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: CARD_WIDTH, // Make image container square based on width
    backgroundColor: COLORS.BACKGROUND, // Slightly different placeholder color
    borderBottomWidth: 1, // Separator line below image
    borderBottomColor: '#F0F0F0',
  },
  image: {
    width: '70%', // Slightly smaller image
    height: '70%',
    resizeMode: 'contain',
  },
  infoContainer: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM, // Consistent vertical padding
  },
  brand: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    lineHeight: FONT_SIZES.REGULAR * 1.3,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL + 2, // Slightly more vertical padding
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5', // Even lighter separator
    backgroundColor: '#FCFCFC', // Slightly off-white background for action bar
  },
  iconButton: {
    padding: SPACING.SMALL / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Remove original addButton, replace with base and conditional styles
  // addButton: { ... }, // <-- Remove or comment out this block
  addButtonBase: { // Base styles for the add button circle
    borderRadius: 15, // Perfect circle
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5, // Add border for the outline effect
    borderColor: COLORS.PRIMARY, // Border color is primary
  },
  addButtonNotSelected: { // Style when not selected (outline)
    backgroundColor: COLORS.BACKGROUND, // White background
  },
  addButtonSelected: { // Style when selected (filled)
    backgroundColor: COLORS.PRIMARY, // Primary background
    borderColor: COLORS.PRIMARY, // Ensure border is also primary when filled
  },
  toast: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: 'center',
  },
  toastText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '500',
  },
});