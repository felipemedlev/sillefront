import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, useWindowDimensions } from 'react-native'; // Import Animated and Platform
import { router } from 'expo-router';
import { COLORS, SPACING, FONTS, FONT_SIZES } from '../../types/constants';

const OCCASIONS = [
  { id: 1, title: 'Romántica', color: '#F5E6E6' },
  { id: 2, title: 'Casual', color: '#E6F0F5' },
  { id: 3, title: 'Formal', color: '#E6E6E6' },
  { id: 4, title: 'Noche', color: '#E6E6F5' },
  { id: 5, title: 'Deportiva', color: '#E6F5E6' },
  { id: 6, title: 'Viaje', color: '#F5E6F5' },
  { id: 7, title: 'Oficina', color: '#E6F5F5' },
  { id: 8, title: 'Fiesta', color: '#F5F5E6' },
  { id: 9, title: 'Relax', color: '#E6F5E6' },
  { id: 10, title: 'Especial', color: '#F5E6E6' },
];

const DESKTOP_BREAKPOINT = 768;

export default function AIBoxScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const shakeAnimation = useRef(new Animated.Value(0)).current; // Animation value

  useEffect(() => {
    // Start the shake animation when the component mounts
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 50, duration: 150, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -50, duration: 250, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 50, duration: 250, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 50, duration: 150, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -50, duration: 250, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 50, duration: 250, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start();
  }, [shakeAnimation]); // Dependency array includes shakeAnimation

  const handleOpenPress = () => {
    router.push('/aibox-selection');
  };

  // Interpolate rotation
  const rotateInterpolate = shakeAnimation.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-1deg', '1deg'] // Adjust degrees for desired shake intensity
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Main Card - Apply animation here */}
        <Animated.View style={[styles.mainCard, animatedStyle]}>
          <Text style={styles.subtitle}>Elección de la Inteligencia Artificial</Text>
          <Text style={styles.mainTitle}>¡Está listo tu Box AI!</Text>
          <Pressable style={styles.openButton} onPress={handleOpenPress}>
            <Text style={styles.openButtonText}>Abrir</Text>
          </Pressable>
        </Animated.View>

        {/* Occasions Section */}
        <Text style={styles.sectionTitle}>Box AI por Ocasión </Text>
        <View style={styles.occasionsGrid}>
          {OCCASIONS.map((occasion) => (
            <Pressable
              key={occasion.id}
              style={({ pressed }) => [
                styles.occasionCard,
                isDesktop && styles.occasionCardWeb,
                { backgroundColor: occasion.color },
                pressed && styles.occasionCardPressed,
              ]}
              onPress={() => router.push({ pathname: '/occasion-selection', params: { occasionIds: occasion.id } })} // Pass occasion ID
            >
              <Text style={styles.occasionTitle}>{occasion.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Manual Box Card */}
        <View style={styles.secondCard}>
          {/* <Feather name="edit-3" size={28} color={COLORS.PRIMARY} style={styles.cardIcon} /> */}
          <View style={styles.cardTextContainer}>
            <Text style={styles.subtitle}>Crea tu Propia Selección</Text>
            <Text style={styles.mainTitle}>Box Personalizado</Text>
          </View>
          <Pressable style={styles.openButton} onPress={() => router.push('../manual-box')}>
            <Text style={styles.openButtonText}>Configurar</Text>
          </Pressable>
        </View>
        {!isDesktop && <View style={{ marginBottom: 60 }} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 0,
    alignItems: 'center',
  },
  mainCard: {
    width: '100%',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 16,
    marginTop: SPACING.SMALL,
    padding: SPACING.LARGE,
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: SPACING.SMALL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  secondCard: { // Made less prominent
    width: '100%',
    backgroundColor: COLORS.BACKGROUND_ALT, // Different background
    borderRadius: 16,
    marginTop: SPACING.LARGE, // Increased margin top
    padding: SPACING.MEDIUM, // Reduced padding
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow offset
    shadowOpacity: 0.05, // Reduced shadow opacity
    shadowRadius: 4, // Reduced shadow radius
    elevation: 3, // Reduced elevation
    marginBottom: SPACING.SMALL,
    // Removed border
  },
  subtitle: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  mainTitle: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE,
    textAlign: 'center',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  openButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.XLARGE,
    paddingVertical: SPACING.SMALL,
    borderRadius: 8,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  openButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    alignSelf: 'flex-start',
  },
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  occasionCard: {
    width: '48%',
    aspectRatio: 2,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  occasionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  occasionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  // Removed manualCard style (merged into secondCard)
  cardIcon: {
    marginRight: SPACING.SMALL,
  },
  cardTextContainer: {
    flex: 1,
  },
  occasionCardWeb: {
    height: 80, // Adjust height as needed for web
    aspectRatio: undefined, // Explicitly unset aspect ratio on web
  },
});