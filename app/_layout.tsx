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
        await Font.loadAsync({
          'InstrumentSans': require('../assets/fonts/InstrumentSans-Regular.ttf'),
          'InstrumentSerif': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
          'InstrumentSerifItalic': require('../assets/fonts/InstrumentSerif-Italic.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFEFC' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" translucent={true} />
      <Stack screenOptions={{
        headerShown: false,
        // Remove the backgroundColor from contentStyle to prevent interference
        contentStyle: {
          flex: 1 // Keep flex: 1 to ensure proper layout
        },
        animation: 'fade',
      }}>
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            // Remove any background color here as well
            contentStyle: {
              flex: 1
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