import React, { useEffect } from 'react'; // Import React and useEffect
import { Stack, useRouter, useSegments } from 'expo-router'; // Import router and segments
import { SurveyProvider } from '../../../context/SurveyContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { COLORS } from '../../../types/constants'; // Import COLORS
import { Pressable } from 'react-native';
import { View, ActivityIndicator } from 'react-native'; // Import for loading indicator
import { Feather } from '@expo/vector-icons';

export default function ProfileLayout() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments(); // Keep default type inference

  useEffect(() => {
    // Wait for auth state to load
    if (isAuthLoading) {
      return;
    }

    // Check if we are inside the (profile) group - assuming structure is app/(tabs)/(profile)/screen
    // Use runtime check as type inference might be complex
    const isProfileTab = segments.length > 1 && segments[1] === '(profile)';
    // Get the last segment which represents the current screen file name (without extension)
    const currentScreen = segments[segments.length - 1];

    if (isProfileTab) {
      // If not logged in and not already on the auth-prompt screen, redirect there
      if (!user && currentScreen !== 'auth-prompt') {
        // Correct pathname including the group segment parentheses
        router.replace({ pathname: '/(tabs)/(profile)/auth-prompt' });
      }
      // If logged in and somehow landed on auth-prompt, redirect to the profile index
      else if (user && currentScreen === 'auth-prompt') {
         // Correct pathname for profile index (no trailing slash needed for directory index)
        router.replace({ pathname: '/(tabs)/(profile)' });
      }
    }
  }, [user, isAuthLoading, segments, router]);

  // Show a loading indicator while auth is loading to prevent flicker
  if (isAuthLoading) {
     return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND }}><ActivityIndicator color={COLORS.ACCENT} /></View>;
  }

  return (
    // SurveyProvider might only be needed for authenticated routes.
    // If SurveyContext depends on user being logged in, this structure is fine.
    // Otherwise, it could potentially wrap individual screens if needed.
    <SurveyProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.BACKGROUND } // Use constant
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
      </Stack>
    </SurveyProvider>
  );
}