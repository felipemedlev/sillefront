import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MOCK_PERFUMES } from '../../aibox-selection';
import { Perfume } from '../../../types/perfume';
import SearchBar from '../../../components/search/SearchBar';
import SearchResults from '../../../components/search/SearchResults';
import PerfumeModal from '../../../components/product/PerfumeModal';
import { PerfumeModalRef } from '../../../components/product/PerfumeModal';
import { router } from 'expo-router';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const modalRef = useRef<PerfumeModalRef>(null);

  // Generate consistent match percentages for each perfume
  const perfumesWithMatch = useMemo(() => {
    return MOCK_PERFUMES.map(perfume => ({
      ...perfume,
      matchPercentage: Math.floor(Math.random() * 30) + 70 // Mock match percentage between 70-100%
    }));
  }, []); // Empty dependency array means this only runs once when component mounts

  // Filter perfumes based on search query
  const filteredPerfumes = useMemo(() => {
    return perfumesWithMatch.filter((perfume) => {
      const query = searchQuery.toLowerCase();
      return (
        perfume.name.toLowerCase().includes(query) ||
        perfume.brand.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, perfumesWithMatch]);

  const handlePerfumePress = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
    modalRef.current?.show(perfume);
  };

  const handleManualBoxPress = () => {
    router.push('/manual-box');
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onManualBoxPress={handleManualBoxPress}
      />
      <SearchResults
        perfumes={filteredPerfumes}
        onPerfumePress={handlePerfumePress}
      />
      <PerfumeModal
        ref={modalRef}
        perfume={selectedPerfume}
        onClose={() => setSelectedPerfume(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
});