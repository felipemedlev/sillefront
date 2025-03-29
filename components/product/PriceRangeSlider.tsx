import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

interface PriceRangeSliderProps {
  range: [number, number];
  onRangeChange: (values: number[]) => void;
  sliderContainerRef: React.RefObject<View>;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  range,
  onRangeChange,
  sliderContainerRef,
}) => {
  const [isSliderReady, setIsSliderReady] = useState(false);

  useEffect(() => {
    if (sliderContainerRef.current) {
      setIsSliderReady(true);
    }
  }, [sliderContainerRef]);

  return (
    <View style={[styles.section, styles.filterSection]}>
      <Text style={[styles.sectionTitle, styles.filterTitle]}>Rango de Precio por mL</Text>
      <View style={styles.priceContainer}>
        <View style={styles.priceLabelsCompact}>
          <Text style={styles.priceText}>${range[0].toLocaleString()}</Text>
          <Text style={styles.priceText}>${range[1].toLocaleString()}</Text>
        </View>
        <View ref={sliderContainerRef} style={styles.sliderContainer}>
          {isSliderReady && (
            <MultiSlider
              values={range}
              min={0}
              max={20000}
              step={100}
              onValuesChange={onRangeChange}
              sliderLength={Dimensions.get('window').width - 80}
              selectedStyle={{
                backgroundColor: '#809CAC',
                height: 4,
              }}
              unselectedStyle={{
                backgroundColor: '#E6E6E6',
                height: 4,
              }}
              containerStyle={styles.slider}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  filterSection: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  priceContainer: {
    paddingHorizontal: 4,
  },
  priceLabelsCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  sliderContainer: {
    position: 'relative',
    height: 30,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 30,
    position: 'absolute',
  },
});

export default PriceRangeSlider;