import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadFonts = async () => {
      try {
        console.log("Starting font loading");
        await Font.loadAsync({
          'InstrumentSans': require('../assets/fonts/InstrumentSans-Regular.ttf'),
          'InstrumentSerif': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
          'InstrumentSerifItalic': require('../assets/fonts/InstrumentSerif-Italic.ttf'),
        });
        console.log("Fonts loaded successfully");
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
        // Continue without custom fonts
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    const currentPath = segments[0] as string;
    if (currentPath === 'home') {
      router.replace('/(tabs)');
    }
  }, [segments, fontsLoaded]);

  // Remove the loading screen and just proceed with system fonts if custom fonts aren't loaded
  return (
    <>
      <StatusBar style="dark" translucent={true} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: {
          flex: 1,
          backgroundColor: '#FFFFFF'
        },
        animation: 'fade',
      }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            contentStyle: {
              flex: 1,
              backgroundColor: '#FFFFFF'
            }
          }}
        />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="survey" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}