import React, { useEffect, useState, useCallback } from 'react';
import { SurveyProvider } from '../context/SurveyContext';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    console.log("app/_layout.tsx: useEffect - Font loading started");
    const loadFonts = async () => {
      try {
        console.log("app/_layout.tsx: Starting font loading");
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
    console.log("app/_layout.tsx: useEffect - Navigation check started", { fontsLoaded, segments });
    if (!fontsLoaded) return;

    const currentPath = segments[0] as string;
    if (fontsLoaded && currentPath === 'home') {
      router.replace('/(tabs)');
    }
  }, [segments, fontsLoaded]);

  // Remove the loading screen and just proceed with system fonts if custom fonts aren't loaded
  return (
      <>
        <View style={{ flex: 1 }}>
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
            <Stack.Screen name="landing/index" options={{ headerShown: false }} />
            <Stack.Screen name="survey" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
        </View>
      </>
  );
}