import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useRatings } from '../../../context/RatingsContext';
import { Perfume } from '../../../types/perfume';
import SearchResults from '../../../components/search/SearchResults';
import PerfumeModal, { PerfumeModalRef } from '../../../components/product/PerfumeModal';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants';
import { fetchPerfumesByExternalIds } from '../../../src/services/api';
import { useFocusEffect } from 'expo-router';

export default function FavoritesScreen() {
  const { favorites, isLoadingFavorites } = useRatings();
  const [favoritePerfumes, setFavoritePerfumes] = useState<Perfume[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const modalRef = useRef<PerfumeModalRef>(null);

  // Optimize: Filter locally first to ensure instant removal
  useEffect(() => {
    if (favoritePerfumes.length > 0) {
      setFavoritePerfumes(prev => prev.filter(p => favorites.includes(p.external_id || p.id)));
    }
  }, [favorites]);

  // Fetch details for NEW favorite perfumes
  const loadFavoriteDetails = useCallback(async () => {
    if (favorites.length === 0) {
      setFavoritePerfumes([]);
      return;
    }

    // Find IDs that we don't have details for yet
    const currentIds = favoritePerfumes.map(p => p.external_id || p.id);
    const missingIds = favorites.filter(id => !currentIds.includes(id));

    if (missingIds.length === 0) {
      // We have all details, no need to fetch
      // Just ensure sorting matches if needed (optional)
      return;
    }

    try {
      setIsLoadingDetails(true);
      // Fetch ONLY the missing ones to append, or fetch all to refresh?
      // fetching all is safer for order and updates, but let's try fetching all for now
      // but only if we really need to (e.g. initial load or actual new items).
      // Actually, if we just removed items, the useEffect handled it.
      // So this API call is mainly for INITIAL load or ADDITION.

      const perfumes = await fetchPerfumesByExternalIds(favorites);

      // Normalize match_percentage if needed (API returns 0-1, we need 0-100)
      const normalizedPerfumes = perfumes.map(p => ({
        ...p,
        match_percentage: p.match_percentage && p.match_percentage <= 1
          ? Math.round(p.match_percentage * 100)
          : p.match_percentage
      }));

      setFavoritePerfumes(normalizedPerfumes);
    } catch (error) {
      console.error("Error fetching favorite perfumes:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [favorites]);

  // Use useFocusEffect to reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavoriteDetails();
    }, [loadFavoriteDetails])
  );

  const handlePerfumePress = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
    modalRef.current?.show(perfume);
  };

  if (isLoadingFavorites || (isLoadingDetails && favoritePerfumes.length === 0)) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.infoText}>Cargando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favoritePerfumes.length === 0 ? (
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.infoText}>No tienes perfumes favoritos todavía.</Text>
          <Text style={styles.infoSubText}>¡Marca algunos con el corazón en "Buscar"!</Text>
        </View>
      ) : (
        <ScrollView style={styles.resultsContainer} contentContainerStyle={{ flexGrow: 1 }}>
          <SearchResults
            perfumes={favoritePerfumes}
            onPerfumePress={handlePerfumePress}
          />
        </ScrollView>
      )}

      {/* Perfume Modal */}
      <PerfumeModal
        ref={modalRef}
        perfume={selectedPerfume}
        onClose={() => setSelectedPerfume(null)}
        isSwapping={false}
        onSimilarPerfumeSelect={() => { }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
  centerContent: {
    flex: 1,
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
  },
});