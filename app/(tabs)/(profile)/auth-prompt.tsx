import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AuthPromptScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect to profile index if user is logged in
  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)/(profile)');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <LinearGradient
        colors={['#F8F9FA', '#F5F5F7', '#FFFFFF']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={70} color={COLORS.ACCENT} style={styles.icon} />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Accede a tu Perfil</Text>
            <Text style={styles.subtitle}>
              Inicia sesión o regístrate para acceder a calificaciones, ver tus compras, favoritos y más.
            </Text>

            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={() => router.push('/login')}
              activeOpacity={0.7}
            >
              <Ionicons name="log-in-outline" size={22} color={COLORS.BACKGROUND} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.signupButton]}
              onPress={() => router.push('/signup')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={22} color={COLORS.ACCENT} style={styles.buttonIcon} />
              <Text style={[styles.buttonText, styles.signupButtonText]}>Registrarse</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={22} color={COLORS.ACCENT} />
              <Text style={styles.infoText}>Al registrarte podrás guardar tus preferencias y gestionar pedidos.</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(249, 246, 243, 0.7)',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: SPACING.LARGE,
    paddingTop: 40,
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(225, 225, 225, 0.5)',
  },
  icon: {
    marginBottom: 0,
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: SPACING.LARGE,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(225, 225, 225, 0.5)',
    marginTop: SPACING.SMALL,
  },
  title: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    marginBottom: SPACING.SMALL,
  },
  subtitle: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
    marginBottom: SPACING.XLARGE,
    lineHeight: FONT_SIZES.REGULAR * 1.4,
  },
  button: {
    width: '100%',
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.MEDIUM,
    height: 55,
    flexDirection: 'row',
  },
  buttonIcon: {
    marginRight: SPACING.SMALL,
  },
  loginButton: {
    backgroundColor: COLORS.ACCENT,
    elevation: 2,
    boxShadow: '0px 1px 1.5px rgba(0, 0, 0, 0.2)',
  },
  signupButton: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.ACCENT,
  },
  buttonText: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.BACKGROUND,
  },
  signupButtonText: {
    color: COLORS.ACCENT,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 242, 0.6)',
    padding: SPACING.MEDIUM,
    borderRadius: 12,
    marginTop: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: 'rgba(225, 225, 225, 0.8)',
  },
  infoText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginLeft: 10,
    flex: 1,
    lineHeight: FONT_SIZES.SMALL * 1.3,
  },
});