import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        // This path assumes assets is at the root level (sibling to app folder)
        'InstrumentSans': require('../assets/fonts/InstrumentSans-Regular.ttf'),
        'InstrumentSerif': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
        'InstrumentSerifItalic': require('../assets/fonts/InstrumentSerif-Italic.ttf'),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFEFC' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFEFC' },
        animation: 'fade',
      }} />
    </>
  );
}