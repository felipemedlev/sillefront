import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonBoxVisualizer } from '../ui/SkeletonLoader';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../types/constants';
import { shouldUseNativeDriver } from '../../src/utils/animation';

type AIBoxLoadingStateProps = {
  loadingMessage: string;
};

const AIBoxLoadingState: React.FC<AIBoxLoadingStateProps> = ({ loadingMessage }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: shouldUseNativeDriver,
    }).start();

    // Pulse animation for the icon
    const pulseLoop = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: shouldUseNativeDriver,
        }),
      ]).start(() => pulseLoop());
    };
    
    pulseLoop();
  }, []);

  const loadingSteps = [
    'Analizando tus preferencias de fragancia...',
    'Buscando perfumes perfectos para ti...',
    'Calculando compatibilidad de aromas...',
    'Preparando tu selección personalizada...'
  ];

  return (
    <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
      {/* AI Icon with pulse animation */}
      <Animated.View 
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <Ionicons name="sparkles" size={48} color={COLORS.ACCENT} />
      </Animated.View>

      {/* Main loading message */}
      <Text style={styles.mainMessage}>{loadingMessage}</Text>
      
      {/* Contextual description */}
      <Text style={styles.description}>
        Nuestro algoritmo de IA está analizando más de 1000 perfumes para encontrar tus opciones ideales
      </Text>

      {/* Skeleton visualization of what's coming */}
      <View style={styles.skeletonContainer}>
        <Text style={styles.skeletonTitle}>Preparando tu box personalizado...</Text>
        <SkeletonBoxVisualizer />
      </View>

      {/* Loading steps indicator */}
      <View style={styles.stepsContainer}>
        {loadingSteps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepIndicator,
              { backgroundColor: index <= 1 ? COLORS.ACCENT : COLORS.BORDER }
            ]} />
            <Text style={[
              styles.stepText,
              { color: index <= 1 ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY }
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Fun fact while loading */}
      <View style={styles.funFactContainer}>
        <Ionicons name="bulb-outline" size={16} color={COLORS.ACCENT} />
        <Text style={styles.funFact}>
          ¿Sabías que tenemos más de 15 familias olfativas diferentes?
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_ALT,
    padding: SPACING.LARGE,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.ACCENT}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  mainMessage: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  description: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.XLARGE,
    paddingHorizontal: SPACING.MEDIUM,
  },
  skeletonContainer: {
    width: '100%',
    marginBottom: SPACING.XLARGE,
  },
  skeletonTitle: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: SPACING.XLARGE,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.MEDIUM,
  },
  stepText: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
    flex: 1,
  },
  funFactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.ACCENT}10`,
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    width: '100%',
  },
  funFact: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginLeft: SPACING.SMALL,
    flex: 1,
    lineHeight: 18,
  },
});

export default AIBoxLoadingState;