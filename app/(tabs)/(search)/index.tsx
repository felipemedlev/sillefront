import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native'; // Add ScrollView
import { Platform, useWindowDimensions } from 'react-native';
import { fetchPerfumes } from '../../../src/services/api';
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
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Original state declarations - moved up
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initialFilters);
  const [activeSort, setActiveSort] = useState<ActiveSort>(initialSort);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const modalRef = useRef<PerfumeModalRef>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  // Debounce state for triggering API calls - declared *after* dependencies
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [debouncedFilters, setDebouncedFilters] = useState(activeFilters);

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Debounce filters (no delay needed if applied via modal "Apply" button)
  React.useEffect(() => {
    setDebouncedFilters(activeFilters);
  }, [activeFilters]);


  const loadPerfumes = async (pageToLoad = 1, query = debouncedSearchQuery, filters = debouncedFilters) => {
    // Reset list only if it's a new search/filter (page 1)
    const isNewQuery = pageToLoad === 1;
    if (isNewQuery) {
       setPerfumes([]); // Clear previous results immediately for new search/filter
       setHasNextPage(true); // Assume there are results initially
       setPage(1); // Reset page number
    }

    // Prevent fetching more if already loading or no more pages for the *current* query/filters
    if (isLoading || (!isNewQuery && !hasNextPage)) return;

    console.log(`Loading perfumes - Page: ${pageToLoad}, Query: '${query}', Filters:`, filters);
    setIsLoading(true);

    try {
      // Pass search and filters to the API call
      const data = await fetchPerfumes(pageToLoad, 20, query, filters);
      console.log('Fetched perfumes page', pageToLoad, data);
      const newResults = data.results ?? [];

      setPerfumes(prev => isNewQuery ? newResults : [...prev, ...newResults]);
      setHasNextPage(!!data.next);
      setPage(pageToLoad); // Update page state

    } catch (error) {
      console.error('Error fetching perfumes:', error);
      // Optionally reset state or show error message
      // setPerfumes([]);
      // setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Load perfumes when debounced search/filters change
  React.useEffect(() => {
    // Load page 1 with the new debounced query and filters
    loadPerfumes(1, debouncedSearchQuery, debouncedFilters);
  }, [debouncedSearchQuery, debouncedFilters]); // Depend on debounced values

  const loadMorePerfumes = () => {
    // Pass current debounced query/filters when loading more
    if (!isLoading && hasNextPage) {
      loadPerfumes(page + 1, debouncedSearchQuery, debouncedFilters);
    }
  };
  // Removed duplicate state declarations

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
    return perfumes
      .filter(perfume => (perfume as any).external_id != null) // Ensure external_id exists
      .map(perfume => ({
        ...perfume,
        // Use external_id consistently and convert to string
        id: String((perfume as any).external_id),
        matchPercentage: (perfume as any).match_percentage ?? getMockMatchPercentage(perfume),
        overallRating: (perfume as any).overall_rating,
        priceValueRating: (perfume as any).price_value_rating,
        bestFor: (perfume as any).best_for,
        longevityRating: (perfume as any).longevity_rating,
        sillageRating: (perfume as any).sillage_rating,
        // Ensure similarPerfumeIds are strings too, if they exist
        similarPerfumes: ((perfume as any).similar_perfume_ids ?? []).map(String), // Match type definition
        season: (perfume as any).season,
        gender: (perfume as any).gender,
        topNotes: (perfume as any).top_notes,
        middleNotes: (perfume as any).middle_notes,
        baseNotes: (perfume as any).base_notes,
      }));
  }, [perfumes]);

  // Client-side filtering removed - handled by backend

  // --- Sorted Perfumes ---
  // Sorting should ideally also be done server-side via query params (?ordering=...)
  // For now, keep client-side sorting on the fetched results.
  const sortedPerfumes = useMemo(() => {
    // Sort the mapped perfumes (perfumesWithMatch)
    if (!activeSort.field || !activeSort.direction) return perfumesWithMatch;
    const sorted = [...perfumesWithMatch].sort((a, b) => {
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
  }, [perfumesWithMatch, activeSort]); // Depend on the mapped list

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
        perfumes={sortedPerfumes} // Use sorted list from backend results
        onPerfumePress={handlePerfumePress}
        onEndReached={loadMorePerfumes}
        onEndReachedThreshold={0.5}
      />
      <PerfumeModal
        ref={modalRef}
        perfume={selectedPerfume}
        perfumeList={perfumesWithMatch}
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