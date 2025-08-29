import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import BoxVisualizer from '../components/product/BoxVisualizer';
import DecantSelector from '../components/product/DecantSelector';
import PriceRangeSlider from '../components/product/PriceRangeSlider';
import PerfumeList from '../components/product/PerfumeList';
import BottomBar from '../components/product/BottomBar';
import AIBoxProvider from '../components/aibox/AIBoxProvider';
import AIBoxInteractions from '../components/aibox/AIBoxInteractions';
import AIBoxLoadingState from '../components/aibox/AIBoxLoadingState';
import AIBoxErrorState from '../components/aibox/AIBoxErrorState';
import AIBoxHeader from '../components/aibox/AIBoxHeader';
import PerfumeSearchModal from '../components/product/PerfumeSearchModal';
import { useAuth } from '../src/context/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    // flex: 1, // Removed flex: 1 to potentially fix scrolling
    backgroundColor: '#F5F5F7', // Background for scroll area
  },
});

export default function AIBoxSelectionScreen() {
  const { isAuthenticated } = useAuth();
  const sliderContainerRef = React.useRef<View>(null);
  const [searchModalVisible, setSearchModalVisible] = React.useState(false);
  const [replaceIndex, setReplaceIndex] = React.useState<number | null>(null);
  const [removedPerfumeIds, setRemovedPerfumeIds] = React.useState<string[]>([]);

  // Track which perfumes were initially rendered to prevent them from reappearing
  const initialRenderRef = React.useRef<boolean>(false);
  const initialPerfumesRef = React.useRef<Set<string>>(new Set());

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AIBoxProvider>
      {({
        isLoading,
        error,
        loadingMessage,
        recommendedPerfumes,
        selectedPerfumeIds,
        decantCount,
        decantSize,
        rangoPrecio,
        calculateTotalPrice,
        setDecantCount,
        setDecantSize,
        setRangoPrecio,
        setSelectedPerfumeIds,
        findPerfumeById,
        handlePriceChangeFinish,
        loadRecommendations
      }) => {
        // Track initial recommended perfumes to prevent removed ones from reappearing
        React.useEffect(() => {
          if (!isLoading && recommendedPerfumes.length > 0 && !initialRenderRef.current) {
            initialRenderRef.current = true;
            // Store initially selected perfumes
            selectedPerfumeIds.forEach(id => {
              initialPerfumesRef.current.add(id);
            });

            console.log(`Initial perfumes: ${Array.from(initialPerfumesRef.current).join(', ')}`);
          }
        }, [isLoading, recommendedPerfumes, selectedPerfumeIds]);

        // Wrapper to handle type mismatch between slider's number[] and state's [number, number]
        const handleSliderValueChange = (values: number[]) => {
          if (values.length === 2) {
            setRangoPrecio([values[0], values[1]]);
          }
        };

        // Find the next available recommended perfume not already selected, removed, or from initial render
        const getNextAvailablePerfumeId = (currentSelection: string[] = selectedPerfumeIds, currentRemoved: string[] = removedPerfumeIds) => {
          // Get all recommended perfume IDs sorted by match percentage
          const sortedRecommendedIds = recommendedPerfumes
            .sort((a, b) => {
              const matchA = typeof a.match_percentage === 'number' ? a.match_percentage : 0;
              const matchB = typeof b.match_percentage === 'number' ? b.match_percentage : 0;
              return matchB - matchA; // Sort in descending order
            })
            .map(p => String(p.id));

          // Find the first ID that's not already in selectedPerfumeIds or removedPerfumeIds
          return sortedRecommendedIds.find(id =>
            !currentSelection.includes(id) &&
            !currentRemoved.includes(id)
          );
        };

        const handleRemovePerfume = (perfumeId: string) => {
          // Add the removed perfume ID to the tracking list
          setRemovedPerfumeIds(prev => {
            // Make sure we don't add duplicates
            if (prev.includes(perfumeId)) {
              return prev;
            }
            const updated = [...prev, perfumeId];
            console.log(`Removed perfumes: ${updated.join(', ')}`);
            return updated;
          });

          // If it was in the initial render, add it to initialPerfumes
          if (!initialPerfumesRef.current.has(perfumeId)) {
            initialPerfumesRef.current.add(perfumeId);
          }

          setSelectedPerfumeIds((prev) => {
            // First, add the perfume we're about to remove to our updated removed list
            // to make sure getNextAvailablePerfumeId doesn't consider it again
            const updatedRemoved = [...removedPerfumeIds];
            if (!updatedRemoved.includes(perfumeId)) {
              updatedRemoved.push(perfumeId);
            }

            // Remove the perfume from the list
            const newIds = prev.filter(id => id !== perfumeId);

            // Add the next available perfume at the end (one that hasn't been selected or removed yet)
            const nextId = getNextAvailablePerfumeId(newIds, updatedRemoved);
            if (nextId) {
              console.log(`Adding next available perfume: ${nextId}`);
              newIds.push(nextId);
            }

            return newIds;
          });
        };

        const handleReplacePerfume = (perfumeId: string) => {
          const idx = selectedPerfumeIds.indexOf(perfumeId);
          if (idx !== -1) {
            setReplaceIndex(idx);
            setSearchModalVisible(true);
          }
        };

        const handleSelectReplacement = (perfume: any) => {
          if (replaceIndex !== null) {
            const perfumeId = String(perfume.id);
            console.log(`Replacing perfume at index ${replaceIndex} with perfume ID ${perfumeId}`);
            console.log(`Current selectedPerfumeIds: ${selectedPerfumeIds.join(', ')}`);

            // Properly normalize the perfume from search to match the expected format
            const normalizedPerfume = {
              id: String(perfume.id),
              external_id: perfume.external_id || String(perfume.id), // Use external_id if available or fall back to ID
              name: perfume.name,
              brand: typeof perfume.brand === 'object' ? perfume.brand.name : perfume.brand,
              thumbnail_url: perfume.thumbnail_url || perfume.thumbnail_url || '',
              full_size_url: perfume.full_size_url || perfume.full_size_url || '',
              // Properly format match percentage: If it's a decimal (0-1), multiply by 100
              match_percentage: perfume.match_percentage ?
                (perfume.match_percentage <= 1 ? Math.round(perfume.match_percentage * 100) : Math.round(perfume.match_percentage)) :
                100, // Default to 100% match for manually selected perfumes
              price_per_ml: perfume.price_per_ml || 0,
              description: perfume.description || '',
              accords: perfume.accords || [],
              top_notes: perfume.top_notes || [],
              middle_notes: perfume.middle_notes || [],
              base_notes: perfume.base_notes || [],
              overall_rating: perfume.overall_rating || null,
              price_value_rating: perfume.price_value_rating || null,
              longevity_rating: perfume.longevity_rating || null,
              sillage_rating: perfume.sillage_rating || null,
              similar_perfume_ids: perfume.similar_perfume_ids || [],
              gender: perfume.gender || null,
              occasions: perfume.occasions || [],
              season: perfume.season || null,
              best_for: perfume.best_for || null,
            };

            console.log(`Normalized perfume: ${JSON.stringify({
              id: normalizedPerfume.id,
              external_id: normalizedPerfume.external_id,
              name: normalizedPerfume.name,
              thumbnail_url: normalizedPerfume.thumbnail_url,
              match_percentage: normalizedPerfume.match_percentage
            }, null, 2)}`);

            // Add selected perfume to recommendedPerfumes if it's not already there
            const alreadyInRecommended = recommendedPerfumes.some(p => String(p.id) === perfumeId);
            if (!alreadyInRecommended) {
              console.log(`Adding search perfume with ID ${perfumeId} to recommendedPerfumes`);
              // Add the normalized perfume to our recommendation pool
              recommendedPerfumes.push(normalizedPerfume);
            }

            // Get the ID of the perfume being replaced
            const replacedPerfumeId = selectedPerfumeIds[replaceIndex];
            console.log(`Perfume being replaced: ${replacedPerfumeId}`);

            // If replacing an initial perfume, make sure it doesn't reappear
            if (replacedPerfumeId) {
              // Add the replaced perfume to the tracking list
              setRemovedPerfumeIds(prev => {
                // Make sure we don't add duplicates
                if (prev.includes(replacedPerfumeId)) {
                  return prev;
                }
                const updated = [...prev, replacedPerfumeId];
                console.log(`Updated removed perfumes after replacement: ${updated.join(', ')}`);
                return updated;
              });

              // If it was in the initial render, keep track of it
              if (initialPerfumesRef.current.has(replacedPerfumeId)) {
                console.log(`Replacing an initial perfume: ${replacedPerfumeId}`);
              }
            }

            // Remove the new perfume from the removed list if it was there
            setRemovedPerfumeIds(prev => {
              const updated = prev.filter(id => id !== perfumeId);
              return updated;
            });

            // Update the selectedPerfumeIds
            setSelectedPerfumeIds(prev => {
              const newIds = [...prev];
              newIds[replaceIndex] = perfumeId;
              console.log(`Final selected IDs: ${newIds.join(', ')}`);
              return newIds;
            });

            setReplaceIndex(null);
            setSearchModalVisible(false);
          }
        };

        if (isLoading) {
          return <AIBoxLoadingState loadingMessage={loadingMessage} />;
        }

        if (error) {
          return <AIBoxErrorState error={error} onRetry={loadRecommendations} />;
        }

        return (
          <>
            <AIBoxInteractions
              selectedPerfumeIds={selectedPerfumeIds}
              decantCount={decantCount}
              decantSize={decantSize}
              setSelectedPerfumeIds={setSelectedPerfumeIds}
              findPerfumeById={findPerfumeById}
              calculateTotalPrice={calculateTotalPrice}
              recommendedPerfumes={recommendedPerfumes}
            >
              {({ handlePerfumePress, handleSwapPress, handleAddToCart }) => (
                <View style={styles.container}>
                  <AIBoxHeader />

                  <ScrollView style={styles.content}>
                    <BoxVisualizer decantCount={decantCount} decantSize={decantSize} />

                    <DecantSelector
                      decantCount={decantCount}
                      onSelectDecant={setDecantCount}
                      decantSize={decantSize}
                      onDecantSize={setDecantSize}
                    />

                    <PriceRangeSlider
                      range={rangoPrecio}
                      onRangeChange={handleSliderValueChange} // Use wrapper for type safety
                      onRangeChangeFinish={handlePriceChangeFinish} // Fetch data on release
                      sliderContainerRef={sliderContainerRef}
                    />

                    <PerfumeList
                      selectedPerfumes={selectedPerfumeIds}
                      onPerfumePress={handlePerfumePress}
                      onRemovePerfume={handleRemovePerfume}
                      onReplacePerfume={handleReplacePerfume}
                      decantSize={decantSize}
                      perfumes={recommendedPerfumes}
                    />
                  </ScrollView>

                  <BottomBar
                    totalPrice={calculateTotalPrice()}
                    onAddToCart={handleAddToCart}
                  />
                </View>
              )}
            </AIBoxInteractions>
            <PerfumeSearchModal
              visible={searchModalVisible}
              onClose={() => { setSearchModalVisible(false); setReplaceIndex(null); }}
              onSelect={handleSelectReplacement}
              excludeIds={[...selectedPerfumeIds, ...removedPerfumeIds]}
            />
          </>
        );
      }}
    </AIBoxProvider>
  );
}