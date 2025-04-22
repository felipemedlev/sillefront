import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Background for scroll area
  },
  contentContainer: {
    paddingBottom: 100, // Increased padding to avoid overlap with bottom bar
  },
});

export default function AIBoxSelectionScreen() {
  const sliderContainerRef = React.useRef<View>(null);

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
        handleMaxPriceChange,
        loadRecommendations
      }) => {
        if (isLoading) {
          return <AIBoxLoadingState loadingMessage={loadingMessage} />;
        }

        if (error) {
          return <AIBoxErrorState error={error} onRetry={loadRecommendations} />;
        }

        return (
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

                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                  <BoxVisualizer decantCount={decantCount} decantSize={decantSize} />

                  <DecantSelector
                    decantCount={decantCount}
                    onSelectDecant={setDecantCount}
                  />

                  <PriceRangeSlider
                    range={rangoPrecio}
                    onRangeChange={handleMaxPriceChange}
                    sliderContainerRef={sliderContainerRef}
                  />

                  <PerfumeList
                    selectedPerfumes={selectedPerfumeIds}
                    onPerfumePress={handlePerfumePress}
                    onSwapPress={handleSwapPress}
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
        );
      }}
    </AIBoxProvider>
  );
}