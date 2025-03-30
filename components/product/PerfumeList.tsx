import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { Perfume } from '../../types/perfume';

interface PerfumeListProps {
  selectedPerfumes: string[];
  onPerfumePress: (perfumeId: string) => void;
  onSwapPress: (perfumeId: string) => void;
  decantSize: number;
  perfumes: Perfume[];
}

const { height } = Dimensions.get('window');
const cardHeight = height * 0.3;

const PerfumeList: React.FC<PerfumeListProps> = ({
  selectedPerfumes,
  onPerfumePress,
  onSwapPress,
  decantSize,
  perfumes,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Perfumes Seleccionados</Text>
      {selectedPerfumes.map((perfumeId) => {
        const perfume = perfumes.find(p => p.id === perfumeId);
        if (!perfume) return null;

        return (
          <Pressable
            key={perfume.id}
            style={styles.perfumeCard}
            onPress={() => onPerfumePress(perfume.id)}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: perfume.thumbnailUrl }}
                style={styles.perfumeImage}
              />
              <Image
                source={require('../../assets/images/decant-general.png')}
                style={styles.decantIcon}
              />
            </View>
            <View style={styles.perfumeInfo}>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{perfume.matchPercentage}% AI Match</Text>
              </View>
              <Text style={styles.perfumeName}>{perfume.name}</Text>
              <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
              <Text style={styles.perfumePrice}>${(perfume.pricePerML ?? 0).toLocaleString()}/mL</Text>
              <Text style={styles.perfumeTotalPrice}>Total: ${((perfume.pricePerML ?? 0) * decantSize).toLocaleString()}</Text>
              <Pressable
                style={styles.swapButton}
                onPress={() => onSwapPress(perfume.id)}
              >
                <Text style={styles.swapButtonText}>Cambiar</Text>
              </Pressable>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  perfumeCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    height: cardHeight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 30,
  },
  decantIcon: {
    position: 'absolute',
    right: -10,
    bottom: '0%',
    width: 30,
    height: 70,
    resizeMode: 'contain',
  },
  matchBadge: {
    backgroundColor: '#809CAC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 20,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  perfumeImage: {
    width: cardHeight * 0.55,
    height: cardHeight * 0.55,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  perfumeInfo: {
    flex: 1,
  },
  perfumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  perfumeBrand: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  perfumePrice: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    marginBottom: 6,
  },
  perfumeTotalPrice: {
    fontSize: 17,
    fontWeight: '600',
    color: '#809CAC',
  },
  swapButton: {
    backgroundColor: '#F5F5F7',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  swapButtonText: {
    color: '#809CAC',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PerfumeList;