import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Perfume } from '../../types/perfume';

interface PerfumeListProps {
  selectedPerfumes: string[];
  onPerfumePress: (perfumeId: string) => void;
  onRemovePerfume: (perfumeId: string) => void;
  onReplacePerfume: (perfumeId: string) => void;
  decantSize: number;
  perfumes: Perfume[];
}

const PerfumeList: React.FC<PerfumeListProps> = ({
  selectedPerfumes,
  onPerfumePress,
  onRemovePerfume,
  onReplacePerfume,
  decantSize,
  perfumes,
}) => {
  if (selectedPerfumes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.sectionTitle}>Perfumes Seleccionados</Text>
        <Text style={styles.emptyText}>No hay perfumes seleccionados</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.cardsContainer}>
        {selectedPerfumes.map((perfumeId) => {
          const perfume = perfumes.find(p => p.id === perfumeId);
          if (!perfume) return null;

          return (
            <View key={perfume.id} style={styles.card}>
              <View style={styles.actionsContainer}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onReplacePerfume(perfume.id)}
                >
                  <Feather name="refresh-cw" size={18} color="#809CAC" />
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onRemovePerfume(perfume.id)}
                >
                  <Feather name="x" size={18} color="#809CAC" />
                </Pressable>
              </View>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => onPerfumePress(perfume.id)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: perfume.thumbnail_url }}
                      style={styles.perfumeImage}
                      resizeMode="contain"
                    />
                    <Image
                      source={require('../../assets/images/decant-general.png')}
                      style={styles.decantIcon}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.infoContainer}>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{perfume.match_percentage}% AI Match</Text>
                    </View>

                    <Text
                      style={styles.perfumeName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {perfume.name}
                    </Text>

                    <Text
                      style={styles.perfumeBrand}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {perfume.brand}
                    </Text>

                    <View style={styles.priceContainer}>
                      <Text style={styles.perfumePrice}>
                        ${Math.round(perfume.pricePerML ?? 0).toLocaleString('es-CL')}/mL
                      </Text>
                      <Text style={styles.perfumeTotalPrice}>
                        Total: ${Math.round((perfume.pricePerML ?? 0) * decantSize).toLocaleString('es-CL')}
                      </Text>
                    </View>

                    <View style={styles.buttonGroup}>
                      <Pressable
                        style={styles.detailButton}
                        onPress={() => onPerfumePress(perfume.id)}
                      >
                        <View style={styles.buttonInner}>
                          <Feather name="info" size={14} color="#FFFFFF" style={styles.buttonIcon} />
                          <Text style={styles.detailButtonText}>Detalle</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor: '#FAFAFA',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  cardsContainer: {
    width: '100%',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfumeImage: {
    width: 100,
    height: 100,
    borderRadius: 6,
  },
  decantIcon: {
    position: 'absolute',
    right: 0,
    bottom: 5,
    width: 25,
    height: 60,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 4,
  },
  matchBadge: {
    backgroundColor: '#809CAC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  perfumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  perfumeBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 12,
  },
  perfumePrice: {
    fontSize: 14,
    color: '#666',
  },
  perfumeTotalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#809CAC',
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  detailButton: {
    backgroundColor: '#809CAC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 4,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PerfumeList;