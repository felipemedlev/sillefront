import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PaginationIndicatorProps {
  totalPages: number;
  currentPage: number;
}

const PaginationIndicator = ({ totalPages, currentPage }: PaginationIndicatorProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentPage ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  dot: {
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#E4E4E4',
  },
  activeDot: {
    width: 24,
    height: 8,
    backgroundColor: '#222222',
  },
  inactiveDot: {
    width: 8,
    height: 8,
  },
});

export default PaginationIndicator;