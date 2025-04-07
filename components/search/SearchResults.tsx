import React from 'react';
import { FlatList, StyleSheet, useWindowDimensions, Platform, View } from 'react-native';
import { Perfume } from '../../types/perfume'; // Import Perfume instead of BasicPerfumeInfo
import PerfumeCard from './PerfumeCard';

interface SearchResultsProps {
  perfumes: Perfume[]; // Use Perfume type directly
  onPerfumePress: (perfume: Perfume) => void; // Expect Perfume type
}

const DESKTOP_BREAKPOINT = 768;

export default function SearchResults({ perfumes, onPerfumePress }: SearchResultsProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const numColumns = isDesktop ? 6 : 2;
  const renderItem = ({ item }: { item: Perfume }) => ( // Use Perfume type for item
    <View style={isDesktop ? styles.cardWrapper : undefined}>
      <PerfumeCard
        perfume={item}
        matchPercentage={item.matchPercentage}
        onPress={() => onPerfumePress(item)}
        isDesktop={isDesktop}
      />
    </View>
  );

  return (
    <FlatList
      data={perfumes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={isDesktop ? { justifyContent: 'center' } : styles.row}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: '18%',
  },
  cardWrapper: {
    margin: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
});