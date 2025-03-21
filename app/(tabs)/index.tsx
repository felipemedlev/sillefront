import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../../assets/images/Logo.svg';

const DESKTOP_BREAKPOINT = 768;

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <Logo width={isDesktop ? 160 : 120} height={isDesktop ? 160 : 120} />
        </View>
        <Text style={[styles.welcomeText, isDesktop && styles.desktopWelcomeText]}>Bienvenido</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
    paddingTop: Platform.OS === 'web' ? 80 : 60, // Add padding for tab bar
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  desktopWelcomeText: {
    fontSize: 32,
  },
});
