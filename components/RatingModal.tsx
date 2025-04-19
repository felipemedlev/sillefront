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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRatings } from '../context/RatingsContext';
import { useAuth } from '../src/context/AuthContext';
import { router } from 'expo-router';
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
  const { addRating, getRating } = useRatings();
  const { user, isAuthenticated } = useAuth();

  // When modal opens, fetch current rating
  useEffect(() => {
    if (visible) {
      fetchCurrentRating();
    }
  }, [visible, perfume.id]);

  const fetchCurrentRating = async () => {
    try {
      setIsLoading(true);

      if (isAuthenticated) {
        // If authenticated, try to get rating from API
        // console.log(`Fetching rating for perfume ID: ${perfume.id}`);
        const currentRating = await api.getRating(perfume.id);

        if (currentRating) {
          // console.log(`Rating found: ${currentRating.rating}`);
          setRating(currentRating.rating);
        } else {
          console.log(`No rating found for perfume ID: ${perfume.id}`);
          setRating(0);
        }
      } else {
        // If not authenticated, use local rating from the context we already have
        const localRating = getRating(perfume.id);
        // console.log(`Using local rating for perfume ID: ${perfume.id}, rating: ${localRating?.rating || 0}`);
        setRating(localRating?.rating || 0);
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
      // console.log('Adding rating for perfume:', perfume.id, 'rating:', selectedRating);

      if (isAuthenticated) {
        // If authenticated, submit to backend first
        // console.log(`Submitting rating to API for perfume ID: ${perfume.id}`);
        try {
          const result = await api.submitRating(perfume.id, selectedRating);
          // console.log(`Rating submission successful:`, result);
        } catch (submitError) {
          console.error(`API error when submitting rating:`, submitError);
          throw submitError; // Re-throw to be caught by the outer try/catch
        }
      } else {
        // If not authenticated, offer to login/signup
        const shouldContinue = await new Promise((resolve) => {
          Alert.alert(
            'No has iniciado sesión',
            'Puedes guardar tu calificación localmente, pero para sincronizar con tu cuenta necesitas iniciar sesión.',
            [
              {
                text: 'Iniciar sesión',
                onPress: () => {
                  resolve(false);
                  onClose();
                  router.push('/login');
                },
              },
              {
                text: 'Guardar localmente',
                onPress: () => resolve(true),
              },
            ]
          );
        });

        if (!shouldContinue) {
          setIsLoading(false);
          return;
        }
      }

      // Update local state regardless of authentication
      // console.log(`Updating local rating for perfume ID: ${perfume.id}`);
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
              {!isAuthenticated && (
                <Text style={styles.feedbackNote}>
                  Tu calificación se guardó localmente. Inicia sesión para sincronizarla con tu cuenta.
                </Text>
              )}
            </Animated.View>
          )}

          {!isAuthenticated && !showFeedback && !isLoading && (
            <Text style={styles.loginPrompt}>
              Inicia sesión para sincronizar tus calificaciones
            </Text>
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
    width: '100%',
  },
  feedbackText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  feedbackNote: {
    color: '#4A8055',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  loginPrompt: {
    color: '#666',
    fontSize: 14,
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});