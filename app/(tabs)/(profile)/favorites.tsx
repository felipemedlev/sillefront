import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useRatings } from '../../../context/RatingsContext';
import { MOCK_PERFUMES } from '@/data/mockPerfumes'; // Import mock data source
import { Perfume } from '../../../types/perfume'; // Import Perfume type
import SearchResults from '../../../components/search/SearchResults'; // Reuse SearchResults component
import PerfumeModal, { PerfumeModalRef } from '../../../components/product/PerfumeModal'; // Reuse PerfumeModal
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants'; // Import constants

export default function FavoritesScreen() {
  const { favorites, isLoadingFavorites } = useRatings();
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const modalRef = useRef<PerfumeModalRef>(null);
  // Removed unused router

  // Filter the mock perfumes to get only the favorited ones
  const favoritePerfumes = useMemo(() => {
    // In a real app, you might fetch details based on favorite IDs here
    return MOCK_PERFUMES.filter(perfume => favorites.includes(perfume.id));
  }, [favorites]);

  const handlePerfumePress = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
    modalRef.current?.show(perfume);
  };

  if (isLoadingFavorites) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.infoText}>Loading favorites...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Keep the header title from the layout */}
      <Stack.Screen options={{ title: 'Mis Favoritos' }} />

      {favoritePerfumes.length === 0 ? (
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.infoText}>No tienes perfumes favoritos todavía.</Text>
          <Text style={styles.infoSubText}>¡Marca algunos con el corazón en "Buscar"!</Text>
        </View>
      ) : (
        // Use SearchResults component to display the grid
        // Wrap SearchResults in a View or ScrollView if it doesn't provide its own scrolling
        <ScrollView style={styles.resultsContainer}>
           <SearchResults
             perfumes={favoritePerfumes}
             onPerfumePress={handlePerfumePress}
             // Pass any other necessary props if SearchResults requires them
           />
        </ScrollView>
      )}

      {/* Perfume Modal */}
      <PerfumeModal
        ref={modalRef}
        perfume={selectedPerfume}
        onClose={() => setSelectedPerfume(null)}
        // Add other props like isSwapping if needed, default to false/null
        isSwapping={false}
        onSimilarPerfumeSelect={() => {}} // Provide dummy function if required
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC', // Match background
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  infoText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.SMALL,
  },
  infoSubText: {
      fontSize: FONT_SIZES.SMALL,
      color: COLORS.TEXT_SECONDARY,
      textAlign: 'center',
      fontFamily: FONTS.INSTRUMENT_SANS,
  },
  resultsContainer: {
      flex: 1,
      // Add padding if SearchResults doesn't handle it internally like the search screen
      // padding: SPACING.MEDIUM,
  },
  // Add any other styles needed, potentially copying from SearchScreen if SearchResults styling is external
});