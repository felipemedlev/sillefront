import React, { useState, useRef, useMemo, useEffect } from 'react'; // Add useEffect
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native'; // Add ScrollView
import { useWindowDimensions } from 'react-native';
import { fetchPerfumes, fetchBrands, fetchOccasions } from '../../../src/services/api'; // Import fetchOccasions
import { Perfume } from '../../../types/perfume';
import SearchBar from '../../../components/search/SearchBar';
import SearchResults from '../../../components/search/SearchResults';
import PerfumeModal from '../../../components/product/PerfumeModal';
import { PerfumeModalRef } from '../../../components/product/PerfumeModal';
import FilterDrawer from '../../../components/search/FilterDrawer'; // Import FilterDrawer instead of FilterModal
import { router } from 'expo-router';

const DESKTOP_BREAKPOINT = 768;
interface Brand {
  id: number;
  name: string;
}

interface Occasion {
  id: number;
  name: string;
}

// --- Filter & Sort State ---
interface ActiveFilters {
  brands: number[]; // Store brand IDs instead of names
  occasions: number[]; // Store Occasion IDs
  priceRange: { min: number; max: number } | null;
  genders: string[]; // 'masculino', 'femenino', 'unisex'
  dayNights: string[]; // 'Día', 'Noche', 'Ambos'
  seasons: string[]; // 'Invierno', 'Otoño', 'Primavera', 'Verano'
}
const initialFilters: ActiveFilters = {
  brands: [], // Initialize with empty array of numbers
  occasions: [], // Initialize with empty array of numbers
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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false); // Renamed from isFilterModalVisible
  const modalRef = useRef<PerfumeModalRef>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [allAvailableBrands, setAllAvailableBrands] = useState<Brand[]>([]); // State for all brands
  const [allAvailableOccasions, setAllAvailableOccasions] = useState<Occasion[]>([]); // State for all occasions

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
    // console.log("Setting debounced filters from active filters:", JSON.stringify(activeFilters, null, 2));
    // Use setTimeout to ensure this happens asynchronously
    const timeout = setTimeout(() => {
      setDebouncedFilters(activeFilters);
    }, 50); // Small delay to ensure any other state updates have settled

    return () => clearTimeout(timeout);
  }, [activeFilters]);


  const loadPerfumes = async (pageToLoad = 1, query = debouncedSearchQuery, filters = debouncedFilters) => {
    // Reset list only if it's a new search/filter (page 1)
    const isNewQuery = pageToLoad === 1;
    if (isNewQuery) {
       // setPerfumes([]); // Removed: Clearing is handled by the update logic below
       setHasNextPage(true); // Assume there are results initially
       setPage(1); // Reset page number
    }

    // Prevent fetching more if already loading or no more pages for the *current* query/filters
    if (isLoading || (!isNewQuery && !hasNextPage)) return;

    // console.log(`Loading perfumes - Page: ${pageToLoad}, Query: '${query}'`);
    // console.log('Filters being sent to API:', JSON.stringify(filters, null, 2));
    setIsLoading(true);

    try {
      // Pass search and filters to the API call
      const data = await fetchPerfumes(pageToLoad, 20, query, filters);
      // console.log(`Fetched perfumes page ${pageToLoad}, results count:`, data.results?.length || 0);
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
    // console.log("Effect triggered: Loading page 1 due to query/filter change.", { debouncedSearchQuery, debouncedFilters });
    loadPerfumes(1, debouncedSearchQuery, debouncedFilters);
  }, [debouncedSearchQuery, debouncedFilters]); // Depend on debounced values

  // Fetch all brands on mount
  useEffect(() => {
    const loadAllBrands = async () => {
      try {
        // console.log("Fetching all available brands...");
        const brandsData = await fetchBrands();
        // console.log("Fetched brands:", brandsData);
        setAllAvailableBrands(brandsData || []); // Ensure it's an array
      } catch (error) {
        console.error('Error fetching all brands:', error);
        setAllAvailableBrands([]); // Set empty array on error
      }
    };
    const loadAllOccasions = async () => {
      try {
        // console.log("Fetching all available occasions...");
        const occasionsData = await fetchOccasions(); // Assuming fetchOccasions exists
        // console.log("Fetched occasions:", occasionsData);
        setAllAvailableOccasions(occasionsData || []); // Ensure it's an array
      } catch (error) {
        console.error('Error fetching all occasions:', error);
        setAllAvailableOccasions([]); // Set empty array on error
      }
    };
    loadAllBrands();
    loadAllOccasions();
  }, []); // Empty dependency array means run once on mount

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

  // Wrapper function to log applied filters
  const handleApplyFilters = (newFilters: ActiveFilters) => {
    console.log("Applying filters from drawer:", newFilters);
    setActiveFilters(newFilters);
  };

  // --- Sort Options ---
  const sortOptions: { label: string; field: ActiveSort['field'] }[] = [
    { label: 'Precio', field: 'pricePerML' },
    { label: 'Match AI', field: 'matchPercentage' },
    { label: 'Valoración', field: 'overall_rating' },
    { label: 'Duración', field: 'longevity_rating' },
    { label: 'Estela', field: 'sillage_rating' },
    { label: 'Calidad/Precio', field: 'price_value_rating' },
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
      .map(perfume => {
          // Ensure brand is treated as an object { id: number, name: string }
          // If the API returns brand as just an ID or name, this needs adjustment
          const brandData = (perfume as any).brand;
          const brandObj = typeof brandData === 'object' && brandData !== null ? brandData : { id: null, name: String(brandData) };

          return {
              ...perfume,
              brand: brandObj, // Ensure brand is an object
              // Use external_id consistently and convert to string
              id: String((perfume as any).external_id),
              matchPercentage: (perfume as any).match_percentage ?? getMockMatchPercentage(perfume),
              overall_rating: (perfume as any).overall_rating, // Use snake_case from API
              price_value_rating: (perfume as any).price_value_rating, // Use snake_case
              best_for: (perfume as any).best_for, // Use snake_case
              longevity_rating: (perfume as any).longevity_rating, // Use snake_case
              sillage_rating: (perfume as any).sillage_rating, // Use snake_case
              // Ensure similarPerfumeIds are strings too, if they exist
              similarPerfumes: ((perfume as any).similar_perfume_ids ?? []).map(String), // Match type definition
              season: (perfume as any).season,
              gender: (perfume as any).gender,
              topNotes: (perfume as any).top_notes,
              middleNotes: (perfume as any).middle_notes,
              baseNotes: (perfume as any).base_notes,
          };
      });
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
        onFilterPress={() => setIsFilterDrawerOpen(true)} // Updated to use new state
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

      {/* Filter Drawer */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        initialFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        allBrands={allAvailableBrands}
        allOccasions={allAvailableOccasions}
        minPrice={0} // Simple default
        maxPrice={Math.max(100, ...perfumesWithMatch.map(p => {
          const price = parseFloat(String((p as any).pricePerML ?? 0));
          return isNaN(price) ? 0 : price;
        }))}
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