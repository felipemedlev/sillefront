import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native'; // Import Alert
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MOCK_PERFUMES } from '../data/mockPerfumes';
import PerfumeModal, { PerfumeModalRef } from '../components/product/PerfumeModal';
import { Perfume, BasicPerfumeInfo } from '../types/perfume'; // Import BasicPerfumeInfo
import { useCart } from '../context/CartContext'; // Import useCart
import DecantSelector from '../components/product/DecantSelector';
import PriceRangeSlider from '../components/product/PriceRangeSlider';
import PerfumeList from '../components/product/PerfumeList';
import BottomBar from '../components/product/BottomBar';
import BoxVisualizer from '../components/product/BoxVisualizer'; // Import the new component

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

export default function AIBoxSelectionScreen() {
  const { addItemToCart } = useCart(); // Get cart function
  const [decantCount, setDecantCount] = useState<DecantCount>(4);
  const [decantSize, setDecantSize] = useState<DecantSize>(5);
  const [rangoPrecio, setRangoPrecio] = useState<[number, number]>([200, 5000]);
  // Removed selectedPerfumeId state
  const [swappingPerfumeId, setSwappingPerfumeId] = useState<string | null>(null);
  const [selectedPerfumeIds, setSelectedPerfumeIds] = useState<string[]>([]); // Renamed for clarity
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null); // State for feedback
  const modalRef = useRef<PerfumeModalRef>(null);
  const sliderContainerRef = useRef<View>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for timeout

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Initialize selected perfumes when component mounts or when decantCount/rangoPrecio changes
  useEffect(() => {
    const filteredPerfumes = MOCK_PERFUMES.filter((perfume: Perfume) =>
      (perfume.pricePerML ?? 0) >= rangoPrecio[0] &&
      (perfume.pricePerML ?? 0) <= rangoPrecio[1]
    );

    // Always set the selected perfumes to the first N perfumes that match the price range
    setSelectedPerfumeIds(filteredPerfumes.slice(0, decantCount).map(p => p.id));
  }, [decantCount, rangoPrecio]);

  const handleMaxPriceChange = useCallback((values: number[]) => {
    setRangoPrecio(values as [number, number]);
  }, []);

  const handlePerfumePress = useCallback((perfumeId: string) => {
    const perfumeToShow = MOCK_PERFUMES.find((p: Perfume) => p.id === perfumeId);
    if (perfumeToShow && modalRef.current) {
      // setSelectedPerfumeId(perfumeId); // Removed state update
      setSwappingPerfumeId(null); // Ensure not in swap mode
      modalRef.current.show(perfumeToShow);
    } else {
      console.warn(`Perfume with ID ${perfumeId} not found.`);
    }
  }, []); // Dependencies: MOCK_PERFUMES, modalRef

  const handleSwapPress = useCallback((perfumeId: string) => {
     const perfumeToSwap = MOCK_PERFUMES.find((p: Perfume) => p.id === perfumeId);
     if (perfumeToSwap && modalRef.current) {
       // setSelectedPerfumeId(perfumeId); // Removed state update
       setSwappingPerfumeId(perfumeId); // Set swap mode
       modalRef.current.show(perfumeToSwap);
     } else {
       console.warn(`Perfume with ID ${perfumeId} not found for swapping.`);
     }
  }, []); // Dependencies: MOCK_PERFUMES, modalRef

  const handleSimilarPerfumeSelect = useCallback((newPerfumeId: string) => {
    if (swappingPerfumeId) {
      setSelectedPerfumeIds(prev =>
        prev.map(id => id === swappingPerfumeId ? newPerfumeId : id)
      );
      modalRef.current?.hide();
    }
  }, [swappingPerfumeId]);

  const handleModalDismiss = useCallback(() => {
    // The PerfumeModal now clears its internal state on close (via handleSheetChange)
    // We only need to clear the swapping state here.
    // setSelectedPerfumeId(null); // Removed state update
    setSwappingPerfumeId(null);
  }, []);

  const calculateTotalPrice = useCallback(() => {
    return selectedPerfumeIds.reduce((total, perfumeId) => {
      const perfume = MOCK_PERFUMES.find(p => p.id === perfumeId);
      return total + (perfume?.pricePerML || 0) * decantSize;
    }, 0);
  }, [decantSize, selectedPerfumeIds]);

  const handleAddToCart = useCallback(async () => {
    const totalPrice = calculateTotalPrice();
    const perfumesInBox: BasicPerfumeInfo[] = selectedPerfumeIds
      .map(id => MOCK_PERFUMES.find(p => p.id === id))
      .filter((p): p is Perfume => !!p) // Type guard to filter out undefined
      .map(p => ({ // Map to BasicPerfumeInfo
        id: p.id,
        name: p.name,
        brand: p.brand,
        thumbnailUrl: p.thumbnailUrl,
        fullSizeUrl: p.fullSizeUrl,
      }));

    const itemData = {
      productType: 'AI_BOX' as const, // Use const assertion for literal type
      name: `AI Box (${decantCount} x ${decantSize}ml)`,
      details: {
        decantCount,
        decantSize,
        perfumes: perfumesInBox,
      },
      price: totalPrice,
      thumbnailUrl: perfumesInBox[0]?.thumbnailUrl, // Use first perfume's image as thumbnail
    };

    try {
      await addItemToCart(itemData);
      console.log('AI Box añadido al carro:', itemData);
      setFeedbackMessage("¡Añadido al carro!"); // Set feedback message

      // Clear previous timeout if exists
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      // Set new timeout to clear the message
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackMessage(null);
        router.push('/(tabs)/(cart)'); // Optional navigation
      }, 2000); // Clear after 2 seconds

    } catch (error) {
      console.error("Error adding AI Box to cart:", error);
      setFeedbackMessage("Error al añadir."); // Show error feedback
      // Clear previous timeout if exists
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      // Set new timeout to clear the error message
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackMessage(null);
      }, 2000);
    }
  }, [decantCount, decantSize, selectedPerfumeIds, calculateTotalPrice, addItemToCart]);

  // Removed selectedPerfume memo - The modal manages its own current perfume state internally

  return (
    <View style={[styles.container, {backgroundColor: '#F5F5F7'}]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Selecciona tu Box AI</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Add the BoxVisualizer component here */}
        <BoxVisualizer decantCount={decantCount} decantSize={decantSize} />

        <DecantSelector
          decantCount={decantCount}
          setDecantCount={setDecantCount}
          decantSize={decantSize}
          setDecantSize={setDecantSize}
        />

        <PriceRangeSlider
          range={rangoPrecio}
          onRangeChange={handleMaxPriceChange}
          sliderContainerRef={sliderContainerRef}
        />

        <PerfumeList
          selectedPerfumes={selectedPerfumeIds} // Use renamed state variable
          onPerfumePress={handlePerfumePress}
          onSwapPress={handleSwapPress}
          decantSize={decantSize}
          perfumes={MOCK_PERFUMES}
        />
      </ScrollView>

      <BottomBar
        totalPrice={calculateTotalPrice()}
        onAddToCart={handleAddToCart}
        feedbackMessage={feedbackMessage} // Pass feedback state
      />

      {/* Render PerfumeModal (BottomSheet) unconditionally.
          Its visibility is controlled by the ref methods (show/hide)
          and the internal state of the BottomSheet component. */}
      <PerfumeModal
        ref={modalRef}
        // Removed perfume prop - Modal manages its own state via show()
        onClose={handleModalDismiss}
        isSwapping={!!swappingPerfumeId}
        onSimilarPerfumeSelect={handleSimilarPerfumeSelect}
      />
    </View>
  );
}