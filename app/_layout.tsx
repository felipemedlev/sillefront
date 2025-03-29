import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { RatingsProvider } from '../context/RatingsContext';
import { ManualBoxProvider } from '../context/ManualBoxContext'; // <-- Add this import
import { FontLoadingState, LayoutStyles } from '../types/layout';
import { FONTS, COLORS, FONT_SIZES, SPACING } from '../types/constants';
import { handleError } from '../types/error';

export default function RootLayout() {
  const [fontState, setFontState] = useState<FontLoadingState>({
    isLoading: true,
    error: null,
  });
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
    if (fontState.isLoading) return;

    const currentPath = segments[0] as string;
    if (currentPath === 'home') {
      router.replace('/(tabs)');
    }
  }, [segments, fontState.isLoading, router]);

  if (fontState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  if (fontState.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading fonts: {fontState.error}</Text>
        <Text style={styles.fallbackText}>Using system fonts instead</Text>
      </View>
    );
  }

  return (
    <ManualBoxProvider>
      <RatingsProvider>
        <View style={styles.container}>
          <StatusBar style="dark" translucent={true} />
          <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: styles.stackContent,
            animation: 'fade',
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              contentStyle: styles.stackContent,
            }}
          />
          {/* Add Manual Box screen to the main stack */}
          <Stack.Screen name="manual-box" options={{ headerShown: false }} />
          <Stack.Screen name="landing/index" options={{ headerShown: false }} />
          <Stack.Screen name="survey" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </View>
    </RatingsProvider>
  </ManualBoxProvider>
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
  },
  fallbackText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});