import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { RatingsProvider } from '../context/RatingsContext';
import { ManualBoxProvider } from '../context/ManualBoxContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { FontLoadingState, LayoutStyles } from '../types/layout';
import { FONTS, COLORS, FONT_SIZES, SPACING } from '../types/constants';
import { handleError } from '../types/error';

function RootLayoutNav() {
  const [fontState, setFontState] = useState<FontLoadingState>({
    isLoading: true,
    error: null,
  });
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

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

  useEffect(() => {
    if (fontState.isLoading || isAuthLoading) {
      return;
    }

    const currentSegment = segments[0] ?? null;
    const inAuthGroup = currentSegment === 'auth';
    const isLanding = currentSegment === 'landing';

    if (user && (inAuthGroup || isLanding)) {
      router.replace('/(tabs)');
    } else if (currentSegment === 'home') {
      router.replace('/(tabs)');
    }
  }, [user, isAuthLoading, fontState.isLoading, segments, router]);

  if (fontState.isLoading || isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (fontState.error) {
    console.error('Error loading fonts:', fontState.error);
  }

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
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <SubscriptionProvider>
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
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  errorContainer: {
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