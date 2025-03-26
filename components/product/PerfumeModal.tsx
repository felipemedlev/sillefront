import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Animated, StatusBar, Pressable, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ImageSourcePropType } from 'react-native';

interface Perfume {
  id: string;
  name: string;
  brand: string;
  matchPercentage: number;
  pricePerML: number;
  image: ImageSourcePropType;
  notes?: string[];
  description?: string;
}

// PerfumeModal Component
const PerfumeModal = ({
  perfume,
  slideAnim,
  onClose
}: {
  perfume: Perfume,
  slideAnim: Animated.Value,
  onClose: () => void
}) => {
  const { width } = Dimensions.get('window');

  return (
    <View style={styles.modalOverlay}>
      <StatusBar barStyle="dark-content" />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.handle} />

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={24} color="#333" />
        </Pressable>

        <View style={styles.modalContentContainer}>
          <View style={styles.modalImageContainer}>
            <Image source={perfume.image} style={styles.modalImage} />
            <View style={styles.modalMatchBadge}>
              <Text style={styles.modalMatchText}>{perfume.matchPercentage}% Match</Text>
            </View>
          </View>

          <View style={styles.modalDetailsContainer}>
            <Text style={styles.modalName}>{perfume.name}</Text>
            <Text style={styles.modalBrand}>{perfume.brand}</Text>
            <Text style={styles.modalPrice}>${perfume.pricePerML.toLocaleString()}/mL</Text>

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.modalDescription}>{perfume.description || 'No hay descripción disponible para este perfume.'}</Text>

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>Notas</Text>
            <View style={styles.modalNotesContainer}>
              {perfume.notes ? (
                perfume.notes.map((note, index) => (
                  <View key={index} style={styles.noteTag}>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.modalDescription}>No hay notas disponibles para este perfume.</Text>
              )}
            </View>

            <View style={styles.modalActionButtonContainer}>
              <Pressable style={styles.modalAddToCartButton} onPress={onClose}>
                <Text style={styles.modalAddToCartButtonText}>Agregar al Box</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    alignItems: 'center',
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1001,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  modalContentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalImageContainer: {
    alignItems: 'center',
    position: 'relative',
    marginTop: 20,
    marginBottom: 20,
  },
  modalImage: {
    width: width * 0.5,
    height: width * 0.5,
    resizeMode: 'contain',
  },
  modalMatchBadge: {
    backgroundColor: '#809CAC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalMatchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalDetailsContainer: {
    flex: 1,
    width: '100%',
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalBrand: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#809CAC',
    marginBottom: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  modalNotesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  noteTag: {
    backgroundColor: '#F0F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  noteText: {
    color: '#809CAC',
    fontSize: 14,
    fontWeight: '500',
  },
  modalActionButtonContainer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  modalAddToCartButton: {
    backgroundColor: '#809CAC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#809CAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalAddToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PerfumeModal;