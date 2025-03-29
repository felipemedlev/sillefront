import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRatings } from '../context/RatingsContext';

interface Perfume {
  id: string;
  name: string;
  brand: string;
  image: string;
}

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  perfume: Perfume;
}

export default function RatingModal({ visible, onClose, perfume }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const { addRating } = useRatings();

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
    addRating(perfume.id, selectedRating);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#222222" />
          </TouchableOpacity>

          <Image
            source={{ uri: perfume.image }}
            style={styles.perfumeImage}
            resizeMode="contain"
          />

          <Text style={styles.brandText}>{perfume.brand}</Text>
          <Text style={styles.nameText}>{perfume.name}</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRatingPress(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color="#FFD700"
                />
              </TouchableOpacity>
            ))}
          </View>

          {showFeedback && (
            <Animated.View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>¡Gracias por tu calificación!</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  perfumeImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  brandText: {
    fontSize: 16,
    color: '#717171',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  starButton: {
    padding: 8,
  },
  feedbackContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  feedbackText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '500',
  },
});