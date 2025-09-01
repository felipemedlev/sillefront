import React, { useEffect } from 'react'; // Import React and useEffect
import { Stack, useRouter, useSegments } from 'expo-router'; // Import router and segments
import { useAuth } from '../../../src/context/AuthContext'; // Updated import after deleting duplicate
import { COLORS } from '../../../types/constants'; // Import COLORS
import { Pressable } from 'react-native';
import { View, ActivityIndicator, useWindowDimensions, Platform } from 'react-native'; // Import for loading indicator
import { Feather } from '@expo/vector-icons';

export default function ProfileLayout() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const DESKTOP_BREAKPOINT = 768;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const router = useRouter();
  const segments = useSegments(); // Keep default type inference

  useEffect(() => {
    // Don't do anything until auth state is completely loaded
    if (isAuthLoading) {
      return;
    }

    // Check if we're in the profile tab
    const isProfileTab = segments.length > 1 && segments[1] === '(profile)';
    if (!isProfileTab) return;

    // Get current screen
    const currentScreen = segments[segments.length - 1];

    console.log("Auth state:", { user, currentScreen, isAuthLoading, token: !!user });

    // Handle redirect logic
    if (!user) {
      // Not logged in - go to auth prompt (unless already there)
      if (currentScreen !== 'auth-prompt') {
        router.replace('/(tabs)/(profile)/auth-prompt');
      }
    } else {
      // Logged in - go to profile index if on auth prompt
      if (currentScreen === 'auth-prompt') {
        router.replace('/(tabs)/(profile)');
      }
    }
  }, [user, isAuthLoading, segments, router]);

  // Show loading indicator while auth state is loading
  if (isAuthLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFEFC'
        }}
      >
        <ActivityIndicator size="large" color={COLORS.ACCENT} />
      </View>
    );
  }

  return (
    // SurveyProvider might only be needed for authenticated routes.
    // If SurveyContext depends on user being logged in, this structure is fine.
    // Otherwise, it could potentially wrap individual screens if needed.
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFEFC' } // Match other screens
        }}
      >
        {/* Define screens within the profile stack */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="favorites"
          options={{
            title: 'Mis Favoritos',
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ marginLeft: 10, padding: 5 }}>
                <Feather name="chevron-left" size={24} color={COLORS.TEXT_PRIMARY} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="auth-prompt" options={{ headerShown: false }} />
        {/* Add other profile-related screens here */}
        <Stack.Screen
          name="personal-info"
          options={{
            title: 'Información Personal',
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ marginLeft: 10, padding: 5 }}>
                <Feather name="chevron-left" size={24} color={COLORS.TEXT_PRIMARY} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="change-password"
          options={{
            title: 'Cambiar Contraseña',
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ marginLeft: 10, padding: 5 }}>
                <Feather name="chevron-left" size={24} color={COLORS.TEXT_PRIMARY} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="purchases"
          options={{
            title: 'Mis Compras',
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ marginLeft: 10, padding: 5 }}>
                <Feather name="chevron-left" size={24} color={COLORS.TEXT_PRIMARY} />
              </Pressable>
            ),
          }}
        />
      </Stack>
    </>
  );
}