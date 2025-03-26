import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Image, Modal, ScrollView } from 'react-native';
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

interface PerfumeModalProps {
  perfume: Perfume | null;
  onClose?: () => void;
}

export interface PerfumeModalRef {
  show: () => void;
  hide: () => void;
}

const PerfumeModal = forwardRef<PerfumeModalRef, PerfumeModalProps>((props, ref) => {
  const { perfume, onClose } = props;
  const { width } = Dimensions.get('window');

  useImperativeHandle(ref, () => ({
    show: () => {},
    hide: () => onClose?.()
  }));

  const handleClose = () => {
    onClose?.();
  };

  if (!perfume) {
    return null;
  }

  return (
    <Modal
      visible={!!perfume}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color="#333" />
          </Pressable>

          <ScrollView style={styles.scrollContainer}>
            <View style={styles.modalImageContainer}>
              <Image source={perfume.image} style={[styles.modalImage, { width: width * 0.5, height: width * 0.5 }]} />
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
              {perfume.notes && perfume.notes.length > 0 ? (
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
              <Pressable style={styles.modalAddToCartButton} onPress={handleClose}>
                <Text style={styles.modalAddToCartButtonText}>Agregar al Box</Text>
              </Pressable>
            </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

PerfumeModal.displayName = 'PerfumeModal';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalImageContainer: {
    alignItems: 'center',
    position: 'relative',
    marginTop: 10,
    marginBottom: 20,
  },
  modalImage: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
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
    marginTop: 20,
    paddingTop: 10,
    paddingBottom: 10,
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
  scrollContainer: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
  }
});

export default PerfumeModal;