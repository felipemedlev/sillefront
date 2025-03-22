import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const DESKTOP_BREAKPOINT = 768;

export default function AIBoxScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDesktop && styles.desktopTitle]}>AI Box</Text>
      <Text style={styles.description}>Your AI-powered fragrance recommendations will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  desktopTitle: {
    fontSize: 32,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});