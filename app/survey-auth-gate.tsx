import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../assets/images/Logo.svg';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../types/constants';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;
const isMediumDevice = height >= 700 && height < 850;

// Responsive spacing helper
const getResponsiveSpacing = (base: number) => {
  if (isSmallDevice) return base * 0.6;
  if (isMediumDevice) return base * 0.8;
  return base;
};

// Responsive font size helper
const getResponsiveFontSize = (base: number) => {
  if (isSmallDevice) return base * 0.85;
  if (isMediumDevice) return base * 0.92;
  return base;
};

export default function SurveyAuthGate() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: 'sparkles',
      title: 'Recomendaciones personalizadas',
      description: 'Descubre perfumes únicos seleccionados especialmente para ti'
    },
    {
      icon: 'heart',
      title: 'Guarda tus favoritos',
      description: 'Crea tu colección personal y nunca pierdas un perfume que te guste'
    },
    {
      icon: 'trending-up',
      title: 'Mejora continua',
      description: 'Nuestro algoritmo aprende de tus gustos para mejores sugerencias'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#FFFEFC', '#F8F8F8']}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="auto"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Logo
                width={isSmallDevice ? width * 0.18 : width * 0.2}
                height={isSmallDevice ? width * 0.054 : width * 0.06}
                preserveAspectRatio="xMidYMid meet"
              />
              <Text style={styles.logoText}>¡Perfecto!</Text>
            </View>

            {/* Success Message */}
            <View style={styles.successSection}>
              <View style={styles.checkmarkContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={isSmallDevice ? 48 : 60}
                  color={COLORS.SUCCESS}
                />
              </View>
              <Text style={styles.successTitle}>
                Survey Completado
              </Text>
              <Text style={styles.successSubtitle}>
                Hemos procesado tus preferencias y encontrado perfumes increíbles para ti
              </Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>
                Crea tu cuenta para acceder a:
              </Text>
              {features.map((feature, index) => (
                <Animated.View
                  key={feature.icon}
                  style={[
                    styles.featureItem,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 20 * (index + 1)]
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.featureIcon}>
                    <Ionicons
                      name={feature.icon as any}
                      size={24}
                      color={COLORS.ACCENT}
                    />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => router.push('/(auth)/signup')}
              >
                <Text style={styles.primaryButtonText}>
                  Ver mis recomendaciones
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.secondaryButtonText}>
                  Ya tengo cuenta
                </Text>
              </Pressable>

              <Pressable
                style={styles.skipButton}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.skipButtonText}>
                  Explorar sin cuenta
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing(SPACING.LARGE),
    paddingVertical: getResponsiveSpacing(SPACING.MEDIUM),
    paddingTop: Platform.OS === 'android' ? getResponsiveSpacing(SPACING.SMALL) : 0,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(SPACING.SMALL),
  },
  logoText: {
    fontSize: getResponsiveFontSize(FONT_SIZES.LARGE),
    fontFamily: FONTS.INSTRUMENT_SERIF_ITALIC,
    color: COLORS.TEXT_PRIMARY,
    marginTop: getResponsiveSpacing(SPACING.XSMALL),
  },
  successSection: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(SPACING.MEDIUM),
  },
  checkmarkContainer: {
    marginBottom: getResponsiveSpacing(SPACING.SMALL),
  },
  successTitle: {
    fontSize: getResponsiveFontSize(FONT_SIZES.XLARGE + 2),
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(SPACING.XSMALL),
  },
  successSubtitle: {
    fontSize: getResponsiveFontSize(FONT_SIZES.REGULAR),
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 20 : 22,
    paddingHorizontal: getResponsiveSpacing(SPACING.MEDIUM),
  },
  featuresContainer: {
    width: '100%',
    marginBottom: getResponsiveSpacing(SPACING.MEDIUM),
  },
  featuresTitle: {
    fontSize: getResponsiveFontSize(FONT_SIZES.LARGE),
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(SPACING.MEDIUM),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing(SPACING.MEDIUM),
    backgroundColor: COLORS.BACKGROUND,
    padding: getResponsiveSpacing(SPACING.MEDIUM),
    borderRadius: isSmallDevice ? 10 : 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureIcon: {
    width: isSmallDevice ? 40 : 48,
    height: isSmallDevice ? 40 : 48,
    borderRadius: isSmallDevice ? 20 : 24,
    backgroundColor: `${COLORS.ACCENT}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveSpacing(SPACING.MEDIUM),
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: getResponsiveFontSize(FONT_SIZES.REGULAR),
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: getResponsiveSpacing(SPACING.XSMALL),
  },
  featureDescription: {
    fontSize: getResponsiveFontSize(FONT_SIZES.SMALL),
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    lineHeight: isSmallDevice ? 16 : 18,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.ACCENT,
    paddingVertical: getResponsiveSpacing(SPACING.MEDIUM + 2),
    paddingHorizontal: getResponsiveSpacing(SPACING.XLARGE),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // Minimum touch target size for accessibility (iOS: 44pt, Android: 48dp)
    minHeight: Platform.OS === 'ios' ? 44 : 48,
    marginBottom: getResponsiveSpacing(SPACING.MEDIUM),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.ACCENT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: getResponsiveFontSize(FONT_SIZES.REGULAR + 1),
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginRight: SPACING.SMALL,
  },
  secondaryButton: {
    paddingVertical: getResponsiveSpacing(SPACING.MEDIUM),
    paddingHorizontal: getResponsiveSpacing(SPACING.LARGE),
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    width: '100%',
    alignItems: 'center',
    minHeight: Platform.OS === 'ios' ? 44 : 48,
    marginBottom: getResponsiveSpacing(SPACING.MEDIUM),
  },
  secondaryButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: getResponsiveFontSize(FONT_SIZES.REGULAR),
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  skipButton: {
    paddingVertical: getResponsiveSpacing(SPACING.SMALL),
    paddingHorizontal: getResponsiveSpacing(SPACING.MEDIUM),
    minHeight: Platform.OS === 'ios' ? 44 : 48,
    justifyContent: 'center',
  },
  skipButtonText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: getResponsiveFontSize(FONT_SIZES.SMALL),
    fontFamily: FONTS.INSTRUMENT_SANS,
    textDecorationLine: 'underline',
  },
});