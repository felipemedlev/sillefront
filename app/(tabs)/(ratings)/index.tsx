import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingModal from '../../../components/RatingModal';
import { useRatings } from '../../../context/RatingsContext';

// Define perfume type
interface Perfume {
  id: number;
  name: string;
  brand: string;
  image: string;
}

export default function RatingsScreen() {
  const [activeTab, setActiveTab] = useState('calificados');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const { getRating } = useRatings();

  // Filter perfumes based on search query
  const filterPerfumes = (perfumes: Perfume[]) => {
    if (!searchQuery.trim()) return perfumes;

    const query = searchQuery.toLowerCase().trim();
    return perfumes.filter(perfume =>
      perfume.name.toLowerCase().includes(query) ||
      perfume.brand.toLowerCase().includes(query)
    );
  };

  // Mock data for perfume cards
  const calificadosPerfumes: Perfume[] = [
    { id: 1, name: 'Shalimar', brand: 'Guerlain', image: 'https://fimgs.net/mdimg/perfume/s.53.jpg' },
    { id: 2, name: 'Aventus', brand: 'Creed', image: 'https://fimgs.net/mdimg/perfume/s.9828.jpg' },
  ];

  const porCalificarPerfumes: Perfume[] = [
    { id: 3, name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', image: 'https://fimgs.net/mdimg/perfume/s.33519.jpg' },
    { id: 4, name: 'Tobacco Vanille', brand: 'Tom Ford', image: 'https://fimgs.net/mdimg/perfume/s.1825.jpg' },
  ];

  const handlePerfumePress = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
    setIsRatingModalVisible(true);
  };

  // Render perfume card
  const renderPerfumeCard = (perfume: Perfume) => {
    const rating = getRating(perfume.id);

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
          <Text style={styles.nameText}>{perfume.name}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222222',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#222222',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    color: '#717171',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#222222',
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  perfumeImage: {
    width: '100%',
    height: 120,
    borderRadius: 12
  },
  cardContent: {
    padding: 12,
  },
  brandText: {
    fontSize: 13,
    color: '#717171',
    marginBottom: 4,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});