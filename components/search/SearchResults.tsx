import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { BasicPerfumeInfo } from '../../types/perfume';
import PerfumeCard from './PerfumeCard';

interface SearchResultsProps {
  perfumes: (BasicPerfumeInfo & { matchPercentage?: number })[];
  onPerfumePress: (perfume: BasicPerfumeInfo) => void;
}

export default function SearchResults({ perfumes, onPerfumePress }: SearchResultsProps) {
  const renderItem = ({ item }: { item: BasicPerfumeInfo & { matchPercentage?: number } }) => (
    <PerfumeCard
      perfume={item}
      matchPercentage={item.matchPercentage}
      onPress={() => onPerfumePress(item)}
    />
  );

  return (
    <FlatList
      data={perfumes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: '18%',
  },
  row: {
    justifyContent: 'space-between',
  },
});