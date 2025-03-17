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
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#000000',
  },
  inactiveDot: {
    backgroundColor: '#CCCCCC',
  },
});

export default PaginationIndicator;