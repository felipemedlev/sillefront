import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../types/constants';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.BACKGROUND
        },
        animation: 'fade',
      }}
    />
  );
}