import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import PerfumeModal, { PerfumeModalRef } from '../components/product/PerfumeModal';
import PerfumeSearchModal from '../components/product/PerfumeSearchModal';
import { Perfume, BasicPerfumeInfo } from '../types/perfume';
import { useCart } from '../context/CartContext';
import { useSnackbar } from '../context/SnackbarContext';
import DecantSelector from '../components/product/DecantSelector';
import PriceRangeSlider from '../components/product/PriceRangeSlider';
import PerfumeList from '../components/product/PerfumeList';
import BottomBar from '../components/product/BottomBar';
import BoxVisualizer from '../components/product/BoxVisualizer';
import AIBoxProvider from '../components/aibox/AIBoxProvider';

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

const OccasionSelectionContent: React.FC = () => {
  const { occasionNames } = useLocalSearchParams<{ occasionNames: string }>();
  const { addItemToCart } = useCart();
  const { showSnackbar } = useSnackbar();

  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string | null>(null);
  const [swappingPerfumeId, setSwappingPerfumeId] = useState<string | null>(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [removedPerfumeIds, setRemovedPerfumeIds] = useState<string[]>([]);
  const [manuallyAddedPerfumes, setManuallyAddedPerfumes] = useState<Perfume[]>([]);
  const modalRef = useRef<PerfumeModalRef>(null);
  const sliderContainerRef = useRef<View>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handlePerfumePress = useCallback((perfumeId: string) => {
    setSelectedPerfumeId(perfumeId);
  }, []);

  const handleSwapPress = useCallback((perfumeId: string) => {
    setSwappingPerfumeId(perfumeId);
    setSelectedPerfumeId(perfumeId);
  }, []);

  const handleSimilarPerfumeSelect = useCallback((newPerfumeId: string, setSelectedPerfumeIdsFromContext: (ids: string[] | ((prev: string[]) => string[])) => void) => {
    if (swappingPerfumeId) {
      setSelectedPerfumeIdsFromContext(prev =>
        prev.map(id => String(id) === String(swappingPerfumeId) ? newPerfumeId : id)
      );
      modalRef.current?.hide();
      setSwappingPerfumeId(null);
    }
  }, [swappingPerfumeId]);

  const handleModalDismiss = useCallback(() => {
    setTimeout(() => {
      setSelectedPerfumeId(null);
      setSwappingPerfumeId(null);
    }, 100);
  }, []);

  const getNextAvailableRecommendedPerfumeId = useCallback((
    currentSelectedIds: string[],
    currentRemovedIds: string[],
    allRecommendedPerfumes: Perfume[]
  ): string | undefined => {
    const sortedRecommendedIds = allRecommendedPerfumes.map(p => String(p.id));
    return sortedRecommendedIds.find(id =>
      !currentSelectedIds.includes(String(id)) &&
      !currentRemovedIds.includes(String(id))
    );
  }, []);

  const handleSelectReplacement = useCallback((
    newPerfume: Perfume,
    contextPropsForReplacement: {
      setSelectedPerfumeIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    }
  ) => {
    if (swappingPerfumeId) {
      const newPerfumeId = String(newPerfume.id);
      const { setSelectedPerfumeIds: setSelectedPerfumeIdsFromContext } = contextPropsForReplacement;

      // Add the new perfume to manually added perfumes
      setManuallyAddedPerfumes(prevManuallyAdded => {
        const existingPerfumeIndex = prevManuallyAdded.findIndex(p => String(p.id) === newPerfumeId);
        let newManuallyAddedPerfumesList = [...prevManuallyAdded];
        if (existingPerfumeIndex !== -1) {
          newManuallyAddedPerfumesList[existingPerfumeIndex] = newPerfume; // Replace existing
        } else {
          newManuallyAddedPerfumesList.push(newPerfume); // Add new
        }
        return newManuallyAddedPerfumesList;
      });

      // Simple direct replacement - similar to handleSimilarPerfumeSelect
      setSelectedPerfumeIdsFromContext(prevIds => {
        // Create a new array with the replacement
        return prevIds.map(id => String(id) === String(swappingPerfumeId) ? newPerfumeId : id);
      });

      // Close the modal and reset state
      setSwappingPerfumeId(null);
      setSearchModalVisible(false);
    }
  }, [swappingPerfumeId, setManuallyAddedPerfumes, setSearchModalVisible]);

  const handleRemovePerfume = useCallback((
    perfumeIdToRemove: string,
    contextPropsForRemoval: {
      selectedPerfumeIds: string[];
      setSelectedPerfumeIds: (ids: string[] | ((prev: string[]) => string[])) => void;
      recommendedPerfumes: Perfume[];
      decantCount: DecantCount;
    }
  ) => {
    const { setSelectedPerfumeIds: setSelectedPerfumeIdsFromContext, recommendedPerfumes: allRecommended, decantCount: currentDecantCount } = contextPropsForRemoval;

    setRemovedPerfumeIds(prevRemoved => {
      if (!prevRemoved.includes(String(perfumeIdToRemove))) {
        return [...prevRemoved, String(perfumeIdToRemove)];
      }
      return prevRemoved;
    });

    setSelectedPerfumeIdsFromContext(prevSelectedIds => {
      let updatedSelectedIds = prevSelectedIds.filter(id => String(id) !== String(perfumeIdToRemove));
      // Ensure removedPerfumeIds used for check is the latest state *after* adding perfumeIdToRemove
      const currentRemovedForCheck = removedPerfumeIds.includes(String(perfumeIdToRemove))
                                     ? [...removedPerfumeIds]
                                     : [...removedPerfumeIds, String(perfumeIdToRemove)];

      if (updatedSelectedIds.length < currentDecantCount) {
        const nextId = getNextAvailableRecommendedPerfumeId(updatedSelectedIds, currentRemovedForCheck, allRecommended);
        if (nextId) {
          updatedSelectedIds.push(nextId);
        }
      }
      return updatedSelectedIds;
    });
  }, [removedPerfumeIds, getNextAvailableRecommendedPerfumeId, setRemovedPerfumeIds]);

  const handleReplacePerfume = useCallback((perfumeIdToReplace: string) => {
    setSwappingPerfumeId(perfumeIdToReplace);
    setSearchModalVisible(true);
  }, []);

  const getSelectedPerfume = (finder: (id: string) => Perfume | undefined) => {
      return selectedPerfumeId ? finder(selectedPerfumeId) : null;
  };

  const useShowModalEffect = (finder: (id: string) => Perfume | undefined) => {
      const perfumeForModal = getSelectedPerfume(finder);
      useEffect(() => {
          if (perfumeForModal && modalRef.current) {
              modalRef.current.show(perfumeForModal);
          }
      }, [perfumeForModal]);
  };

  return (
    <AIBoxProvider>
      {(contextProps) => {
        const {
          isLoading, error, loadingMessage, recommendedPerfumes,
          selectedPerfumeIds: contextSelectedPerfumeIds,
          decantCount: contextDecantCount,
          decantSize: contextDecantSize,
          rangoPrecio,
          calculateTotalPrice: contextCalculateTotalPrice,
          setDecantCount,
          setDecantSize,
          setRangoPrecio,
          setSelectedPerfumeIds,
          handlePriceChangeFinish,
          loadRecommendations,
          setSelectedOccasionNames
        } = contextProps;

        const combinedPerfumes = useMemo(() => {
          const allPerfumesMap = new Map<string, Perfume>();
          recommendedPerfumes.forEach(p => allPerfumesMap.set(String(p.id), p));
          manuallyAddedPerfumes.forEach(p => allPerfumesMap.set(String(p.id), p));
          return Array.from(allPerfumesMap.values());
        }, [recommendedPerfumes, manuallyAddedPerfumes]);

        const findPerfumeByIdLocal = useCallback((idToFind: string): Perfume | undefined => {
          return combinedPerfumes.find(p => String(p.id) === String(idToFind));
        }, [combinedPerfumes]);

        const handleAddToCartInternal = useCallback(async () => {
          const totalPrice = contextCalculateTotalPrice();
          const perfumesInBox: BasicPerfumeInfo[] = contextSelectedPerfumeIds
            .map(id => findPerfumeByIdLocal(id))
            .filter((p): p is Perfume => !!p)
            .map(p => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              thumbnail_url: p.thumbnail_url,
              full_size_url: p.full_size_url,
            }));

          const decodedOccasionName = occasionNames ? decodeURIComponent(occasionNames) : 'Personalizado';

          const itemData = {
            productType: 'OCCASION_BOX' as const,
            name: `Box Ocasión: ${decodedOccasionName} (${contextDecantCount} x ${contextDecantSize}ml)`,
            details: {
              decantCount: contextDecantCount,
              decantSize: contextDecantSize,
              perfumes: perfumesInBox,
              occasion: decodedOccasionName,
            },
            price: totalPrice,
            thumbnail_url: perfumesInBox[0]?.thumbnail_url,
          };

          try {
            await addItemToCart(itemData);
            console.log('Occasion Box added to cart:', itemData);
            showSnackbar("¡Añadido al carro! Redirigiendo...");

            if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
            redirectTimeoutRef.current = setTimeout(() => {
              router.push('/(tabs)/(cart)');
            }, 2000);
          } catch (cartError) {
            console.error("Error adding Occasion Box to cart:", cartError);
            showSnackbar("Error al añadir.");
          }
        }, [
          addItemToCart, occasionNames, showSnackbar,
          contextCalculateTotalPrice, contextSelectedPerfumeIds, contextDecantCount, contextDecantSize,
          findPerfumeByIdLocal,
        ]);

        useEffect(() => {
          const decodedOccasionName = occasionNames ? decodeURIComponent(occasionNames) : null;
          if (decodedOccasionName) {
            const occasionNameList = decodedOccasionName.split(',');
            setSelectedOccasionNames(occasionNameList);
            loadRecommendations({ occasions: occasionNameList, priceRange: { min: rangoPrecio[0], max: rangoPrecio[1] } });
          } else {
            console.warn("Occasion name parameter missing.");
          }
        }, [occasionNames, setSelectedOccasionNames, loadRecommendations]);

        useShowModalEffect(findPerfumeByIdLocal);
        const perfumeForModalDisplay = getSelectedPerfume(findPerfumeByIdLocal);

        const decodedOccasionTitle = occasionNames ? decodeURIComponent(occasionNames) : 'Selección';

        const handleRangeChangeWrapper = useCallback((values: number[]) => {
          if (values.length === 2) {
            setRangoPrecio(values as [number, number]);
          }
        }, [setRangoPrecio]);

        if (isLoading) {
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F7' }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 10 }}>{loadingMessage}</Text>
            </View>
          );
        }

        if (error) {
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F5F5F7' }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Error: {error}</Text>
            </View>
          );
        }

        return (
          <View style={[styles.container, { backgroundColor: '#F5F5F7' }]}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Feather name="chevron-left" size={24} color="#333" />
              </Pressable>
              <Text style={styles.headerTitle}>Box Ocasión: {decodedOccasionTitle}</Text>
            </View>

            <>
              <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <BoxVisualizer decantCount={contextDecantCount} decantSize={contextDecantSize} />
                <DecantSelector
                  decantCount={contextDecantCount}
                  onSelectDecant={setDecantCount}
                  decantSize={contextDecantSize}
                  onDecantSize={setDecantSize}
                />
                <PriceRangeSlider
                  range={rangoPrecio}
                  onRangeChange={handleRangeChangeWrapper}
                  onRangeChangeFinish={handlePriceChangeFinish}
                  sliderContainerRef={sliderContainerRef}
                />
                <PerfumeList
                  selectedPerfumes={contextSelectedPerfumeIds}
                  onPerfumePress={handlePerfumePress}
                  onRemovePerfume={(id) => handleRemovePerfume(id, contextProps)}
                  onReplacePerfume={handleReplacePerfume}
                  decantSize={contextDecantSize}
                  perfumes={combinedPerfumes}
                />
              </ScrollView>

              <BottomBar
                totalPrice={contextCalculateTotalPrice()}
                onAddToCart={handleAddToCartInternal}
              />
            </>

            {perfumeForModalDisplay && (
              <PerfumeModal
                ref={modalRef}
                perfume={perfumeForModalDisplay}
                onClose={handleModalDismiss}
                isSwapping={!!swappingPerfumeId}
                onSimilarPerfumeSelect={(newId) => handleSimilarPerfumeSelect(newId, setSelectedPerfumeIds)}
              />
            )}
            <PerfumeSearchModal
              visible={searchModalVisible}
              onClose={() => {
                setSearchModalVisible(false);
                setSwappingPerfumeId(null);
              }}
              onSelect={(perfume) => handleSelectReplacement(perfume, contextProps)}
              excludeIds={[...contextSelectedPerfumeIds]}
            />
          </View>
        );
      }}
    </AIBoxProvider>
  );
};

export default function OccasionSelectionScreen() {
  return <OccasionSelectionContent />;
}