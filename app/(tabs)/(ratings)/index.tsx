import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Removed Feather import
import RatingModal from '../../../components/RatingModal';
import { useRatings } from '../../../context/RatingsContext';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants';

// Define perfume type (Keep updated: id to string, added aiMatch)
interface Perfume {
  id: string;
  name: string;
  brand: string;
  image: string;
  aiMatch?: number; // Keep AI Match percentage for potential future use if needed
}

export default function RatingsScreen() {
  const [activeTab, setActiveTab] = useState('calificados');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  // Use context hooks for ratings (Removed favorite hooks)
  const { getRating, isLoadingRatings, isLoadingFavorites } = useRatings(); // Keep loading states

  // Filter perfumes based on search query
  const filterPerfumes = (perfumes: Perfume[]) => {
    if (!searchQuery.trim()) return perfumes;

    const query = searchQuery.toLowerCase().trim();
    return perfumes.filter(perfume =>
      perfume.name.toLowerCase().includes(query) ||
      perfume.brand.toLowerCase().includes(query)
    );
  };

  // Mock data for perfume cards (Keep updated: id to string, added aiMatch)
  const calificadosPerfumes: Perfume[] = [
    { id: '53', name: 'Shalimar', brand: 'Guerlain', image: 'https://fimgs.net/mdimg/perfume/s.53.jpg', aiMatch: 85 },
    { id: '9828', name: 'Aventus', brand: 'Creed', image: 'https://fimgs.net/mdimg/perfume/s.9828.jpg', aiMatch: 92 },
  ];

  const porCalificarPerfumes: Perfume[] = [
    { id: '33519', name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', image: 'https://fimgs.net/mdimg/perfume/s.33519.jpg', aiMatch: 78 },
    { id: '1825', name: 'Tobacco Vanille', brand: 'Tom Ford', image: 'https://fimgs.net/mdimg/perfume/s.1825.jpg', aiMatch: 65 },
  ];

  const handlePerfumePress = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
    setIsRatingModalVisible(true);
  };

  // Render perfume card (Reverted to original structure)
  const renderPerfumeCard = (perfume: Perfume) => {
    const rating = getRating(perfume.id); // Use string ID

    return (
      <TouchableOpacity
        key={perfume.id}
        style={styles.cardContainer} // Use original card container style
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
          {rating && (
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= rating.rating ? "star" : "star-outline"}
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

  if (isLoadingRatings || isLoadingFavorites) { // Still check both loading states
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading perfumes...</Text>
      </SafeAreaView>
    );
  }

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
          placeholder="Buscar en mis perfumes..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'porCalificar' && styles.activeTab]}
          onPress={() => setActiveTab('porCalificar')}
        >
          <Text style={[styles.tabText, activeTab === 'porCalificar' && styles.activeTabText]}>Por Calificar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'calificados' && styles.activeTab]}
          onPress={() => setActiveTab('calificados')}
        >
          <Text style={[styles.tabText, activeTab === 'calificados' && styles.activeTabText]}>Calificados</Text>
        </TouchableOpacity>
      </View>

      {/* Perfume Cards Grid */}
      <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsGrid}>
          {filterPerfumes(activeTab === 'calificados' ? calificadosPerfumes : porCalificarPerfumes)
            .map(perfume => renderPerfumeCard(perfume))
          }
        </View>
      </ScrollView>

      {/* Rating Modal */}
      {selectedPerfume && (
        <RatingModal
          visible={isRatingModalVisible}
          onClose={() => {
            setIsRatingModalVisible(false);
            setSelectedPerfume(null);
          }}
          perfume={selectedPerfume}
        />
      )}
    </SafeAreaView>
  );
}

// Reverted styles to original structure
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
    fontFamily: FONTS.INSTRUMENT_SANS, // Keep font usage
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
  cardsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.LARGE - SPACING.SMALL / 2,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Original card container style
  cardContainer: {
    width: '48%',
    marginBottom: SPACING.LARGE,
    borderRadius: 16,
    overflow: 'hidden', // Keep overflow hidden here
    backgroundColor: COLORS.BACKGROUND,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Original shadow
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Original elevation
  },
  perfumeImage: {
    width: '100%',
    height: 140, // Keep updated height
    backgroundColor: COLORS.BACKGROUND,
  },
  cardContent: {
    padding: SPACING.MEDIUM, // Original padding
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
    // fontFamily: FONTS.INSTRUMENT_SERIF, // Removed specific font
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  // Removed action bar styles
});