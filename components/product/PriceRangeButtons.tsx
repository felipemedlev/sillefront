import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

interface PriceRangeButtonsProps {
  currentRange: string;
  setCurrentRange: (range: string) => void;
}

const PriceRangeButtons: React.FC<PriceRangeButtonsProps> = ({
  currentRange,
  setCurrentRange,
}) => {
  const ranges = [
    { label: '<30.000', value: '<30.000' },
    { label: '30.000-50.000', value: '30.000-50.000' },
    { label: '50.000-70.000', value: '50.000-70.000' },
    { label: '70.000-90.000', value: '70.000-90.000' },
    { label: '>90.000', value: '>90.000' },
  ];

  return (
    <View style={[styles.section, styles.filterSection]}>
      <Text style={[styles.sectionTitle, styles.filterTitle]}>Rango de Precio</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonsContainer}
      >
        {ranges.map((range) => (
          <Pressable
            key={range.value}
            style={[
              styles.rangeButton,
              currentRange === range.value && styles.rangeButtonActive,
            ]}
            onPress={() => setCurrentRange(range.value)}
          >
            <Text style={[
              styles.rangeButtonText,
              currentRange === range.value && styles.rangeButtonTextActive,
            ]}>{range.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
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
  buttonsContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#FFFFFF',
  },
  rangeButtonActive: {
    backgroundColor: '#809CAC',
    borderColor: '#809CAC',
    elevation: 3,
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default PriceRangeButtons;