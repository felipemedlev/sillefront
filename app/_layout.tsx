import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { RatingsProvider } from '../context/RatingsContext';
import { ManualBoxProvider } from '../context/ManualBoxContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext'; // <-- Import AuthProvider and useAuth
import { SubscriptionProvider } from '../context/SubscriptionContext'; // <-- Import SubscriptionProvider
import { FontLoadingState, LayoutStyles } from '../types/layout';
import { FONTS, COLORS, FONT_SIZES, SPACING } from '../types/constants';
import { handleError } from '../types/error';
// Optional: Import SplashScreen if you want to manage it during auth loading
// import * as SplashScreen from 'expo-splash-screen';

// SplashScreen.preventAutoHideAsync(); // Keep splash screen visible initially

function RootLayoutNav() {
  const [fontState, setFontState] = useState<FontLoadingState>({
    isLoading: true,
    error: null,
  });
  const { user, isLoading: isAuthLoading } = useAuth(); // Get auth state
  const router = useRouter();
  const segments = useSegments();

  // Load Fonts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          [FONTS.INSTRUMENT_SANS]: require('../assets/fonts/InstrumentSans-Regular.ttf'),
          [FONTS.INSTRUMENT_SERIF]: require('../assets/fonts/InstrumentSerif-Regular.ttf'),
          [FONTS.INSTRUMENT_SERIF_ITALIC]: require('../assets/fonts/InstrumentSerif-Italic.ttf'),
        });
        setFontState({ isLoading: false, error: null });
      } catch (error) {
        const appError = handleError(error);
        setFontState({
          isLoading: false,
          error: appError.message,
        });
      }
    };
    loadFonts();
  }, []);

  // Authentication and Routing Logic (Revised)
  useEffect(() => {
    // Wait for both fonts and auth state to load
    if (fontState.isLoading || isAuthLoading) {
      return;
    }

    const currentSegment = segments[0] ?? null; // Get the first segment safely
    const inAuthGroup = currentSegment === 'auth';
    const isLanding = currentSegment === 'landing';

    // If user is logged in and tries to access auth or landing, redirect to tabs
    if (user && (inAuthGroup || isLanding)) {
      router.replace('/(tabs)');
    }
    // Handle initial redirect from 'home' if necessary (e.g., if '/' maps to 'home')
    // This might be redundant if your index route correctly redirects.
    else if (currentSegment === 'home') {
       router.replace('/(tabs)');
    }
    // No redirection needed here for unauthenticated users trying to access other routes like '/(tabs)'
    // Protection for specific tabs (like profile) is handled in their respective layouts.

    // Optional: Hide splash screen once everything is ready
    // SplashScreen.hideAsync();

  }, [user, isAuthLoading, fontState.isLoading, segments, router]);

  // Loading State (covers both font and auth loading)
  if (fontState.isLoading || isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Font Error State
  if (fontState.error) {
    // Still render the stack but show an error message or use fallback
    console.error("Error loading fonts:", fontState.error);
    // You might want a more robust error UI here
  }

  // Render the main navigation stack
  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent={true} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.stackContent,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="landing/index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            contentStyle: styles.stackContent,
          }}
        />
        <Stack.Screen name="manual-box" options={{ headerShown: false }} />
        <Stack.Screen name="survey" options={{ headerShown: false }} />
        {/* Add other top-level screens if needed */}
      </Stack>
    </View>
  );
}


export default function RootLayout() {
  // Wrap everything with AuthProvider first, then other providers
  return (
    <AuthProvider>
      <CartProvider>
        <SubscriptionProvider> {/* Wrap inside CartProvider */}
          <ManualBoxProvider>
            <RatingsProvider>
              <RootLayoutNav />
            </RatingsProvider>
          </ManualBoxProvider>
        </SubscriptionProvider>
      </CartProvider>
    </AuthProvider>
  );
}

const styles: LayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContent: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS, // Use loaded font if available, otherwise system default
  },
  errorContainer: { // Keep error styles if needed for font errors specifically
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
  },
  errorText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: SPACING.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  fallbackText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
});