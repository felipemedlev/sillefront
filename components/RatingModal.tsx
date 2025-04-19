import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRatings } from '../context/RatingsContext';
import { useAuth } from '../src/context/AuthContext';
import * as api from '../src/services/api';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addRating } = useRatings();
  const { user } = useAuth();

  // When modal opens, fetch current rating
  useEffect(() => {
    if (visible) {
      fetchCurrentRating();
    }
  }, [visible, perfume.id]);

  const fetchCurrentRating = async () => {
    try {
      setIsLoading(true);
      const currentRating = await api.getRating(perfume.id);
      if (currentRating) {
        setRating(currentRating.rating);
      } else {
        setRating(0);
      }
    } catch (err) {
      console.error('Error fetching rating:', err);
      setError('No pudimos cargar tu calificación existente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingPress = async (selectedRating: number) => {
    try {
      setIsLoading(true);
      setRating(selectedRating);
      console.log('Adding rating for perfume:', perfume.id, 'rating:', selectedRating);

      // Submit to backend first
      await api.submitRating(perfume.id, selectedRating);

      // Then update local state
      addRating(perfume.id, selectedRating);

      setError(null);
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving rating:', err);
      setError('No pudimos guardar tu calificación. Por favor intenta de nuevo.');
      setShowFeedback(false);
    } finally {
      setIsLoading(false);
    }
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

          {isLoading ? (
            <ActivityIndicator size="large" color="#FFD700" style={{ marginVertical: 20 }} />
          ) : (
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
          )}

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

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
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});