import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native'; // Add ScrollView
import { Platform, useWindowDimensions } from 'react-native';
import { MOCK_PERFUMES } from '../../../data/mockPerfumes';
import { Perfume } from '../../../types/perfume';
import SearchBar from '../../../components/search/SearchBar';
import SearchResults from '../../../components/search/SearchResults';
import PerfumeModal from '../../../components/product/PerfumeModal';
import { PerfumeModalRef } from '../../../components/product/PerfumeModal';
import FilterModal from '../../../components/search/FilterModal'; // Import FilterModal
import { router } from 'expo-router';

const DESKTOP_BREAKPOINT = 768;

// --- Filter & Sort State ---
interface ActiveFilters {
  brands: string[];
  occasions: string[];
  priceRange: { min: number; max: number } | null;
  genders: string[]; // 'masculino', 'femenino', 'unisex'
  dayNights: string[]; // 'Día', 'Noche', 'Ambos'
  seasons: string[]; // 'Invierno', 'Otoño', 'Primavera', 'Verano'
}
const initialFilters: ActiveFilters = {
  brands: [],
  occasions: [],
  priceRange: null,
  genders: [],
  dayNights: [],
  seasons: [],
};

type SortDirection = 'asc' | 'desc' | null;
interface ActiveSort {
  field: keyof Perfume | 'matchPercentage' | null;
  direction: SortDirection;
}
const initialSort: ActiveSort = { field: null, direction: null };

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initialFilters);
  const [activeSort, setActiveSort] = useState<ActiveSort>(initialSort);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const modalRef = useRef<PerfumeModalRef>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  // --- Handlers ---
  const handleSortPress = (field: ActiveSort['field']) => {
    setActiveSort(currentSort => {
      let newDirection: SortDirection = 'asc'; // Default to ascending
      if (currentSort.field === field) {
        // Toggle direction if same field is pressed
        if (currentSort.direction === 'asc') newDirection = 'desc';
        else if (currentSort.direction === 'desc') newDirection = null; // Third press clears
        else newDirection = 'asc'; // If null, start with asc
      }
      // If direction becomes null, clear the field too
      const newField = newDirection === null ? null : field;
      return { field: newField, direction: newDirection };
    });
  };

  // --- Sort Options ---
  const sortOptions: { label: string; field: ActiveSort['field'] }[] = [
    { label: 'Precio', field: 'pricePerML' },
    { label: 'Match AI', field: 'matchPercentage' },
    { label: 'Valoración', field: 'overallRating' },
    { label: 'Duración', field: 'longevityRating' },
    { label: 'Estela', field: 'sillageRating' },
    { label: 'Calidad/Precio', field: 'priceValueRating' },
  ];

  // Generate deterministic mock match percentages for each perfume
  function getMockMatchPercentage(perfume: Perfume): number {
    const str = (perfume as any).id ?? perfume.name;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const normalized = Math.abs(hash % 31); // 0-30
    return 70 + normalized; // 70-100%
  }

  const perfumesWithMatch = useMemo(() => {
    return MOCK_PERFUMES.map(perfume => ({
      ...perfume,
      matchPercentage: getMockMatchPercentage(perfume)
    }));
  }, []);

  // Filter perfumes based on search query and active filters
  const filteredPerfumes = useMemo(() => {
    return perfumesWithMatch.filter((perfume) => {
      const query = searchQuery.toLowerCase();
      if (
        query &&
        !perfume.name.toLowerCase().includes(query) &&
        !perfume.brand.toLowerCase().includes(query)
      ) {
        return false;
      }

      if (
        activeFilters.brands.length > 0 &&
        !activeFilters.brands.includes(perfume.brand)
      ) {
        return false;
      }

      if (
        activeFilters.occasions.length > 0 &&
        (!perfume.occasions ||
          !perfume.occasions.some((o) => activeFilters.occasions.includes(o)))
      ) {
        return false;
      }

      if (
        activeFilters.priceRange &&
        ((perfume.pricePerML ?? 0) < activeFilters.priceRange.min ||
          (perfume.pricePerML ?? 0) > activeFilters.priceRange.max)
      ) {
        return false;
      }

      if (
        activeFilters.genders.length > 0 &&
        !activeFilters.genders.includes(perfume.gender)
      ) {
        return false;
      }

      // Day/Night filter
      if (
        activeFilters.dayNights.length > 0 &&
        !activeFilters.dayNights.some((filterVal) => {
          if (filterVal === 'Día') return (perfume.dayNightRating ?? 0.5) >= 0.66;
          if (filterVal === 'Noche') return (perfume.dayNightRating ?? 0.5) <= 0.33;
          if (filterVal === 'Ambos') return (perfume.dayNightRating ?? 0.5) > 0.33 && (perfume.dayNightRating ?? 0.5) < 0.66;
          return false;
        })
      ) {
        return false;
      }

      // Season filter
      if (
        activeFilters.seasons.length > 0 &&
        !activeFilters.seasons.some((filterVal) => {
          if (filterVal === 'Invierno') return (perfume.seasonRating ?? 0.5) <= 0.25;
          if (filterVal === 'Otoño') return (perfume.seasonRating ?? 0.5) > 0.25 && (perfume.seasonRating ?? 0.5) <= 0.5;
          if (filterVal === 'Primavera') return (perfume.seasonRating ?? 0.5) > 0.5 && (perfume.seasonRating ?? 0.5) <= 0.75;
          if (filterVal === 'Verano') return (perfume.seasonRating ?? 0.5) > 0.75;
          return false;
        })
      ) {
        return false;
      }

      return true;
    });
  }, [searchQuery, perfumesWithMatch, activeFilters]);

  // --- Sorted Perfumes ---
  const sortedAndFilteredPerfumes = useMemo(() => {
    if (!activeSort.field || !activeSort.direction) return filteredPerfumes;
    const sorted = [...filteredPerfumes].sort((a, b) => {
      const aVal = activeSort.field === 'matchPercentage' ? (a as any).matchPercentage : (a as any)[activeSort.field as keyof Perfume];
      const bVal = activeSort.field === 'matchPercentage' ? (b as any).matchPercentage : (b as any)[activeSort.field as keyof Perfume];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return activeSort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return activeSort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  }, [filteredPerfumes, activeSort]);

  const handlePerfumePress = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
    modalRef.current?.show(perfume);
  };

  const handleManualBoxPress = () => {
    router.push('/manual-box');
  };

  return (
    <View style={styles.container}>
      {isDesktop && <View style={{ marginTop: 80 }} />}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onManualBoxPress={handleManualBoxPress}
        onFilterPress={() => setIsFilterModalVisible(true)} // Pass filter press handler
      />

      {/* Sort Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortButtonsContainer}
        style={{ minHeight: 50, flexGrow: 0 }}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.field}
            style={[
              styles.sortButton,
              activeSort.field === option.field && styles.sortButtonActive,
            ]}
            onPress={() => handleSortPress(option.field)}
          >
            <Text
              style={[
                styles.sortButtonText,
                activeSort.field === option.field && styles.sortButtonTextActive,
              ]}
            >
              {option.label}
              {activeSort.field === option.field && activeSort.direction === 'asc' && ' ↑'}
              {activeSort.field === option.field && activeSort.direction === 'desc' && ' ↓'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SearchResults
        perfumes={sortedAndFilteredPerfumes} // Use sorted list
        onPerfumePress={handlePerfumePress}
      />
      <PerfumeModal
        ref={modalRef}
        perfume={selectedPerfume}
        onClose={() => setSelectedPerfume(null)}
      />

      {/* Filter Modal */}
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        initialFilters={activeFilters}
        onApplyFilters={setActiveFilters}
        allBrands={Array.from(new Set(perfumesWithMatch.flatMap(p => p.brand)))}
        allOccasions={Array.from(new Set(perfumesWithMatch.flatMap(p => p.occasions ?? [])))}
        minPrice={Math.min(...perfumesWithMatch.map(p => p.pricePerML ?? 0))}
        maxPrice={Math.max(...perfumesWithMatch.map(p => p.pricePerML ?? 0))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC'
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFEFC',
  },
  sortButton: {
    paddingVertical: 0,
    paddingHorizontal:14,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8', // Original light gray background
    justifyContent: 'center',
    alignItems: 'center'
  },
  sortButtonActive: {
    backgroundColor: '#809CAC', // Use a theme color
    borderColor: '#809CAC',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#555',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});