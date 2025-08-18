import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, useWindowDimensions, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import RatingModal from '../../../components/RatingModal';
import { useRatings } from '../../../context/RatingsContext';
import { useAuth } from '../../../src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, SPACING, FONTS, STORAGE_KEYS } from '../../../types/constants';
import * as api from '../../../src/services/api';

// Define the simplified perfume type needed for this screen
interface DisplayPerfume {
  id: string;         // This will store the external_id for ratings
  name: string;
  brand: string;
  image: string;
}

// Define the API response type for perfumes
interface PerfumeApiResponse {
  id: number;
  external_id: string;
  name: string;
  brand: string;
  thumbnail_url: string | null;
  [key: string]: any; // Allow other properties without explicitly defining them
}

const DESKTOP_BREAKPOINT = 768;

export default function RatingsScreen() {
  const [activeTab, setActiveTab] = useState('calificados');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<DisplayPerfume | null>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [hasSyncedRatings, setHasSyncedRatings] = useState(false);
  const { ratings, getRating, isLoadingRatings, fetchUserRatings, submitRatingsToBackend } = useRatings();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [allPerfumes, setAllPerfumes] = useState<DisplayPerfume[]>([]);
  const [isLoadingPerfumes, setIsLoadingPerfumes] = useState(true);
  const [searchResults, setSearchResults] = useState<DisplayPerfume[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [orderedPerfumeIdsFromOrders, setOrderedPerfumeIdsFromOrders] = useState<string[]>([]);
  const [isLoadingOrderedPerfumeIds, setIsLoadingOrderedPerfumeIds] = useState(true);

  const loadOrderedIdsFromOrders = useCallback(async () => {
    setIsLoadingOrderedPerfumeIds(true);
    try {
      if (isAuthenticated) {
        // Fetch perfume IDs from user orders
        const perfumeIds = await api.getPerfumesFromUserOrders();
        setOrderedPerfumeIdsFromOrders(perfumeIds);
        console.log("RatingsScreen: Loaded ordered perfume IDs from orders:", perfumeIds);
      } else {
        // Fallback to AsyncStorage for non-authenticated users
        const idsJson = await AsyncStorage.getItem(STORAGE_KEYS.ORDERED_PERFUMES_FOR_RATING);
        if (idsJson) {
          const idsArray = JSON.parse(idsJson);
          if (Array.isArray(idsArray)) {
            setOrderedPerfumeIdsFromOrders(idsArray);
            console.log("RatingsScreen: Loaded ordered perfume IDs from storage:", idsArray);
          } else {
            setOrderedPerfumeIdsFromOrders([]);
          }
        } else {
          setOrderedPerfumeIdsFromOrders([]);
        }
      }
    } catch (error) {
      console.error('RatingsScreen: Error loading ordered perfume IDs:', error);
      setOrderedPerfumeIdsFromOrders([]);
    } finally {
      setIsLoadingOrderedPerfumeIds(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      console.log("RatingsScreen focused. Refreshing ordered IDs and user ratings.");
      loadOrderedIdsFromOrders();
      if (isAuthenticated) {
        fetchUserRatings(); // From useRatings context
      }
    }, [loadOrderedIdsFromOrders, isAuthenticated, fetchUserRatings])
  );

  // Effect to fetch initial perfumes and supplement with ordered perfume details
  useEffect(() => {
    const fetchAndCombinePerfumes = async () => {
      if (isLoadingOrderedPerfumeIds) {
        // Wait until ordered IDs are loaded
        return;
      }

      setIsLoadingPerfumes(true);
      try {
        // 1. Fetch initial list of perfumes
        const initialResponse = await api.fetchPerfumes(1, 40); // Fetch a slightly larger initial list
        let combinedPerfumes: DisplayPerfume[] = [];

        if (initialResponse && Array.isArray(initialResponse.results)) {
          combinedPerfumes = initialResponse.results.map((p: PerfumeApiResponse) => ({
            id: p.external_id || p.id.toString(),
            name: p.name,
            brand: p.brand,
            image: p.thumbnail_url || '',
          }));
        }

        // 2. Identify missing perfume IDs from ordered list
        const existingPerfumeIds = new Set(combinedPerfumes.map(p => p.id));
        const missingOrderedIds = orderedPerfumeIdsFromOrders.filter((id: string) => !existingPerfumeIds.has(id));

        // 3. Fetch details for missing ordered perfumes
        if (missingOrderedIds.length > 0) {
          console.log("Fetching details for missing ordered perfume IDs:", missingOrderedIds);
          const additionalPerfumesResponse = await api.fetchPerfumesByExternalIds(missingOrderedIds);
          if (additionalPerfumesResponse && Array.isArray(additionalPerfumesResponse)) {
            const additionalPerfumesData = additionalPerfumesResponse.map((p: PerfumeApiResponse) => ({
              id: p.external_id || p.id.toString(),
              name: p.name,
              brand: p.brand,
              image: p.thumbnail_url || '',
            }));
            // Add to combined list, ensuring uniqueness by ID
            additionalPerfumesData.forEach(newPerfume => {
              if (!existingPerfumeIds.has(newPerfume.id)) {
                combinedPerfumes.push(newPerfume);
                existingPerfumeIds.add(newPerfume.id); // Add to set to track
              }
            });
          }
        }
        setAllPerfumes(combinedPerfumes);
        console.log("Final combined 'allPerfumes':", combinedPerfumes.length);

      } catch (error) {
        console.error('Error fetching and combining perfumes:', error);
      } finally {
        setIsLoadingPerfumes(false);
      }
    };

    fetchAndCombinePerfumes();
  }, [isLoadingOrderedPerfumeIds, orderedPerfumeIdsFromOrders]); // Rerun if ordered IDs change

  // Effect to attempt submitting local ratings when user becomes authenticated
  // Will only run once when user becomes authenticated
  useEffect(() => {
    const syncRatingsWithBackend = async () => {
      // Check if we've already synced in this session
      const hasSubmitted = await AsyncStorage.getItem('hasSubmittedRatings');

      if (isAuthenticated && ratings.length > 0 && !hasSyncedRatings && !hasSubmitted) {
        console.log('User authenticated, attempting to sync local ratings with backend');
        await submitRatingsToBackend();
        setHasSyncedRatings(true); // Mark as synced to prevent loop
        // Also store in AsyncStorage to persist across component remounts
        await AsyncStorage.setItem('hasSubmittedRatings', 'true');
      } else if (hasSubmitted) {
        // If already submitted, just mark as synced in component state
        setHasSyncedRatings(true);
      }
    };

    syncRatingsWithBackend();
  }, [isAuthenticated, ratings, submitRatingsToBackend, hasSyncedRatings]);

  // --- Search Handling ---

  // Use effect for debounced search
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // If search query is empty, clear results and return
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Set a new timeout for debounced search
    const timeout = setTimeout(() => {
      searchPerfumes(searchQuery.trim());
    }, 500); // 500ms debounce

    setSearchTimeout(timeout as unknown as NodeJS.Timeout);

    // Cleanup function to clear timeout
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchQuery]);

  // Function to search perfumes from the backend
  const searchPerfumes = async (query: string) => {
    if (!query) return;

    try {
      setIsSearching(true);

      // Call the API with the search query
      const response = await api.fetchPerfumes(1, 20, query);

      if (response && Array.isArray(response.results)) {
        // Map API response to the DisplayPerfume type
        const perfumesData = response.results.map((p: PerfumeApiResponse) => ({
          id: p.external_id || p.id.toString(),
          name: p.name,
          brand: p.brand,
          image: p.thumbnail_url || '',
        }));

        setSearchResults(perfumesData);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching perfumes:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // --- Data Derivation ---

  // Get rated perfumes based on the ratings context
  const ratedPerfumes = useMemo(() => {
    if (isLoadingPerfumes || !allPerfumes.length) return [];

    const ratedIds = new Set(ratings.map(r => r.perfumeId)); // Correctly map array to set of IDs
    return allPerfumes.filter(perfume => ratedIds.has(perfume.id));
  }, [ratings, allPerfumes, isLoadingPerfumes]);

  // Get perfumes to be rated:
  // These are perfumes from storage (ordered by the user) that are not yet rated.
  const porCalificarPerfumes = useMemo(() => {
    if (isLoadingPerfumes || isLoadingRatings || isLoadingOrderedPerfumeIds || !allPerfumes.length) return [];

    const ratedIds = new Set(ratings.map(r => r.perfumeId));
    const orderedSet = new Set(orderedPerfumeIdsFromOrders);

    return allPerfumes.filter(perfume =>
      orderedSet.has(perfume.id) && !ratedIds.has(perfume.id)
    );
  }, [ratings, allPerfumes, orderedPerfumeIdsFromOrders, isLoadingPerfumes, isLoadingRatings, isLoadingOrderedPerfumeIds]);

  // Determine which list to display based on search query and active tab
  const perfumesToDisplay = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    return activeTab === 'calificados' ? ratedPerfumes : porCalificarPerfumes;
  }, [searchQuery, searchResults, activeTab, ratedPerfumes, porCalificarPerfumes]);

  // --- Handlers ---

  const handlePerfumePress = (perfume: DisplayPerfume) => {
    // Set the selected perfume regardless of authentication status
    // The RatingModal will handle the authentication check and potential redirect
    setSelectedPerfume(perfume);
    setIsRatingModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsRatingModalVisible(false);
    setSelectedPerfume(null);
    // Optionally clear search after rating?
    // setSearchQuery('');
  };

  // Handle text input for search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // Actual search will be triggered by the useEffect with debounce
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // --- Render Functions ---

  // Render perfume card
  const renderPerfumeCard = (perfume: DisplayPerfume) => {
    const ratingInfo = getRating(perfume.id); // Get rating info using the function

    return (
      <TouchableOpacity
        key={perfume.id}
        style={[styles.cardContainer, isDesktop && { width: '17%' }]}
        onPress={() => handlePerfumePress(perfume)}
      >
        <Image
          source={{ uri: perfume.image }}
          style={styles.perfumeImage}
          resizeMode="contain"
        />
        <View style={styles.cardContent}>
          <Text style={styles.brandText}>{perfume.brand}</Text>
          <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">{perfume.name}</Text>
          {/* Display rating stars only if the perfume has been rated */}
          {ratingInfo && (
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= ratingInfo.rating ? "star" : "star-outline"}
                  size={12}
                  color="#FFD700"
                />
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // --- Loading State ---

  if (isLoadingRatings || isLoadingPerfumes || isLoadingOrderedPerfumeIds) { // Check all relevant loading states
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando perfumes...</Text>
      </SafeAreaView>
    );
  }

  // --- Main Render ---

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'web' && window.innerWidth >= 1024 && <View style={{ marginTop: 80 }} />}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Perfumes</Text>
      </View>

      {/* Authentication Status Indicator */}
      {!isAuthenticated && (
        <View style={styles.authStatusContainer}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.authStatusText}>
            Tus calificaciones se guardan localmente. Inicia sesión para sincronizarlas.
          </Text>
        </View>
      )}

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar perfumes..." // Updated placeholder
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearSearchButton}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Conditionally render Tabs or Search Results Info */}
      {!searchQuery.trim() ? (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'porCalificar' && styles.activeTab]}
            onPress={() => setActiveTab('porCalificar')}
          >
            <Text style={[styles.tabText, activeTab === 'porCalificar' && styles.activeTabText]}>
              Por Calificar ({porCalificarPerfumes.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calificados' && styles.activeTab]}
            onPress={() => setActiveTab('calificados')}
          >
            <Text style={[styles.tabText, activeTab === 'calificados' && styles.activeTabText]}>
              Calificados ({ratedPerfumes.length})
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            {isSearching
              ? "Buscando..."
              : `Mostrando ${searchResults.length} resultado(s) para "${searchQuery}"`}
          </Text>
        </View>
      )}

      {/* Perfume Cards Grid */}
      <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.PRIMARY} />
          </View>
        ) : perfumesToDisplay.length > 0 ? (
          <View style={styles.cardsGrid}>
            {perfumesToDisplay.map(perfume => renderPerfumeCard(perfume))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim()
                ? 'No se encontraron perfumes.'
                : (activeTab === 'calificados'
                    ? 'Aún no has calificado perfumes.'
                    : 'No hay perfumes por calificar.')
              }
            </Text>
            <Ionicons
              name={searchQuery.trim()
                ? "search-outline"
                : (activeTab === 'calificados' ? "star-outline" : "list-outline")
              }
              size={40}
              color={COLORS.TEXT_SECONDARY}
              style={{ marginTop: SPACING.MEDIUM }}
            />
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      {selectedPerfume && (
        <RatingModal
          visible={isRatingModalVisible}
          onClose={handleCloseModal}
          perfume={selectedPerfume} // Pass the simplified perfume object
        />
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
      marginTop: SPACING.MEDIUM,
      fontSize: FONT_SIZES.REGULAR,
      color: COLORS.TEXT_SECONDARY,
      fontFamily: FONTS.INSTRUMENT_SANS,
  },
  header: {
    paddingHorizontal: SPACING.LARGE,
    paddingTop: SPACING.MEDIUM,
    paddingBottom: SPACING.SMALL,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  authStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: SPACING.SMALL,
  },
  authStatusText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
    fontFamily: FONTS.INSTRUMENT_SANS,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginHorizontal: SPACING.LARGE,
    paddingHorizontal: SPACING.MEDIUM,
    height: 52,
    marginBottom: SPACING.MEDIUM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: SPACING.MEDIUM,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  clearSearchButton: {
      paddingLeft: SPACING.SMALL,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.LARGE,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: SPACING.SMALL / 2,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.MEDIUM,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.BACKGROUND,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  activeTabText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  searchResultsInfo: {
      paddingHorizontal: SPACING.LARGE,
      marginBottom: SPACING.MEDIUM,
  },
  searchResultsText: {
      fontSize: FONT_SIZES.SMALL,
      color: COLORS.TEXT_SECONDARY,
      fontFamily: FONTS.INSTRUMENT_SANS,
  },
  cardsContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: SPACING.LARGE - SPACING.SMALL / 2,
    marginBottom: 40,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: SPACING.LARGE, // Add padding at the bottom
  },
  cardContainer: {
    width: '48%', // Ensures two cards per row with spacing
    marginBottom: SPACING.LARGE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.BACKGROUND,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  perfumeImage: {
    width: '100%',
    height: 100,
    marginTop: 10,
    backgroundColor: COLORS.BACKGROUND, // Lighter background for image
  },
  cardContent: {
    padding: SPACING.MEDIUM,
  },
  brandText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  nameText: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS, // Use consistent font
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: SPACING.SMALL / 2, // Add some top margin
  },
  emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.LARGE,
      marginTop: SPACING.XLARGE, // Push it down a bit
  },
  emptyStateText: {
      fontSize: FONT_SIZES.REGULAR,
      color: COLORS.TEXT_SECONDARY,
      textAlign: 'center',
      fontFamily: FONTS.INSTRUMENT_SANS,
  },
});