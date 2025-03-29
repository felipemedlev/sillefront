import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type DecantCount = 4 | 8;
type DecantSize = 3 | 5 | 10;

interface DecantSelectorProps {
  decantCount: DecantCount;
  setDecantCount: (count: DecantCount) => void;
  decantSize: DecantSize;
  setDecantSize: (size: DecantSize) => void;
}

const DecantSelector: React.FC<DecantSelectorProps> = ({
  decantCount,
  setDecantCount,
  decantSize,
  setDecantSize,
}) => {
  return (
    <>
      {/* Decant Selection */}
      <View style={[styles.section, styles.filterSection]}>
        <Text style={[styles.sectionTitle, styles.filterTitle]}>Cantidad de Decants</Text>
        <View style={styles.decantCountContainer}>
          <Pressable
            style={[
              styles.decantCountButton,
              decantCount === 4 && styles.decantCountButtonActive,
            ]}
            onPress={() => setDecantCount(4)}
          >
            <Text style={[
              styles.decantCountText,
              decantCount === 4 && styles.decantCountTextActive,
            ]}>4 Decants</Text>
          </Pressable>
          <Pressable
            style={[
              styles.decantCountButton,
              decantCount === 8 && styles.decantCountButtonActive,
            ]}
            onPress={() => setDecantCount(8)}
          >
            <Text style={[
              styles.decantCountText,
              decantCount === 8 && styles.decantCountTextActive,
            ]}>8 Decants</Text>
          </Pressable>
        </View>
      </View>

      {/* Size Selection */}
      <View style={[styles.section, styles.filterSection]}>
        <Text style={[styles.sectionTitle, styles.filterTitle]}>Tamaño de Decants</Text>
        <View style={styles.sizeContainer}>
          {[3, 5, 10].map((size) => (
            <Pressable
              key={size}
              style={[
                styles.sizeButton,
                decantSize === size && styles.sizeButtonActive,
              ]}
              onPress={() => setDecantSize(size as DecantSize)}
            >
              <Text style={[
                styles.sizeText,
                decantSize === size && styles.sizeTextActive,
              ]}>{size}ml</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </>
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
  decantCountContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  decantCountButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  decantCountButtonActive: {
    backgroundColor: '#809CAC',
    borderColor: '#809CAC',
    elevation: 3,
  },
  decantCountText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  decantCountTextActive: {
    color: '#FFFFFF',
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  sizeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  sizeButtonActive: {
    backgroundColor: '#809CAC',
    borderColor: '#809CAC',
    elevation: 3,
  },
  sizeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sizeTextActive: {
    color: '#FFFFFF',
  },
});

export default DecantSelector;