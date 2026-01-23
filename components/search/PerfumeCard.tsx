import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { BasicPerfumeInfo, Perfume } from '../../types/perfume';
import { useRatings } from '../../context/RatingsContext';
import { useManualBox } from '../../context/ManualBoxContext';
import { useSnackbar } from '../../context/SnackbarContext'; // Import useSnackbar
import { COLORS, FONT_SIZES, SPACING } from '../../types/constants';

interface PerfumeCardProps {
  perfume: Perfume | BasicPerfumeInfo;
  matchPercentage?: number;
  onPress: () => void;
  isDesktop: boolean;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN_HORIZONTAL = SPACING.MEDIUM;
const NUM_COLUMNS = 2;
const TOTAL_HORIZONTAL_PADDING = SPACING.LARGE * 2; // Assuming SearchResults has LARGE padding
const TOTAL_MARGINS = CARD_MARGIN_HORIZONTAL * (NUM_COLUMNS - 1);

export default function PerfumeCard({ perfume, matchPercentage, onPress, isDesktop }: PerfumeCardProps) {
  let cardWidth: number;
  if (isDesktop) {
    cardWidth = 180;
  } else {
    const AVAILABLE_WIDTH = width - TOTAL_HORIZONTAL_PADDING - TOTAL_MARGINS;
    cardWidth = (AVAILABLE_WIDTH / NUM_COLUMNS) - 8; // Slightly reduce width to create gap on mobile
  }
  const { addFavorite, removeFavorite, isFavorite } = useRatings();
  const { addPerfume, removePerfume, isPerfumeSelected, canAddMorePerfumes, decantCount } = useManualBox();
  const { showSnackbar } = useSnackbar(); // Use the SnackbarContext
  const targetId = (perfume as any).external_id || perfume.id;
  const favorite = isFavorite(targetId);
  const isSelected = isPerfumeSelected(targetId);

  const handleFavoriteToggle = useCallback(() => {
    if (favorite) {
      removeFavorite(targetId);
    } else {
      addFavorite(targetId);
    }
  }, [addFavorite, removeFavorite, targetId, favorite]);

  const handleManualBoxToggle = useCallback(() => {
    if (isSelected) {
      removePerfume(targetId);
      showSnackbar('Perfume removido del Box Personalizado', 'info'); // Normal notification
    } else if (canAddMorePerfumes()) {
      if ('brand' in perfume && 'name' in perfume && 'thumbnail_url' in perfume) {
        addPerfume(perfume as Perfume);
        showSnackbar('Perfume añadido al Box Personalizado', 'info'); // Normal notification
      } else {
        console.warn("Cannot add basic perfume info to box personalizado yet.");
      }
    } else {
      // Custom error message based on decantCount
      let errorMessage = `El Box Personalizado tiene un límite de ${decantCount} perfumes.`;

      // Add specific guidance based on decantCount
      if (decantCount === 4) {
        errorMessage += "\nDebes cambiar la cantidad de decant a 8 en el Box Personalizado.";
      } else if (decantCount === 8) {
        errorMessage += "\nPuedes agregar tu Box en el carro y hacer un nuevo Box Personalizado.";
      }

      showSnackbar(errorMessage, 'error'); // Red error message
    }
  }, [isSelected, removePerfume, addPerfume, perfume, canAddMorePerfumes, decantCount, showSnackbar, targetId]);

  // Use match_percentage (snake_case) consistent with potential API/type structure
  const displayMatch = matchPercentage ?? (perfume as any).match_percentage;

  return (
    <View style={[styles.cardOuterContainer, { width: cardWidth }]}>
      {displayMatch !== undefined && (
        <View style={styles.matchContainer}>
          <Text style={styles.matchPercentage}>{displayMatch}%</Text>
          <Text style={styles.matchLabel}>AI Match</Text>
        </View>
      )}

      <TouchableOpacity style={styles.cardTouchableArea} onPress={onPress}>
        <View style={[styles.imageContainer, { height: cardWidth * 0.7 }]}>
          <Image source={{ uri: perfume.thumbnail_url }} style={styles.image} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.brand} numberOfLines={1}>
            {/* More robust check: Ensure brand is an object with a name property */}
            {/* Assert brand is an object with name and use optional chaining */}
            {(perfume.brand as { name?: string })?.name ?? ''}
          </Text>
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
});