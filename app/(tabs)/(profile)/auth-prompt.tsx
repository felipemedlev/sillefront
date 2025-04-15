import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants';
import { SafeAreaView } from 'react-native-safe-area-context'; // Use SafeAreaView
import { useAuth } from '../../../src/context/AuthContext';

export default function AuthPromptScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect to profile index if user is logged in
  useEffect(() => {
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Ionicons name="person-circle-outline" size={80} color={COLORS.ACCENT} style={styles.icon} />
        <Text style={styles.title}>Accede a tu Perfil</Text>
        <Text style={styles.subtitle}>
          Inicia sesión o regístrate para ver tus compras, favoritos y más.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => router.push('/signup')}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.signupButtonText]}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_ALT, // Light background
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LARGE,
  },
  icon: {
    marginBottom: SPACING.LARGE,
  },
  title: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: '700', // Bold title
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
    marginBottom: SPACING.XLARGE, // More space before buttons
    lineHeight: FONT_SIZES.REGULAR * 1.4,
  },
  button: {
    width: '100%',
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 30, // Rounded buttons
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.MEDIUM,
    height: 55, // Match auth screen button height
  },
  loginButton: {
    backgroundColor: COLORS.ACCENT,
    elevation: 2, // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  signupButton: {
    backgroundColor: COLORS.BACKGROUND, // White background
    borderWidth: 1,
    borderColor: COLORS.ACCENT,
  },
  buttonText: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.BACKGROUND, // White text for primary button
  },
  signupButtonText: {
    color: COLORS.ACCENT, // Accent color text for secondary button
  },
});