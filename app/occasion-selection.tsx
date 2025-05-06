import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, ActivityIndicator } from 'react-native'; // Import ActivityIndicator
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
// Remove MOCK_PERFUMES import
import PerfumeModal, { PerfumeModalRef } from '../components/product/PerfumeModal';
import { Perfume, BasicPerfumeInfo } from '../types/perfume';
import { useCart } from '../context/CartContext';
import { useSnackbar } from '../context/SnackbarContext'; // Import Snackbar context
import DecantSelector from '../components/product/DecantSelector';
import PriceRangeSlider from '../components/product/PriceRangeSlider';
import PerfumeList from '../components/product/PerfumeList';
import BottomBar from '../components/product/BottomBar';
import BoxVisualizer from '../components/product/BoxVisualizer';
// Import AIBoxProvider and related components/context
import AIBoxProvider from '../components/aibox/AIBoxProvider';
import AIBoxLoadingState from '../components/aibox/AIBoxLoadingState'; // Or use simpler loading
import AIBoxErrorState from '../components/aibox/AIBoxErrorState';     // Or use simpler error display

type DecantCount = 4 | 8;
type DecantSize = 3 | 5 | 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});

// Wrap the screen content logic in a new component to use context from AIBoxProvider
const OccasionSelectionContent: React.FC = () => {
  const { occasionNames } = useLocalSearchParams<{ occasionNames: string }>(); // Get occasionNames param
  const { addItemToCart } = useCart();

  // Local UI state
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string | null>(null);
  const [swappingPerfumeId, setSwappingPerfumeId] = useState<string | null>(null);
  // Removed feedbackMessage state
  const modalRef = useRef<PerfumeModalRef>(null);
  const sliderContainerRef = useRef<View>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Renamed ref

  // Get state and functions from AIBoxProvider context (passed via children function)
  // This assumes AIBoxProvider is wrapping this component and passing these props
  // We'll access these props inside the return statement where AIBoxProvider renders its children

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) { // Use renamed ref
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Removed useEffect for initializing mock data
  // Removed handleMaxPriceChange (handled by provider)

  const handlePerfumePress = useCallback((perfumeId: string) => {
    setSelectedPerfumeId(perfumeId);
  }, []);

  const handleSwapPress = useCallback((perfumeId: string) => {
    setSwappingPerfumeId(perfumeId);
    setSelectedPerfumeId(perfumeId);
  }, []);

  // handleSimilarPerfumeSelect needs access to setSelectedPerfumeIds from context
  const handleSimilarPerfumeSelect = useCallback((newPerfumeId: string, setSelectedPerfumeIdsFromContext: (ids: string[] | ((prev: string[]) => string[])) => void) => {
    if (swappingPerfumeId) {
      setSelectedPerfumeIdsFromContext(prev =>
        prev.map(id => id === swappingPerfumeId ? newPerfumeId : id)
      );
      modalRef.current?.hide();
    }
  }, [swappingPerfumeId]); // Dependency on swappingPerfumeId only

  const handleModalDismiss = useCallback(() => {
    setTimeout(() => {
      setSelectedPerfumeId(null);
      setSwappingPerfumeId(null);
    }, 100);
  }, []);

  // Placeholder functions for missing props
  const handleRemovePerfume = useCallback((perfumeId: string) => {
    console.log("Placeholder: Remove perfume", perfumeId);
    // TODO: Implement logic, likely using setSelectedPerfumeIds from context
  }, []);

  const handleReplacePerfume = useCallback((perfumeId: string) => {
    console.log("Placeholder: Replace perfume", perfumeId);
    // TODO: Implement logic, likely setting swappingPerfumeId and opening modal
    handleSwapPress(perfumeId); // Reuse existing swap logic for now
  }, [handleSwapPress]);

  // Removed incorrect handleSelectDecant placeholder

  // Removed calculateTotalPrice (handled by provider)

  // handleAddToCart needs access to context values
  const { showSnackbar } = useSnackbar(); // Use Snackbar context

  const handleAddToCart = useCallback(async (
    contextProps: {
      calculateTotalPrice: () => number;
      selectedPerfumeIds: string[];
      findPerfumeById: (id: string) => Perfume | undefined;
      decantCount: 4 | 8;
      decantSize: 3 | 5 | 10;
    }
  ) => {
    const { calculateTotalPrice, selectedPerfumeIds, findPerfumeById, decantCount, decantSize } = contextProps;
    const totalPrice = calculateTotalPrice();
    const perfumesInBox: BasicPerfumeInfo[] = selectedPerfumeIds
      .map(id => findPerfumeById(id)) // Use findPerfumeById from context
      .filter((p): p is Perfume => !!p)
      .map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        thumbnail_url: p.thumbnail_url, // Corrected property name here
        full_size_url: p.full_size_url,   // Corrected property name here
      }));

    const decodedOccasionName = occasionNames ? decodeURIComponent(occasionNames) : 'Personalizado';

    const itemData = {
      productType: 'OCCASION_BOX' as const,
      name: `Box Ocasión: ${decodedOccasionName} (${decantCount} x ${decantSize}ml)`, // Use occasion name in title
      details: {
        decantCount,
        decantSize,
        perfumes: perfumesInBox,
        occasion: decodedOccasionName, // Add occasion name to details
      },
      price: totalPrice,
      thumbnail_url: perfumesInBox[0]?.thumbnail_url, // Corrected property name to match type/backend
    };

    try {
      await addItemToCart(itemData);
      console.log('Occasion Box added to cart:', itemData);
      showSnackbar("¡Añadido al carro! Redirigiendo..."); // Show snackbar on success

      // Clear previous redirect timeout if any
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);

      // Set timeout only for redirect
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/(tabs)/(cart)');
      }, 2000); // Redirect after 2 seconds

    } catch (error) {
      console.error("Error adding Occasion Box to cart:", error);
      showSnackbar("Error al añadir."); // Show snackbar on error
    }
  }, [addItemToCart, occasionNames]); // Dependencies: addItemToCart, occasionNames


  // selectedPerfume needs findPerfumeById from context
  const getSelectedPerfume = (findPerfumeById: (id: string) => Perfume | undefined) => {
      return selectedPerfumeId ? findPerfumeById(selectedPerfumeId) : null;
  };

  // Effect to show modal when selectedPerfumeId changes
  // Needs findPerfumeById from context
  const useShowModalEffect = (findPerfumeById: (id: string) => Perfume | undefined) => {
      const selectedPerfume = getSelectedPerfume(findPerfumeById);
      useEffect(() => {
          if (selectedPerfume && modalRef.current) {
              modalRef.current.show(selectedPerfume);
          }
      }, [selectedPerfume]); // Dependency on the derived selectedPerfume
  };


  // --- Render Logic ---
  // This part now receives props from AIBoxProvider
  return (
    <AIBoxProvider>
      {(contextProps) => {
        const {
          isLoading, error, loadingMessage, recommendedPerfumes, selectedPerfumeIds,
          decantCount, decantSize, rangoPrecio, calculateTotalPrice, setDecantCount,
          setDecantSize, setRangoPrecio, setSelectedPerfumeIds, findPerfumeById,
          handlePriceChangeFinish, // Use renamed function
          loadRecommendations, setSelectedOccasionNames
        } = contextProps;

        // Effect to load recommendations based on occasionNames param
        useEffect(() => {
          const decodedOccasionName = occasionNames ? decodeURIComponent(occasionNames) : null;
          if (decodedOccasionName) {
            const occasionNameList = decodedOccasionName.split(','); // Handle potential multiple names
            setSelectedOccasionNames(occasionNameList); // Set occasion names in provider state
            // Explicitly trigger loadRecommendations with the correct occasion names and current price range
            loadRecommendations({ occasions: occasionNameList, priceRange: { min: rangoPrecio[0], max: rangoPrecio[1] } });
          } else {
            // Handle case where occasionNames is missing? Load default or show error?
            // For now, rely on provider's default load if names aren't set.
            console.warn("Occasion name parameter missing.");
          }
        }, [occasionNames, setSelectedOccasionNames, loadRecommendations]); // Removed rangoPrecio dependency

        // Hook to manage modal display based on selectedPerfumeId and context's findPerfumeById
        useShowModalEffect(findPerfumeById);
        const selectedPerfumeForModal = getSelectedPerfume(findPerfumeById);

const decodedOccasionTitle = occasionNames ? decodeURIComponent(occasionNames) : 'Selección';

// Define wrapper function inside the render prop scope to access setRangoPrecio
const handleRangeChangeWrapper = useCallback((values: number[]) => {
  if (values.length === 2) {
    setRangoPrecio(values as [number, number]);
  }
}, [setRangoPrecio]); // Dependency on setRangoPrecio from context


        return (
          <View style={[styles.container, { backgroundColor: '#F5F5F7' }]}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Feather name="chevron-left" size={24} color="#333" />
              </Pressable>
              <Text style={styles.headerTitle}>Box Ocasión: {decodedOccasionTitle}</Text>
            </View>

            {isLoading ? (
              // Use a simpler loading indicator or AIBoxLoadingState
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                 <ActivityIndicator size="large" />
                 <Text style={{ marginTop: 10 }}>{loadingMessage}</Text>
              </View>
            ) : error ? (
              // Use a simpler error display or AIBoxErrorState
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                 <Text style={{ color: 'red', textAlign: 'center' }}>Error: {error}</Text>
                 {/* Optionally add a retry button */}
                 {/* <Button title="Retry" onPress={() => loadRecommendations({ occasions: selectedOccasionNames, priceRange: { min: rangoPrecio[0], max: rangoPrecio[1] } })} /> */}
              </View>
            ) : (
              <>
                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                  <BoxVisualizer decantCount={decantCount} decantSize={decantSize} />
                  <DecantSelector
                    decantCount={decantCount}
                    onSelectDecant={setDecantCount} // Pass context setter for count
                    decantSize={decantSize}
                    onDecantSize={setDecantSize} // Pass context setter for size
                  />
                  <PriceRangeSlider
                    range={rangoPrecio}
                    onRangeChange={handleRangeChangeWrapper} // Update visual state during slide
                    onRangeChangeFinish={handlePriceChangeFinish} // Trigger reload on finish
                    sliderContainerRef={sliderContainerRef}
                  />
                  <PerfumeList
                    selectedPerfumes={selectedPerfumeIds} // Use provider's state
                    onPerfumePress={handlePerfumePress}
                    onRemovePerfume={handleRemovePerfume} // Added required prop
                    onReplacePerfume={handleReplacePerfume} // Added required prop
                    decantSize={decantSize} // Pass decantSize from context
                    perfumes={recommendedPerfumes} // Use provider's fetched perfumes
                  />
                </ScrollView>

                <BottomBar
                  totalPrice={calculateTotalPrice()} // Use provider's function
                  onAddToCart={() => handleAddToCart(contextProps)} // Pass context props to handler
                  // No feedbackMessage prop for BottomBar
                />
              </>
            )}

            {selectedPerfumeForModal && (
              <PerfumeModal
                ref={modalRef}
                perfume={selectedPerfumeForModal}
                onClose={handleModalDismiss}
                isSwapping={!!swappingPerfumeId}
                // Pass setSelectedPerfumeIds from context to the select handler
                onSimilarPerfumeSelect={(newId) => handleSimilarPerfumeSelect(newId, setSelectedPerfumeIds)}
              />
            )}
          </View>
        );
      }}
    </AIBoxProvider>
  );

}; // End OccasionSelectionContent component definition

// Export the main screen component that wraps the content with the provider
export default function OccasionSelectionScreen() { // Keep this export
  return <OccasionSelectionContent />;
}