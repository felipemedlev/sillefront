import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated, 
  Dimensions,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../assets/images/Logo.svg';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../types/constants';

const { width, height } = Dimensions.get('window');

export default function SurveyAuthGate() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    <LinearGradient
      colors={['#FFFEFC', '#F8F8F8']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
              width={width * 0.2} 
              height={width * 0.06} 
              preserveAspectRatio="xMidYMid meet" 
            />
            <Text style={styles.logoText}>¡Perfecto!</Text>
          </View>

          {/* Success Message */}
          <View style={styles.successSection}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={60} color={COLORS.SUCCESS} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.XLARGE,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  logoText: {
    fontSize: FONT_SIZES.LARGE,
    fontFamily: FONTS.INSTRUMENT_SERIF_ITALIC,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SMALL,
  },
  successSection: {
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  checkmarkContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  successTitle: {
    fontSize: FONT_SIZES.XLARGE + 2,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    marginBottom: SPACING.SMALL,
  },
  successSubtitle: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.MEDIUM,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: SPACING.XLARGE,
  },
  featuresTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    marginBottom: SPACING.LARGE,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.MEDIUM,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.ACCENT}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.XSMALL,
  },
  featureDescription: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    lineHeight: 18,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.ACCENT,
    paddingVertical: SPACING.MEDIUM + 2,
    paddingHorizontal: SPACING.XLARGE,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: SPACING.MEDIUM,
    shadowColor: COLORS.ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.REGULAR + 1,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginRight: SPACING.SMALL,
  },
  secondaryButton: {
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  secondaryButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  skipButton: {
    paddingVertical: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
  },
  skipButtonText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textDecorationLine: 'underline',
  },
});