import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingModal from '../../../components/RatingModal';
import { useRatings } from '../../../context/RatingsContext';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants';
import { MOCK_PERFUMES } from '../../../data/mockPerfumes'; // Import all mock perfumes

// Define the simplified perfume type needed for this screen
interface DisplayPerfume {
  id: string;
  name: string;
  brand: string;
  image: string;
}

// Map the full mock data to the simplified structure needed for display
const allPerfumes: DisplayPerfume[] = MOCK_PERFUMES.map(p => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  image: p.thumbnailUrl, // Use thumbnailUrl for the image
}));

export default function RatingsScreen() {
  const [activeTab, setActiveTab] = useState('calificados');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<DisplayPerfume | null>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const { ratings, getRating, isLoadingRatings } = useRatings(); // Use ratings map directly

  // --- Data Derivation ---

  // Get rated perfumes based on the ratings context
  const ratedPerfumes = useMemo(() => {
    const ratedIds = new Set(ratings.map(r => r.perfumeId)); // Correctly map array to set of IDs
    return allPerfumes.filter(perfume => ratedIds.has(perfume.id));
  }, [ratings]);

  // Get perfumes to be rated (initially all perfumes not yet rated)
  // TODO: Integrate logic for "ordered" perfumes. Currently shows all unrated perfumes.
  const porCalificarPerfumes = useMemo(() => {
    const ratedIds = new Set(ratings.map(r => r.perfumeId)); // Correctly map array to set of IDs
    return allPerfumes.filter(perfume => !ratedIds.has(perfume.id));
  }, [ratings]);

  // Filter perfumes based on search query (searches across ALL perfumes)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []; // Return empty if no search query

    const query = searchQuery.toLowerCase().trim();
    return allPerfumes.filter(perfume =>
      perfume.name.toLowerCase().includes(query) ||
      perfume.brand.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Determine which list to display based on search query and active tab
  const perfumesToDisplay = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    return activeTab === 'calificados' ? ratedPerfumes : porCalificarPerfumes;
  }, [searchQuery, searchResults, activeTab, ratedPerfumes, porCalificarPerfumes]);

  // --- Handlers ---

  const handlePerfumePress = (perfume: DisplayPerfume) => {
    setSelectedPerfume(perfume);
    setIsRatingModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsRatingModalVisible(false);
    setSelectedPerfume(null);
    // Optionally clear search after rating?
    // setSearchQuery('');
  };

  // --- Render Functions ---

  // Render perfume card
  const renderPerfumeCard = (perfume: DisplayPerfume) => {
    const ratingInfo = getRating(perfume.id); // Get rating info using the function

    return (
      <TouchableOpacity
        key={perfume.id}
        style={styles.cardContainer}
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

  if (isLoadingRatings) { // Only check ratings loading state
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading perfumes...</Text>
      </SafeAreaView>
    );
  }

  // --- Main Render ---

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Perfumes</Text>
      </View>

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar perfumes..." // Updated placeholder
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
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
                Mostrando {searchResults.length} resultado(s) para "{searchQuery}"
            </Text>
        </View>
      )}

      {/* Perfume Cards Grid */}
      <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        {perfumesToDisplay.length > 0 ? (
            <View style={styles.cardsGrid}>
              {perfumesToDisplay.map(perfume => renderPerfumeCard(perfume))}
            </View>
        ) : (
            <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                    {searchQuery.trim() ? 'No se encontraron perfumes.' : (activeTab === 'calificados' ? 'Aún no has calificado perfumes.' : 'No hay perfumes por calificar.')}
                </Text>
                 {/* Optional: Add an icon or illustration for empty state */}
                 <Ionicons name={searchQuery.trim() ? "search-outline" : (activeTab === 'calificados' ? "star-outline" : "list-outline")} size={40} color={COLORS.TEXT_SECONDARY} style={{ marginTop: SPACING.MEDIUM }}/>
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
    marginBottom: SPACING.MEDIUM,
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
    paddingHorizontal: SPACING.LARGE - SPACING.SMALL / 2,
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
    height: 140,
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