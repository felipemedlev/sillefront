import React, { useEffect } from 'react';
import { Stack, Redirect, usePathname, useSegments } from 'expo-router';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { COLORS } from '../../../types/constants';

export default function RatingsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();

  // Debug log to understand routing
  useEffect(() => {
    console.log('Ratings layout auth check:', {
      isAuthenticated,
      isLoading,
      segments,
      pathname
    });
  }, [isAuthenticated, isLoading, segments, pathname]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={{ marginTop: 12, color: COLORS.TEXT_SECONDARY }}>Cargando...</Text>
      </View>
    );
  }

  // Redirect to auth-prompt if not authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to auth-prompt');
    return <Redirect href="/auth-prompt" />;
  }

  // User is authenticated, continue with the ratings section
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFEFC' }
      }}
    />
  );
}